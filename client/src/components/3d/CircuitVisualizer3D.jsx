import React, { useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import { Cpu, Zap, Activity, Info, CheckCircle2 } from 'lucide-react';

const WIRES = [
  {
    id: 'PIN_2',
    name: 'SG90 Servo PWM',
    arduinoPin: 'Digital Pin 2',
    target: 'Servo Signal (Yellow/Orange)',
    color: '#eab308', // Yellow
    curvePoints: [[0.7, 0.2, 0.4], [0.3, 0.8, 0.2], [-0.5, 0.3, -0.6]],
    description: 'Generates 50Hz PWM pulse (1.0ms–2.0ms duty) controlling barrier lift from 0° (closed) to 90° (open).'
  },
  {
    id: 'PIN_6',
    name: 'Entry HC-SR04 Trig',
    arduinoPin: 'Digital Pin 6',
    target: 'Sensor 1 Trigger Pin',
    color: '#10b981', // Green
    curvePoints: [[0.5, 0.2, 0.4], [0.1, 0.7, 0.1], [-1.2, 0.3, -0.2]],
    description: 'Transmits 10µs TTL Active-HIGH trigger pulse initiating 40kHz sonic bursts for approaching vehicles.'
  },
  {
    id: 'PIN_7',
    name: 'Entry HC-SR04 Echo',
    arduinoPin: 'Digital Pin 7',
    target: 'Sensor 1 Echo Pin',
    color: '#3b82f6', // Blue
    curvePoints: [[0.4, 0.2, 0.4], [0.0, 0.75, 0.0], [-1.4, 0.3, -0.2]],
    description: 'Captures return echo duration bounded by 25ms timeout cap (pulseIn) to prevent 1-second system freeze.'
  },
  {
    id: 'PIN_8',
    name: 'Exit HC-SR04 Trig',
    arduinoPin: 'Digital Pin 8',
    target: 'Sensor 2 Trigger Pin',
    color: '#06b6d4', // Cyan
    curvePoints: [[0.3, 0.2, 0.4], [-0.1, 0.8, -0.1], [-1.2, 0.3, 0.5]],
    description: 'Triggers ultrasonic burst at exit gate to detect departing vehicles and initiate slot vacancy increment.'
  },
  {
    id: 'PIN_9',
    name: 'Exit HC-SR04 Echo',
    arduinoPin: 'Digital Pin 9',
    target: 'Sensor 2 Echo Pin',
    color: '#6366f1', // Indigo
    curvePoints: [[0.2, 0.2, 0.4], [-0.2, 0.85, -0.2], [-1.4, 0.3, 0.5]],
    description: 'Measures exit distance. When vehicle clears sensor, decrements occupied count and raises available slot tally.'
  },
  {
    id: 'PIN_A4',
    name: '16x2 LCD I2C SDA',
    arduinoPin: 'Analog Pin A4 (SDA)',
    target: 'PCF8574 Backpack Data',
    color: '#a855f7', // Purple
    curvePoints: [[-0.4, 0.2, -0.5], [-0.1, 0.6, -0.8], [0.8, 0.3, -1.0]],
    description: 'Two-Wire Interface (TWI) Serial Data line operating at address 0x27 with onboard pull-up resistors.'
  },
  {
    id: 'PIN_A5',
    name: '16x2 LCD I2C SCL',
    arduinoPin: 'Analog Pin A5 (SCL)',
    target: 'PCF8574 Backpack Clock',
    color: '#d946ef', // Violet
    curvePoints: [[-0.5, 0.2, -0.5], [-0.2, 0.65, -0.9], [0.9, 0.3, -1.0]],
    description: 'Hardware I2C Synchronous Clock line clocked at 100kHz standard mode.'
  },
  {
    id: 'POWER_5V',
    name: 'Regulated 5V Power Rail',
    arduinoPin: '5V Header Pin',
    target: 'Breadboard (+) Bus Rail',
    color: '#ef4444', // Red
    curvePoints: [[-0.2, 0.2, -0.5], [-0.5, 0.5, -0.2], [-0.8, 0.2, -0.1]],
    description: 'Powers logic circuits and sensors. Decoupled with a 100µF–470µF capacitor to prevent servo brownouts.'
  },
  {
    id: 'POWER_GND',
    name: 'System Common Ground',
    arduinoPin: 'GND Header Pin',
    target: 'Breadboard (-) Bus Rail',
    color: '#1e293b', // Black / Dark slate
    curvePoints: [[-0.1, 0.2, -0.5], [-0.4, 0.45, -0.2], [-0.8, 0.2, 0.1]],
    description: 'Common electrical ground reference across Arduino UNO, SG90 servo, ultrasonic sensors, and I2C LCD.'
  }
];

function JumperWireMesh({ wire, isSelected, isHovered, onSelect, onHover }) {
  const curve = new THREE.CatmullRomCurve3(wire.curvePoints.map(p => new THREE.Vector3(...p)));
  const points = curve.getPoints(30);
  const tubeGeometry = new THREE.TubeGeometry(curve, 32, isSelected ? 0.045 : isHovered ? 0.038 : 0.026, 8, false);

  return (
    <group>
      <mesh
        geometry={tubeGeometry}
        onPointerOver={(e) => { e.stopPropagation(); onHover(wire.id); }}
        onPointerOut={(e) => { e.stopPropagation(); onHover(null); }}
        onClick={(e) => { e.stopPropagation(); onSelect(wire.id); }}
      >
        <meshStandardMaterial
          color={isSelected ? '#00F0FF' : wire.color}
          emissive={isSelected ? '#00F0FF' : isHovered ? wire.color : '#000000'}
          emissiveIntensity={isSelected ? 1.0 : isHovered ? 0.5 : 0}
          roughness={0.2}
          metalness={0.3}
        />
      </mesh>
    </group>
  );
}

function CircuitScene({ selectedWire, hoveredWire, onSelectWire, onHoverWire }) {
  const groupRef = useRef();

  useFrame((state, delta) => {
    if (groupRef.current && !selectedWire) {
      groupRef.current.rotation.y += delta * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Arduino UNO Board Model */}
      <group position={[0.2, 0, 0]}>
        <mesh position={[0, 0.08, 0]}>
          <boxGeometry args={[1.8, 0.08, 1.3]} />
          <meshStandardMaterial color="#00878F" roughness={0.4} />
        </mesh>
        {/* ATmega328P Chip */}
        <mesh position={[0.2, 0.16, 0.1]}>
          <boxGeometry args={[0.9, 0.08, 0.26]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
        {/* USB Connector */}
        <mesh position={[-0.8, 0.2, -0.3]}>
          <boxGeometry args={[0.4, 0.25, 0.35]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.8} />
        </mesh>
        {/* Female Header Rails */}
        <mesh position={[0.3, 0.18, 0.5]}>
          <boxGeometry args={[1.2, 0.15, 0.1]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
        <mesh position={[0.3, 0.18, -0.5]}>
          <boxGeometry args={[1.2, 0.15, 0.1]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
      </group>

      {/* Solderless Breadboard Model */}
      <group position={[-1.2, 0, 0]}>
        <mesh position={[0, 0.08, 0]}>
          <boxGeometry args={[1.4, 0.08, 2.2]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.7} />
        </mesh>
        {/* Power Bus Rails */}
        <mesh position={[-0.6, 0.13, 0]}>
          <boxGeometry args={[0.06, 0.02, 2.0]} />
          <meshStandardMaterial color="#ef4444" />
        </mesh>
        <mesh position={[-0.5, 0.13, 0]}>
          <boxGeometry args={[0.06, 0.02, 2.0]} />
          <meshStandardMaterial color="#3b82f6" />
        </mesh>
        {/* Decoupling Capacitor across rails */}
        <mesh position={[-0.55, 0.26, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.22, 16]} />
          <meshStandardMaterial color="#1e293b" roughness={0.3} metalness={0.6} />
        </mesh>
      </group>

      {/* Render Jumper Wires */}
      {WIRES.map(wire => (
        <JumperWireMesh
          key={wire.id}
          wire={wire}
          isSelected={selectedWire === wire.id}
          isHovered={hoveredWire === wire.id}
          onSelect={onSelectWire}
          onHover={onHoverWire}
        />
      ))}
    </group>
  );
}

export function CircuitVisualizer3D() {
  const [selectedWire, setSelectedWire] = useState('PIN_2');
  const [hoveredWire, setHoveredWire] = useState(null);

  const activeWireObj = WIRES.find(w => w.id === (hoveredWire || selectedWire)) || WIRES[0];

  return (
    <section className="py-20 px-4 sm:px-8 max-w-7xl mx-auto border-t border-slate-200/90">
      <div className="text-center max-w-3xl mx-auto mb-10">
        <span className="text-xs font-mono font-bold text-blue-700 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
          Hardware Wiring Synchronizer
        </span>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-3">
          Interactive 3D Circuit & Breadboard Visualizer
        </h2>
        <p className="text-slate-600 text-sm mt-2">
          Click or hover any color-coded jumper wire in 3D to inspect its physical pin connections and circuit function.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* 3D Canvas Visualizer (7 Cols) */}
        <div className="lg:col-span-7 h-[420px] sm:h-[480px] rounded-3xl bg-gradient-to-b from-slate-50 to-white border border-slate-200/90 relative overflow-hidden shadow-xl">
          <Canvas camera={{ position: [0, 4, 3.5], fov: 45 }}>
            <ambientLight intensity={1.1} />
            <directionalLight position={[5, 10, 5]} intensity={1.8} />
            <pointLight position={[-2, 3, -2]} intensity={0.6} color="#38bdf8" />
            <CircuitScene
              selectedWire={selectedWire}
              hoveredWire={hoveredWire}
              onSelectWire={setSelectedWire}
              onHoverWire={setHoveredWire}
            />
            <OrbitControls enableZoom={true} minDistance={2.5} maxDistance={7} maxPolarAngle={Math.PI / 2.1} />
          </Canvas>

          {/* Quick HUD Wire Badge */}
          <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-2 border border-slate-200 shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: activeWireObj.color }} />
            <span className="text-slate-900 font-bold">{activeWireObj.arduinoPin}</span>
            <span className="text-slate-500">➔ {activeWireObj.name}</span>
          </div>

          <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded text-[11px] font-mono text-slate-600 border border-slate-200 shadow-sm pointer-events-none">
            Click Wire to Lock • Orbit: Drag
          </div>
        </div>

        {/* Interactive Lookup Table Column (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Active Highlight Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono text-blue-600 uppercase tracking-wider font-bold">
                Active Pin Inspector
              </span>
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                {activeWireObj.arduinoPin}
              </span>
            </div>

            <h3 className="text-xl font-bold text-slate-900 mb-1">{activeWireObj.name}</h3>
            <p className="text-xs font-mono mb-3 text-emerald-700 font-semibold">
              ➔ Connected to: {activeWireObj.target}
            </p>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              {activeWireObj.description}
            </p>
          </div>

          {/* Compact Selectable Wire List */}
          <div className="bg-white rounded-2xl p-2 border border-slate-200 shadow-sm divide-y divide-slate-100 max-h-60 overflow-y-auto">
            {WIRES.map(w => (
              <button
                key={w.id}
                onClick={() => setSelectedWire(w.id)}
                className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between transition text-xs font-mono ${
                  selectedWire === w.id
                    ? 'bg-blue-50 text-blue-700 border border-blue-200 font-semibold'
                    : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: w.color }} />
                  <span className="font-bold">{w.arduinoPin}</span>
                </div>
                <span className="text-[11px] text-slate-500 truncate max-w-[150px]">{w.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
