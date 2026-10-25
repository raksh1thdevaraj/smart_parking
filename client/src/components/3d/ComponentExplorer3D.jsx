import React, { useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float } from '@react-three/drei';
import * as THREE from 'three';
import { Cpu, Zap, Radio, Shield, ChevronRight } from 'lucide-react';

// --- 3D Model 1: High-Detail HC-SR04 Ultrasonic Sensor ---
function Sensor3DModel({ isPulsing = true }) {
  const meshRef = useRef();
  const waveRef1 = useRef();
  const waveRef2 = useRef();

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.4;
    }
    if (waveRef1.current) {
      waveRef1.current.position.z = 0.5 + ((state.clock.elapsedTime * 1.5) % 1.5);
      waveRef1.current.scale.setScalar(0.5 + ((state.clock.elapsedTime * 1.5) % 1.5) * 1.2);
    }
    if (waveRef2.current) {
      waveRef2.current.position.z = 0.5 + (((state.clock.elapsedTime * 1.5) + 0.75) % 1.5);
      waveRef2.current.scale.setScalar(0.5 + (((state.clock.elapsedTime * 1.5) + 0.75) % 1.5) * 1.2);
    }
  });

  return (
    <group ref={meshRef}>
      {/* PCB Substrate */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2.2, 1.1, 0.12]} />
        <meshStandardMaterial color="#065f46" roughness={0.4} metalness={0.2} />
      </mesh>

      {/* Crystal Oscillator */}
      <mesh position={[0, -0.3, 0.1]}>
        <boxGeometry args={[0.35, 0.18, 0.08]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Transducer Cylinder 1 (Transmitter 'T') */}
      <group position={[-0.6, 0.05, 0.35]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.38, 0.38, 0.6, 24]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0, 0.31]}>
          <circleGeometry args={[0.35, 24]} />
          <meshStandardMaterial color="#475569" roughness={0.8} />
        </mesh>
      </group>

      {/* Transducer Cylinder 2 (Receiver 'R') */}
      <group position={[0.6, 0.05, 0.35]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.38, 0.38, 0.6, 24]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0, 0.31]}>
          <circleGeometry args={[0.35, 24]} />
          <meshStandardMaterial color="#475569" roughness={0.8} />
        </mesh>
      </group>

      {/* 4 Header Pins (VCC, Trig, Echo, GND) */}
      {[-0.3, -0.1, 0.1, 0.3].map((x, i) => (
        <mesh key={i} position={[x, -0.65, 0]}>
          <cylinderGeometry args={[0.025, 0.025, 0.3, 8]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.9} />
        </mesh>
      ))}

      {/* Ultrasonic Pulse Waves */}
      {isPulsing && (
        <group position={[0, 0.05, 0]}>
          <mesh ref={waveRef1}>
            <ringGeometry args={[0.3, 0.45, 24]} />
            <meshBasicMaterial color="#00F0FF" transparent opacity={0.5} side={THREE.DoubleSide} />
          </mesh>
          <mesh ref={waveRef2}>
            <ringGeometry args={[0.3, 0.45, 24]} />
            <meshBasicMaterial color="#00F0FF" transparent opacity={0.3} side={THREE.DoubleSide} />
          </mesh>
        </group>
      )}
    </group>
  );
}

// --- 3D Model 2: High-Detail SG90 Micro Servo ---
function Servo3DModel() {
  const meshRef = useRef();
  const armRef = useRef();

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.3;
    }
    if (armRef.current) {
      // Rotate horn smoothly between 0 and 90 degrees
      const angle = (Math.sin(state.clock.elapsedTime * 2) + 1) * 0.5 * (Math.PI / 2);
      armRef.current.rotation.z = angle;
    }
  });

  return (
    <group ref={meshRef}>
      {/* Translucent Blue Housing */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1.2, 1.4, 0.6]} />
        <meshStandardMaterial color="#0284c7" transparent opacity={0.85} roughness={0.2} />
      </mesh>

      {/* Side Mounting Tabs */}
      <mesh position={[0, 0.25, 0]}>
        <boxGeometry args={[1.7, 0.12, 0.55]} />
        <meshStandardMaterial color="#0369a1" roughness={0.4} />
      </mesh>

      {/* Gear Top Tower */}
      <mesh position={[0.25, 0.85, 0]}>
        <cylinderGeometry args={[0.28, 0.28, 0.3, 20]} />
        <meshStandardMaterial color="#e2e8f0" metalness={0.3} roughness={0.2} />
      </mesh>

      {/* Rotating Servo Arm Horn */}
      <group ref={armRef} position={[0.25, 1.05, 0]}>
        <mesh position={[-0.45, 0, 0]}>
          <boxGeometry args={[1.0, 0.12, 0.12]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.3} />
        </mesh>
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.16, 0.16, 0.14, 16]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.7} />
        </mesh>
      </group>

      {/* 3-Wire Ribbon Cable (Signal, VCC, GND) */}
      <group position={[-0.6, -0.6, 0]}>
        <mesh position={[0, 0, 0.06]}>
          <boxGeometry args={[0.4, 0.08, 0.06]} />
          <meshStandardMaterial color="#f59e0b" /> {/* Orange Signal */}
        </mesh>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.4, 0.08, 0.06]} />
          <meshStandardMaterial color="#ef4444" /> {/* Red 5V */}
        </mesh>
        <mesh position={[0, 0, -0.06]}>
          <boxGeometry args={[0.4, 0.08, 0.06]} />
          <meshStandardMaterial color="#334155" /> {/* Brown GND */}
        </mesh>
      </group>
    </group>
  );
}

// --- 3D Model 3: High-Detail Arduino UNO R3 & I2C LCD ---
function ArduinoAndLcd3DModel() {
  const groupRef = useRef();

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.3;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Arduino Blue PCB */}
      <mesh position={[0, -0.4, 0]}>
        <boxGeometry args={[2.4, 0.1, 1.7]} />
        <meshStandardMaterial color="#00878F" roughness={0.4} metalness={0.1} />
      </mesh>

      {/* ATmega328P DIP IC */}
      <mesh position={[0.2, -0.3, 0.2]}>
        <boxGeometry args={[1.3, 0.14, 0.35]} />
        <meshStandardMaterial color="#0f172a" roughness={0.7} />
      </mesh>

      {/* USB Type-B Port */}
      <mesh position={[-1.05, -0.2, -0.4]}>
        <boxGeometry args={[0.5, 0.35, 0.45]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* DC Barrel Jack */}
      <mesh position={[-1.05, -0.2, 0.5]}>
        <boxGeometry args={[0.55, 0.35, 0.45]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>

      {/* 16x2 Character LCD Display (Elevated) */}
      <group position={[0, 0.6, 0]}>
        {/* LCD Green/Blue PCB */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[2.5, 0.9, 0.1]} />
          <meshStandardMaterial color="#14532d" roughness={0.4} />
        </mesh>
        {/* Backlit Display Screen */}
        <mesh position={[0, 0, 0.08]}>
          <boxGeometry args={[2.0, 0.55, 0.04]} />
          <meshStandardMaterial color="#0284c7" emissive="#0284c7" emissiveIntensity={0.8} />
        </mesh>
        {/* I2C Backpack on Back */}
        <mesh position={[0.5, 0, -0.1]}>
          <boxGeometry args={[0.9, 0.5, 0.1]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
      </group>
    </group>
  );
}

export function ComponentExplorer3D() {
  const [activeComponent, setActiveComponent] = useState('HC_SR04');

  const components = {
    HC_SR04: {
      title: 'HC-SR04 Ultrasonic Distance Sensor',
      role: 'Dual-Transducer Proximity Detector',
      pinout: 'VCC (5V), Trig (Pin 6/8), Echo (Pin 7/9), GND',
      mathFormula: 'Distance = (Echo Duration × 0.034) / 2 cm',
      fixTitle: '25ms Non-Blocking Timeout Mitigation',
      fixDesc: 'Fixed default 1000ms pulseIn freeze bug with pulseIn(echoPin, HIGH, 25000UL). Eliminates false 0cm readings and barrier misfires.',
      specs: [
        'Operating Frequency: 40 kHz Sound Bursts',
        'Effective Range: 2 cm to 400 cm',
        'Trigger Pulse: 10µs TTL Active-HIGH',
        'Loop Sample Rate: 60ms Non-Blocking Polling'
      ],
      model: <Sensor3DModel />
    },
    SG90: {
      title: 'TowerPro SG90 9g Micro Servo',
      role: 'Automated Boom Barrier Actuator',
      pinout: 'PWM Signal (Pin 2), Power Rail (5V), Common GND',
      mathFormula: 'Rotational Kinematics: 0° (Closed) ➔ 90° (Open)',
      fixTitle: 'Power Rail Decoupling Integrity',
      fixDesc: '100µF–470µF low-ESR capacitor placed across 5V/GND leads absorbs inrush currents, preventing ATmega328P brown-out resets.',
      specs: [
        'Operating Speed: 0.12 sec / 60 degrees',
        'Stall Torque: 1.8 kg·cm (at 4.8V)',
        'PWM Frame: 50Hz (20ms period, 1ms–2ms pulse)',
        'Auto Hold Latch: 3000ms before auto-close'
      ],
      model: <Servo3DModel />
    },
    ARDUINO_LCD: {
      title: 'Arduino UNO R3 & 16x2 I2C Display',
      role: 'ATmega328P State Machine & Driver Display',
      pinout: 'A4 (SDA), A5 (SCL), 5V, GND | USB CDC UART (9600 Baud)',
      mathFormula: 'TWI Bus Address: 0x27 (PCF8574 Backpack)',
      fixTitle: 'Structured Serial CDC Telemetry',
      fixDesc: 'Non-blocking serial streaming emits DATA:S,O,T,D,G every 500ms over USB UART directly to the Node.js WebSocket bridge.',
      specs: [
        'MCU: ATmega328P 16MHz Clock, 2KB SRAM',
        'I2C Bus: 100kHz Standard Mode with pull-ups',
        'Driver Notice: HAVE LOT: X/4 or STATUS: FULL',
        'Bidirectional Overrides: CMD:OPEN_GATE, CMD:RESET_STATS'
      ],
      model: <ArduinoAndLcd3DModel />
    }
  };

  const comp = components[activeComponent];

  return (
    <section className="py-20 px-4 sm:px-8 max-w-7xl mx-auto border-t border-slate-800/80">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <span className="text-xs font-mono font-bold text-blue-700 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
          Hardware Deep-Dive
        </span>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-3">
          Interactive 3D Component Explorer
        </h2>
        <p className="text-slate-600 text-sm mt-2">
          Inspect procedural, isolated 3D models with kinematics, electrical specifications, and firmware optimizations.
        </p>

        {/* Tab Switcher */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
          {[
            { id: 'HC_SR04', label: 'HC-SR04 Ultrasonic (Sensors 1 & 2)' },
            { id: 'SG90', label: 'SG90 Micro Servo (Pin 2)' },
            { id: 'ARDUINO_LCD', label: 'Arduino UNO & I2C LCD' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveComponent(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-mono transition-all border shadow-sm ${
                activeComponent === tab.id
                  ? 'bg-blue-600 text-white border-blue-600 font-bold shadow-md shadow-blue-500/20'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3D Showcase & Technical Card Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* 3D Viewport Column (7 Cols) */}
        <div className="lg:col-span-7 h-[420px] sm:h-[480px] rounded-3xl bg-gradient-to-b from-slate-50 to-white border border-slate-200/90 relative overflow-hidden shadow-xl">
          <Canvas camera={{ position: [0, 0, 4.5], fov: 42 }}>
            <ambientLight intensity={1.1} />
            <directionalLight position={[5, 8, 5]} intensity={1.8} />
            <pointLight position={[-3, -3, 2]} intensity={0.6} color="#38bdf8" />
            <Float speed={2} rotationIntensity={0.2} floatIntensity={0.4}>
              {comp.model}
            </Float>
            <OrbitControls enableZoom={true} minDistance={2.5} maxDistance={7} />
          </Canvas>

          {/* Floating Orbit Hint */}
          <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg text-[11px] font-mono text-slate-600 border border-slate-200 shadow-sm pointer-events-none">
            Click & Drag to rotate 3D model • Scroll to Zoom
          </div>
        </div>

        {/* Technical Specification Column (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono text-blue-600 uppercase tracking-wider font-bold">
                {comp.role}
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">{comp.title}</h3>
            <div className="text-xs font-mono text-emerald-800 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 mb-4 font-semibold">
              <strong>Pinout:</strong> {comp.pinout}
            </div>
            <div className="text-xs font-mono text-amber-900 bg-amber-50 p-2.5 rounded-xl border border-amber-200 mb-4 font-semibold">
              <strong>Calculation:</strong> {comp.mathFormula}
            </div>

            {/* Engineering Bug Fix Card */}
            <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200/80 space-y-1 mb-4">
              <div className="flex items-center gap-1.5 text-blue-700 text-xs font-bold">
                <Zap className="w-4 h-4" />
                <span>{comp.fixTitle}</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                {comp.fixDesc}
              </p>
            </div>

            {/* Spec Bullets */}
            <ul className="space-y-2 text-xs text-slate-700 font-sans">
              {comp.specs.map((s, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <ChevronRight className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
