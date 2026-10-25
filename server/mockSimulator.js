/**
 * Virtual Hardware Simulator for Smart Parking System
 * Provides clean zero-hardware standby and on-demand testing.
 * DOES NOT generate random phantom traffic. Stays strictly stable until physical
 * Arduino inputs arrive or explicit user simulation buttons are triggered.
 */

export class VirtualParkingSimulator {
  constructor(options = {}) {
    this.totalCapacity = options.totalCapacity || 4;
    this.availableSlots = this.totalCapacity;
    this.occupiedSlots = 0;
    this.deniedEntries = 0;
    this.gateState = 'CLOSED'; // 'CLOSED' | 'OPEN' | 'MANUAL_HOLD'
    this.gateOpenTimer = null;
    this.telemetryCallback = options.onTelemetry || (() => {});

    this.isRunning = false;
    this.telemetryIntervalTimer = null;

    // Simulation timing parameters
    this.holdTimeMs = 3000;
    this.telemetryRateMs = 1000;
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    console.log('[SIMULATOR] Standby Mode Initialized (No random traffic). Slots: 4/4 Available, Gate: CLOSED.');

    // Initial broadcast
    this.broadcast();

    // Heartbeat broadcast to keep WebSocket clients updated
    this.telemetryIntervalTimer = setInterval(() => {
      this.broadcast();
    }, this.telemetryRateMs);
  }

  stop() {
    this.isRunning = false;
    clearInterval(this.telemetryIntervalTimer);
    clearTimeout(this.gateOpenTimer);
    console.log('[SIMULATOR] Simulator Stopped.');
  }

  /**
   * On-demand simulation trigger: Only runs when user clicks on UI or sends command
   */
  simulateEntry() {
    if (this.availableSlots > 0) {
      this.availableSlots--;
      this.occupiedSlots++;
      this.triggerGateSequence();
      this.broadcast();
      return { success: true, message: 'Vehicle entered', occupied: this.occupiedSlots };
    } else {
      this.deniedEntries++;
      this.broadcast();
      return { success: false, message: 'Parking full, entry denied', denied: this.deniedEntries };
    }
  }

  simulateExit() {
    if (this.occupiedSlots > 0) {
      this.occupiedSlots--;
      this.availableSlots++;
      this.triggerGateSequence();
      this.broadcast();
      return { success: true, message: 'Vehicle exited', occupied: this.occupiedSlots };
    } else {
      return { success: false, message: 'Parking is already empty' };
    }
  }

  triggerGateSequence() {
    if (this.gateState === 'MANUAL_HOLD') return;

    this.gateState = 'OPEN';
    clearTimeout(this.gateOpenTimer);

    this.gateOpenTimer = setTimeout(() => {
      if (this.gateState !== 'MANUAL_HOLD') {
        this.gateState = 'CLOSED';
        this.broadcast();
      }
    }, this.holdTimeMs);
  }

  handleCommand(cmd) {
    const cleaned = cmd.trim();
    console.log(`[SIMULATOR] Received Command: "${cleaned}"`);

    if (cleaned === 'CMD:OPEN_GATE') {
      clearTimeout(this.gateOpenTimer);
      this.gateState = 'MANUAL_HOLD';
      this.broadcast();
      return true;
    } else if (cleaned === 'CMD:CLOSE_GATE') {
      clearTimeout(this.gateOpenTimer);
      this.gateState = 'CLOSED';
      this.broadcast();
      return true;
    } else if (cleaned === 'CMD:SIMULATE_ENTRY') {
      this.simulateEntry();
      return true;
    } else if (cleaned === 'CMD:SIMULATE_EXIT') {
      this.simulateExit();
      return true;
    } else if (cleaned === 'CMD:RESET_STATS') {
      this.availableSlots = this.totalCapacity;
      this.occupiedSlots = 0;
      this.deniedEntries = 0;
      this.gateState = 'CLOSED';
      clearTimeout(this.gateOpenTimer);
      this.broadcast();
      return true;
    }
    return false;
  }

  broadcast() {
    const payload = {
      availableSlots: this.availableSlots,
      occupiedSlots: this.occupiedSlots,
      totalCapacity: this.totalCapacity,
      deniedCount: this.deniedEntries,
      gateState: this.gateState,
      mode: 'DISCONNECTED',
      timestamp: new Date().toISOString()
    };
    this.telemetryCallback(payload);
  }

  getState() {
    return {
      availableSlots: this.availableSlots,
      occupiedSlots: this.occupiedSlots,
      totalCapacity: this.totalCapacity,
      deniedCount: this.deniedEntries,
      gateState: this.gateState,
      mode: 'DISCONNECTED',
      timestamp: new Date().toISOString()
    };
  }
}
