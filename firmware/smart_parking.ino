/**
 * Smart Car Parking System - Production Firmware
 * Target MCU: Arduino UNO R3 (ATmega328P)
 *
 * Physical Pinout Specification:
 * - Servo Motor (SG90): Pin 2 (PWM)
 * - Ultrasonic Sensor 1 (Entry HC-SR04): Trig Pin 6, Echo Pin 7
 * - Ultrasonic Sensor 2 (Exit HC-SR04): Trig Pin 8, Echo Pin 9
 * - 16x2 LCD with I2C module (PCF8574): A4 (SDA), A5 (SCL)
 * - Power: 5V Rail with 100uF-470uF decoupling capacitor, Common GND
 *
 * Critical Fixes & Enhancements:
 * 1. Bounded pulseIn(..., 25000UL) timeout prevents 1000ms freeze and false 0cm readings.
 * 2. Non-blocking state sampling via millis().
 * 3. Structured serial telemetry over USB UART at 9600 baud:
 *    DATA:<AVAILABLE_SLOTS>,<OCCUPIED_SLOTS>,<TOTAL_CAPACITY>,<DENIED_ENTRIES>,<GATE_STATE>\n
 * 4. Serial command dispatcher for remote cloud overrides:
 *    - CMD:OPEN_GATE   -> Lifts barrier into MANUAL_HOLD
 *    - CMD:CLOSE_GATE  -> Lowers barrier into CLOSED
 *    - CMD:RESET_STATS -> Resets counters to initial state
 */

#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <Servo.h>

// --- Physical Pin Assignments ---
const uint8_t SERVO_PIN      = 2;
const uint8_t ENTRY_TRIG_PIN = 6;
const uint8_t ENTRY_ECHO_PIN = 7;
const uint8_t EXIT_TRIG_PIN  = 8;
const uint8_t EXIT_ECHO_PIN  = 9;

// --- Operational Constants ---
const uint8_t TOTAL_CAPACITY            = 4;     // Default 4 slots
const long    DETECTION_THRESHOLD_CM    = 10;    // Trigger distance in cm
const unsigned long GATE_HOLD_TIME_MS   = 3000;  // Gate stays open 3s
const unsigned long TELEMETRY_INTERVAL  = 500;   // Telemetry broadcast interval (ms)
const unsigned long SENSOR_SAMPLE_RATE  = 60;    // Distance sample rate (ms)

// --- Hardware Object Instances ---
// Default PCF8574 address is 0x27 (or 0x3F on some modules)
LiquidCrystal_I2C lcd(0x27, 16, 2);
Servo barrierServo;

// --- System State Variables ---
int availableSlots = TOTAL_CAPACITY;
int occupiedSlots  = 0;
unsigned long deniedEntries = 0;

enum GateState {
  GATE_CLOSED,
  GATE_OPEN,
  GATE_MANUAL_HOLD
};

GateState currentGateState = GATE_CLOSED;
unsigned long gateOpenTimestamp = 0;
unsigned long lastTelemetryTimestamp = 0;
unsigned long lastSensorSampleTimestamp = 0;

bool entrySensorActive = false;
bool exitSensorActive  = false;

// --- Function Prototypes ---
long getDistanceSafe(uint8_t trigPin, uint8_t echoPin);
void handleSerialCommands();
void broadcastTelemetry();
void updateLcdDisplay();
void setGate(bool open, bool manual = false);

void setup() {
  // Initialize USB Serial communication at 9600 baud
  Serial.begin(9600);

  // Configure HC-SR04 ultrasonic pins
  pinMode(ENTRY_TRIG_PIN, OUTPUT);
  pinMode(ENTRY_ECHO_PIN, INPUT);
  pinMode(EXIT_TRIG_PIN, OUTPUT);
  pinMode(EXIT_ECHO_PIN, INPUT);

  // Initialize SG90 Servo (Pin 2)
  barrierServo.attach(SERVO_PIN);
  barrierServo.write(0); // 0 degrees = Closed / Horizontal

  // Initialize 16x2 I2C LCD
  lcd.init();
  lcd.backlight();
  lcd.setCursor(0, 0);
  lcd.print("Smart Parking OS");
  lcd.setCursor(0, 1);
  lcd.print("Booting v1.0.0..");
  delay(1000);

  updateLcdDisplay();
  broadcastTelemetry();
}

void loop() {
  unsigned long now = millis();

  // 1. Process incoming commands from Node.js Bridge (CMD:OPEN_GATE, etc.)
  handleSerialCommands();

  // 2. Non-blocking Ultrasonic Distance Polling
  if (now - lastSensorSampleTimestamp >= SENSOR_SAMPLE_RATE) {
    lastSensorSampleTimestamp = now;

    long entryDist = getDistanceSafe(ENTRY_TRIG_PIN, ENTRY_ECHO_PIN);
    long exitDist  = getDistanceSafe(EXIT_TRIG_PIN, EXIT_ECHO_PIN);

    // Entry Sensor Logic (HC-SR04 #1)
    if (entryDist > 0 && entryDist <= DETECTION_THRESHOLD_CM) {
      if (!entrySensorActive && currentGateState != GATE_MANUAL_HOLD) {
        entrySensorActive = true;
        if (availableSlots > 0) {
          availableSlots--;
          occupiedSlots++;
          setGate(true, false);
          updateLcdDisplay();
          broadcastTelemetry();
        } else {
          // Denied Service Event (Lot Full)
          deniedEntries++;
          lcd.clear();
          lcd.setCursor(0, 0);
          lcd.print("PARKING FULL!");
          lcd.setCursor(0, 1);
          lcd.print("Entry Refused");
          broadcastTelemetry();
          delay(1000); // Brief warning latch
          updateLcdDisplay();
        }
      }
    } else {
      entrySensorActive = false;
    }

    // Exit Sensor Logic (HC-SR04 #2)
    if (exitDist > 0 && exitDist <= DETECTION_THRESHOLD_CM) {
      if (!exitSensorActive && currentGateState != GATE_MANUAL_HOLD) {
        exitSensorActive = true;
        if (occupiedSlots > 0) {
          occupiedSlots--;
          availableSlots++;
          setGate(true, false);
          updateLcdDisplay();
          broadcastTelemetry();
        }
      }
    } else {
      exitSensorActive = false;
    }
  }

  // 3. Automatic Gate Closure Timeout (Only in automated mode)
  if (currentGateState == GATE_OPEN && (now - gateOpenTimestamp >= GATE_HOLD_TIME_MS)) {
    setGate(false, false);
    updateLcdDisplay();
    broadcastTelemetry();
  }

  // 4. Periodic Telemetry Heartbeat
  if (now - lastTelemetryTimestamp >= TELEMETRY_INTERVAL) {
    lastTelemetryTimestamp = now;
    broadcastTelemetry();
  }
}

/**
 * Robust non-blocking distance sampling function.
 * Eliminates standard 1-second pulseIn timeout bug with 25000us cap.
 */
long getDistanceSafe(uint8_t trigPin, uint8_t echoPin) {
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);

  // 25ms timeout corresponds to approx 4.25 meters max range
  unsigned long duration = pulseIn(echoPin, HIGH, 25000UL);
  if (duration == 0) {
    return 999; // Out of range sentinel
  }

  long distanceCm = duration * 0.034 / 2;
  return (distanceCm <= 0) ? 999 : distanceCm;
}

/**
 * Actuates SG90 servo motor barrier.
 */
void setGate(bool open, bool manual) {
  if (open) {
    barrierServo.write(90); // 90 degrees = Raised / Open
    currentGateState = manual ? GATE_MANUAL_HOLD : GATE_OPEN;
    gateOpenTimestamp = millis();
  } else {
    barrierServo.write(0);  // 0 degrees = Lowered / Closed
    currentGateState = GATE_CLOSED;
  }
}

/**
 * Synchronizes hardware 16x2 I2C LCD character buffer.
 */
void updateLcdDisplay() {
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("HAVE LOT: ");
  lcd.print(availableSlots);
  lcd.print("/");
  lcd.print(TOTAL_CAPACITY);

  lcd.setCursor(0, 1);
  if (availableSlots == 0) {
    lcd.print("STATUS: FULL");
  } else {
    lcd.print("WELCOME TO PARK");
  }
}

/**
 * Formats and broadcasts structured telemetry over USB CDC serial.
 */
void broadcastTelemetry() {
  const char* gateStr = (currentGateState == GATE_OPEN) ? "OPEN" :
                        (currentGateState == GATE_MANUAL_HOLD) ? "MANUAL_HOLD" : "CLOSED";
  Serial.print("DATA:");
  Serial.print(availableSlots);
  Serial.print(",");
  Serial.print(occupiedSlots);
  Serial.print(",");
  Serial.print(TOTAL_CAPACITY);
  Serial.print(",");
  Serial.print(deniedEntries);
  Serial.print(",");
  Serial.println(gateStr);
}

/**
 * Handles incoming supervisor commands from the web bridge.
 */
void handleSerialCommands() {
  while (Serial.available() > 0) {
    String cmd = Serial.readStringUntil('\n');
    cmd.trim();
    if (cmd == "CMD:OPEN_GATE") {
      setGate(true, true);
      broadcastTelemetry();
    } else if (cmd == "CMD:CLOSE_GATE") {
      setGate(false, false);
      broadcastTelemetry();
    } else if (cmd == "CMD:RESET_STATS") {
      availableSlots = TOTAL_CAPACITY;
      occupiedSlots = 0;
      deniedEntries = 0;
      setGate(false, false);
      updateLcdDisplay();
      broadcastTelemetry();
    }
  }
}
