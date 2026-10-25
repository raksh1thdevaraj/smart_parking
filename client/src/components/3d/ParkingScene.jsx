import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { BarrierGate } from './BarrierGate';
import { Vehicle } from './Vehicle';
import { useTelemetry } from '../../context/WebSocketContext';
import {
  Play, RotateCcw, AlertOctagon, Radio, Sparkles,
  ShieldAlert, CheckCircle, Video, Compass
} from 'lucide-react';

// --- Road & Bay Demarcations (PolygonOffset prevents Z-fighting) ---
function GroundRoadway() {
  return (
    <group>
      {/* Metric Base Ground Plane (32m x 32m) */}
      <mesh position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[32, 32]} />
        <meshStandardMaterial color="#F8FAFC" roughness={0.75} metalness={0.05} />
      </mesh>

      {/* Main 2-Lane Highway/Roadway (X: -3.2 to +3.2, Z: -16 to +16) */}
      <mesh position={[0, 0.002, 0]} receiveShadow>
        <planeGeometry args={[6.4, 32]} />
        <meshStandardMaterial
          color="#1E293B"
          roughness={0.88}
          polygonOffset
          polygonOffsetFactor={-1}
          polygonOffsetUnits={-1}
        />
      </mesh>

      {/* Parking Apron / Lot Surface (X: 1.8 to 7.0, Z: -7 to +7) */}
      <mesh position={[4.4, 0.003, 0]} receiveShadow>
        <planeGeometry args={[5.2, 14]} />
        <meshStandardMaterial
          color="#334155"
          roughness={0.85}
          polygonOffset
          polygonOffsetFactor={-1}
          polygonOffsetUnits={-1}
        />
      </mesh>

      {/* Center Dashed Road Divider Line (Along X = 0, Z = -15 to +15) */}
      {[-13, -11, -9, -7, -5, -3, -1, 1, 3, 5, 7, 9, 11, 13].map((z, i) => (
        <mesh key={i} position={[0, 0.005, z]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.15, 1.2]} />
          <meshBasicMaterial color="#F8FAFC" polygonOffset polygonOffsetFactor={-2} polygonOffsetUnits={-2} />
        </mesh>
      ))}

      {/* Road Edge Boundary Lines */}
      {[-3.0, 3.0].map((x, i) => (
        <mesh key={i} position={[x, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.12, 32]} />
          <meshBasicMaterial color="#64748B" polygonOffset polygonOffsetFactor={-2} polygonOffsetUnits={-2} />
        </mesh>
      ))}

      {/* Entry Stop Bar Line at Z = -2.0m (Inbound Lane X = -1.8) */}
      <mesh position={[-1.8, 0.006, -2.0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.2, 0.35]} />
        <meshBasicMaterial color="#FBBF24" polygonOffset polygonOffsetFactor={-3} polygonOffsetUnits={-3} />
      </mesh>

      {/* Exit Stop Bar Line at Z = 2.5m (Outbound Lane X = +1.8) */}
      <mesh position={[1.8, 0.006, 2.5]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.2, 0.35]} />
        <meshBasicMaterial color="#FBBF24" polygonOffset polygonOffsetFactor={-3} polygonOffsetUnits={-3} />
      </mesh>

      {/* Inbound Lane Traffic Directional Arrow (Z = -8.0) */}
      <mesh position={[-1.8, 0.006, -8.0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.7, 1.6]} />
        <meshBasicMaterial color="#94A3B8" transparent opacity={0.5} />
      </mesh>

      {/* Outbound Lane Traffic Directional Arrow (Z = 8.0) */}
      <mesh position={[1.8, 0.006, 8.0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.7, 1.6]} />
        <meshBasicMaterial color="#94A3B8" transparent opacity={0.5} />
      </mesh>
    </group>
  );
}

// --- 4 Clearly Demarcated Metric Parking Bays (perpendicular along X = 4.0m) ---
const BAY_CONFIGS = [
  { id: 1, center: [4.0, 0, -4.5], name: 'Bay 1' },
  { id: 2, center: [4.0, 0, -1.5], name: 'Bay 2' },
  { id: 3, center: [4.0, 0, 1.5], name: 'Bay 3' },
  { id: 4, center: [4.0, 0, 4.5], name: 'Bay 4' },
];

function ParkingBays({ occupancyState }) {
  return (
    <group>
      {BAY_CONFIGS.map((bay, idx) => {
        const isOccupied = occupancyState[idx];
        const color = isOccupied ? '#F43F5E' : '#10B981';

        return (
          <group key={bay.id} position={[bay.center[0], 0, bay.center[2]]}>
            {/* Bay Asphalt Stencil Floor: 4.8m long along X, 2.5m wide along Z */}
            <mesh position={[0, 0.003, 0]} receiveShadow>
              <planeGeometry args={[4.8, 2.5]} />
              <meshStandardMaterial
                color="#1E293B"
                roughness={0.88}
                polygonOffset
                polygonOffsetFactor={-1}
                polygonOffsetUnits={-1}
              />
            </mesh>

            {/* Glowing Floor Perimeter Frame */}
            <mesh position={[0, 0.006, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[4.7, 2.4]} />
              <meshBasicMaterial color={color} transparent opacity={0.2} />
            </mesh>

            {/* Yellow Bay Divider Lines */}
            <mesh position={[0, 0.008, -1.25]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[4.8, 0.1]} />
              <meshBasicMaterial color="#FBBF24" polygonOffset polygonOffsetFactor={-2} polygonOffsetUnits={-2} />
            </mesh>
            <mesh position={[0, 0.008, 1.25]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[4.8, 0.1]} />
              <meshBasicMaterial color="#FBBF24" polygonOffset polygonOffsetFactor={-2} polygonOffsetUnits={-2} />
            </mesh>
            <mesh position={[2.4, 0.008, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[0.1, 2.5]} />
              <meshBasicMaterial color="#FBBF24" polygonOffset polygonOffsetFactor={-2} polygonOffsetUnits={-2} />
            </mesh>

            {/* Dedicated Bay Ambient Light Indicator */}
            <pointLight position={[0, 1.2, 0]} intensity={0.4} color={color} distance={4} />

            {/* 3D Floating Bay Status Badge */}
            <Html position={[2.6, 0.1, 0]} center distanceFactor={14}>
              <span className={`text-[10px] font-mono px-2.5 py-1 rounded-full font-bold shadow-md transition whitespace-nowrap ${
                isOccupied
                  ? 'bg-white text-rose-600 border border-rose-300 shadow-rose-500/15'
                  : 'bg-white text-emerald-600 border border-emerald-300 shadow-emerald-500/15'
              }`}>
                {bay.name}: {isOccupied ? 'OCCUPIED' : 'VACANT'}
              </span>
            </Html>
          </group>
        );
      })}
    </group>
  );
}

// --- Ultrasonic Sensor Pedestals & Pulsating Translucent Cones ---
function SensorStation({ position, rotation = [0, 0, 0], label, isTriggered, isReject }) {
  const coneRef = useRef();

  useFrame((state) => {
    if (coneRef.current && isTriggered) {
      const s = 0.8 + ((state.clock.elapsedTime * 4) % 1.5);
      coneRef.current.scale.set(s, s, s);
      coneRef.current.material.opacity = Math.max(0, 0.6 - (s / 3));
    }
  });

  const coneColor = isReject ? '#F43F5E' : '#00F0FF';

  return (
    <group position={position} rotation={rotation}>
      {/* Aluminum Sensor Pedestal Pole at roadside */}
      <mesh position={[0, 0.45, 0]} castShadow>
        <cylinderGeometry args={[0.07, 0.07, 0.9, 16]} />
        <meshStandardMaterial color="#475569" metalness={0.8} />
      </mesh>

      {/* HC-SR04 Transducer Dual Eyes */}
      <mesh position={[0, 0.92, 0]} castShadow>
        <boxGeometry args={[0.26, 0.16, 0.12]} />
        <meshStandardMaterial color={isTriggered ? coneColor : '#0284c7'} roughness={0.3} />
      </mesh>
      <mesh position={[0.07, 0.92, 0.07]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.045, 0.045, 0.04, 16]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.9} />
      </mesh>
      <mesh position={[-0.07, 0.92, 0.07]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.045, 0.045, 0.04, 16]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.9} />
      </mesh>

      {/* Translucent Sonar Pulse Cone pointing into roadway */}
      {isTriggered && (
        <mesh ref={coneRef} position={[0, 0.92, 1.2]} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.8, 1.8, 24, 1, true]} />
          <meshBasicMaterial color={coneColor} transparent opacity={0.4} side={THREE.DoubleSide} wireframe />
        </mesh>
      )}

      {/* 3D Label Tag */}
      <Html position={[0, 1.25, 0]} center distanceFactor={14}>
        <span className={`text-[10px] font-mono px-2.5 py-1 rounded-full shadow-md whitespace-nowrap transition ${
          isTriggered
            ? isReject ? 'bg-rose-600 text-white font-bold' : 'bg-blue-600 text-white font-bold'
            : 'bg-white text-slate-700 border border-slate-200 font-semibold'
        }`}>
          {label}
        </span>
      </Html>
    </group>
  );
}

// --- Camera Rig Controller: Fixed Top View ---
function CameraRig() {
  const { camera } = useThree();
  const targetPos = useRef(new THREE.Vector3(0.5, 22, 0.05));

  useEffect(() => {
    camera.position.set(0.5, 22, 0.05);
    camera.lookAt(0.5, 0, 0);
  }, [camera]);

  useFrame(() => {
    camera.position.lerp(targetPos.current, 0.05);
  });

  return null;
}

export function ParkingScene() {
  const { telemetry } = useTelemetry();

  // Mode State
  const [digitalTwinMirror, setDigitalTwinMirror] = useState(true);

  // Kinematic Sequence Lock
  const [isAnimating, setIsAnimating] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Awaiting Vehicle Traffic');

  // Discrete Occupancy for 4 bays: [Bay1, Bay2, Bay3, Bay4]
  const [bayOccupancy, setBayOccupancy] = useState([false, false, false, false]);

  // Dynamic Vehicle Object State
  const [movingCar, setMovingCar] = useState({
    visible: false,
    x: -1.8,
    y: 0.25,
    z: -14.0,
    rotY: 0,
    color: '#00F0FF',
    brakeLightsOn: false
  });

  // Barrier Gate Visual Angle (0 rad to Math.PI / 2 rad)
  const [gateAngle, setGateAngle] = useState(0);

  // Sonar Trigger States
  const [entryTriggered, setEntryTriggered] = useState(false);
  const [exitTriggered, setExitTriggered] = useState(false);
  const [fullRejectActive, setFullRejectActive] = useState(false);

  // Synchronize bay occupancy with hardware telemetry when Digital Twin Mirror is active
  useEffect(() => {
    if (digitalTwinMirror && !isAnimating) {
      const occupiedCount = Math.min(4, Math.max(0, telemetry.occupiedSlots || 0));
      setBayOccupancy([
        occupiedCount >= 1,
        occupiedCount >= 2,
        occupiedCount >= 3,
        occupiedCount >= 4
      ]);
      setGateAngle(telemetry.gateState === 'OPEN' || telemetry.gateState === 'MANUAL_HOLD' ? Math.PI / 2 : 0);
    }
  }, [telemetry.occupiedSlots, telemetry.gateState, digitalTwinMirror, isAnimating]);

  // =========================================================================
  // KINEMATIC TIMELINE 1: INBOUND (ENTRY -> SENSOR -> GATE -> PARK IN BAY)
  // =========================================================================
  const handleSimulateInbound = useCallback(() => {
    if (isAnimating) return;

    // Identify first available vacant bay
    const targetBayIndex = bayOccupancy.findIndex(occ => !occ);
    if (targetBayIndex === -1) {
      handleSimulateReject();
      return;
    }

    setIsAnimating(true);
    setFullRejectActive(false);
    setStatusMessage('Approaching Inbound Lane...');

    const targetBay = BAY_CONFIGS[targetBayIndex];

    // Build CatmullRomCurve3 Spline from Gate Clearance to Target Bay
    const bayApproachWaypoints = [
      new THREE.Vector3(-1.8, 0.25, 1.5),
      new THREE.Vector3(-1.5, 0.25, 2.5),
      new THREE.Vector3(0.0, 0.25, targetBay.center[2] * 0.6),
      new THREE.Vector3(1.8, 0.25, targetBay.center[2]),
      new THREE.Vector3(2.8, 0.25, targetBay.center[2]),
      new THREE.Vector3(targetBay.center[0], 0.25, targetBay.center[2])
    ];
    const baySpline = new THREE.CatmullRomCurve3(bayApproachWaypoints, false, 'catmullrom', 0.2);

    // Initial vehicle placement at entry approach lane
    setMovingCar({
      visible: true,
      x: -1.8,
      y: 0.25,
      z: -14.0,
      rotY: 0,
      color: '#00F0FF',
      brakeLightsOn: false
    });

    const masterTl = gsap.timeline({
      onComplete: () => {
        // Commit bay occupancy state
        setBayOccupancy(prev => {
          const next = [...prev];
          next[targetBayIndex] = true;
          return next;
        });
        setIsAnimating(false);
        setMovingCar(prev => ({ ...prev, visible: false }));
        setEntryTriggered(false);
        setStatusMessage(`Vehicle Parked in ${targetBay.name}`);
      }
    });

    // 1. Approach & Deceleration to Sensor 1 (Z = -3.5)
    masterTl.to(movingCar, {
      z: -3.5,
      duration: 1.3,
      ease: 'power2.out',
      onUpdate: () => setMovingCar(prev => ({ ...prev, z: movingCar.z })),
      onComplete: () => {
        setEntryTriggered(true);
        setStatusMessage('Vehicle Detected at Entry (HC-SR04 Tripped)');
      }
    });

    // 2. Sensor Halt & Verification Pause (0.4s)
    masterTl.to({}, { duration: 0.4 });

    // 3. Barrier Opening (SG90 Servo Actuation: 0 -> 90 deg in 0.6s)
    masterTl.to({ angle: 0 }, {
      angle: Math.PI / 2,
      duration: 0.6,
      ease: 'power2.out',
      onStart: () => setStatusMessage('Barrier Arm Lifting (SG90 Servo Active)'),
      onUpdate: function () {
        setGateAngle(this.targets()[0].angle);
      }
    });

    // 4. Gate Passage: Accelerate through gate to Z = +1.5
    masterTl.to(movingCar, {
      z: 1.5,
      duration: 1.0,
      ease: 'power1.inOut',
      onStart: () => setStatusMessage('Passing Under Barrier Gate'),
      onUpdate: () => setMovingCar(prev => ({ ...prev, z: movingCar.z }))
    });

    // 5. Barrier Closure: Once rear clears Z = 0.8, gate lowers in 0.6s
    masterTl.to({ angle: Math.PI / 2 }, {
      angle: 0,
      duration: 0.6,
      ease: 'power2.inOut',
      onStart: () => {
        setEntryTriggered(false);
        setStatusMessage('Barrier Arm Lowering to Closed State');
      },
      onUpdate: function () {
        setGateAngle(this.targets()[0].angle);
      }
    }, '-=0.4');

    // 6. Spline Navigation into Target Bay (Continuous Yaw Alignment)
    const splineProgress = { t: 0 };
    masterTl.to(splineProgress, {
      t: 1,
      duration: 2.2,
      ease: 'power2.inOut',
      onStart: () => setStatusMessage(`Steering into ${targetBay.name}...`),
      onUpdate: () => {
        const pt = baySpline.getPointAt(splineProgress.t);
        const tangent = baySpline.getTangentAt(splineProgress.t).normalize();
        const headingAngle = Math.atan2(tangent.x, tangent.z);

        setMovingCar({
          visible: true,
          x: pt.x,
          y: pt.y,
          z: pt.z,
          rotY: headingAngle,
          color: '#00F0FF',
          brakeLightsOn: splineProgress.t > 0.85
        });
      }
    });
  }, [isAnimating, bayOccupancy, movingCar]);

  // =========================================================================
  // KINEMATIC TIMELINE 2: OUTBOUND (UNPARK -> SENSOR 2 -> GATE -> DEPART)
  // =========================================================================
  const handleSimulateOutbound = useCallback(() => {
    if (isAnimating) return;

    // Pick latest occupied bay to vacate
    const vacateBayIndex = bayOccupancy.map((occ, i) => occ ? i : -1).filter(i => i !== -1).pop();
    if (vacateBayIndex === undefined) {
      alert('Facility is completely vacant! No parked vehicles available to exit.');
      return;
    }

    setIsAnimating(true);
    setStatusMessage('Unparking from Bay...');
    const sourceBay = BAY_CONFIGS[vacateBayIndex];

    // Vacate bay floor indicator immediately
    setBayOccupancy(prev => {
      const next = [...prev];
      next[vacateBayIndex] = false;
      return next;
    });

    // Spline for backing out from bay (X = 4.0, Z = bay.z, rotY = PI/2) into exit lane (X = 1.8, Z = bay.z - 1.2)
    const unparkWaypoints = [
      new THREE.Vector3(sourceBay.center[0], 0.25, sourceBay.center[2]),
      new THREE.Vector3(2.8, 0.25, sourceBay.center[2]),
      new THREE.Vector3(1.8, 0.25, sourceBay.center[2] + 0.8)
    ];
    const unparkSpline = new THREE.CatmullRomCurve3(unparkWaypoints, false, 'catmullrom', 0.2);

    setMovingCar({
      visible: true,
      x: sourceBay.center[0],
      y: 0.25,
      z: sourceBay.center[2],
      rotY: Math.PI / 2, // Parked facing +X
      color: '#38BDF8',
      brakeLightsOn: true
    });

    const masterTl = gsap.timeline({
      onComplete: () => {
        setIsAnimating(false);
        setMovingCar(prev => ({ ...prev, visible: false }));
        setExitTriggered(false);
        setStatusMessage('Vehicle Successfully Cleared Facility');
      }
    });

    // 1. Bay Pull-Out: Reverse arc into aisle
    const unparkProgress = { t: 0 };
    masterTl.to(unparkProgress, {
      t: 1,
      duration: 1.4,
      ease: 'power1.inOut',
      onUpdate: () => {
        const pt = unparkSpline.getPointAt(unparkProgress.t);
        // Reverse orientation: interpolate angle from PI/2 to 0
        const angle = THREE.MathUtils.lerp(Math.PI / 2, 0, unparkProgress.t);
        setMovingCar({
          visible: true,
          x: pt.x,
          y: pt.y,
          z: pt.z,
          rotY: angle,
          color: '#38BDF8',
          brakeLightsOn: true
        });
      }
    });

    // 2. Drive to Exit Sensor 2 at Z = 3.5 on Exit Lane (X = 1.8)
    masterTl.to(movingCar, {
      x: 1.8,
      z: 3.5,
      rotY: 0,
      duration: 1.1,
      ease: 'power1.out',
      onStart: () => setStatusMessage('Approaching Exit Sensor...'),
      onUpdate: () => setMovingCar(prev => ({
        ...prev,
        x: 1.8,
        z: movingCar.z,
        rotY: 0,
        brakeLightsOn: false
      })),
      onComplete: () => {
        setExitTriggered(true);
        setStatusMessage('Vehicle Detected at Exit (HC-SR04 Tripped)');
      }
    });

    // 3. Sensor Halt & Verification Pause (0.4s)
    masterTl.to({}, { duration: 0.4 });

    // 4. Exit Barrier Opens (0 -> 90 deg in 0.6s)
    masterTl.to({ angle: 0 }, {
      angle: Math.PI / 2,
      duration: 0.6,
      ease: 'power2.out',
      onStart: () => setStatusMessage('Exit Barrier Raised'),
      onUpdate: function () {
        setGateAngle(this.targets()[0].angle);
      }
    });

    // 5. Drive through exit clearance down departure lane (Z -> 14.0)
    masterTl.to(movingCar, {
      z: 14.0,
      duration: 1.8,
      ease: 'power2.in',
      onStart: () => setStatusMessage('Departing Facility along Outbound Lane'),
      onUpdate: () => setMovingCar(prev => ({ ...prev, z: movingCar.z }))
    });

    // 6. Barrier Lowers behind vehicle
    masterTl.to({ angle: Math.PI / 2 }, {
      angle: 0,
      duration: 0.6,
      ease: 'power2.inOut',
      onStart: () => {
        setExitTriggered(false);
      },
      onUpdate: function () {
        setGateAngle(this.targets()[0].angle);
      }
    }, '-=1.0');
  }, [isAnimating, bayOccupancy, movingCar]);

  // =========================================================================
  // KINEMATIC TIMELINE 3: LOT FULL REJECTION (APPROACH -> SENSOR -> DENIED -> U-TURN)
  // =========================================================================
  const handleSimulateReject = useCallback(() => {
    if (isAnimating) return;

    setIsAnimating(true);
    setFullRejectActive(true);
    setStatusMessage('Vehicle Approaching Lot Full...');

    setMovingCar({
      visible: true,
      x: -1.8,
      y: 0.25,
      z: -14.0,
      rotY: 0,
      color: '#F43F5E',
      brakeLightsOn: false
    });

    // Smooth U-turn Spline from Sensor 1 to Outbound Departure
    const rejectWaypoints = [
      new THREE.Vector3(-1.8, 0.25, -3.5),
      new THREE.Vector3(-1.2, 0.25, -2.4),
      new THREE.Vector3(0.0, 0.25, -1.8),
      new THREE.Vector3(1.2, 0.25, -2.4),
      new THREE.Vector3(1.8, 0.25, -3.5),
      new THREE.Vector3(1.8, 0.25, -14.0)
    ];
    const rejectSpline = new THREE.CatmullRomCurve3(rejectWaypoints, false, 'catmullrom', 0.2);

    const masterTl = gsap.timeline({
      onComplete: () => {
        setIsAnimating(false);
        setMovingCar(prev => ({ ...prev, visible: false }));
        setEntryTriggered(false);
        setFullRejectActive(false);
        setStatusMessage('Lot Full Denial Handshake Complete');
      }
    });

    // 1. Approach Sensor 1 (Z = -3.5)
    masterTl.to(movingCar, {
      z: -3.5,
      duration: 1.3,
      ease: 'power2.out',
      onUpdate: () => setMovingCar(prev => ({ ...prev, z: movingCar.z })),
      onComplete: () => {
        setEntryTriggered(true);
        setStatusMessage('DENIED: 0 Free Bays • Barrier Kept Closed');
      }
    });

    // 2. Halt before barrier arm with brake lights illuminated (1.2s pause)
    masterTl.to({}, {
      duration: 1.2,
      onStart: () => setMovingCar(prev => ({ ...prev, brakeLightsOn: true }))
    });

    // 3. Smooth U-turn Spline Execution (Gate Remains at 0 deg)
    const rejectProgress = { t: 0 };
    masterTl.to(rejectProgress, {
      t: 1,
      duration: 2.4,
      ease: 'power2.inOut',
      onStart: () => {
        setEntryTriggered(false);
        setStatusMessage('Executing U-Turn Bypass...');
      },
      onUpdate: () => {
        const pt = rejectSpline.getPointAt(rejectProgress.t);
        const tangent = rejectSpline.getTangentAt(rejectProgress.t).normalize();
        const headingAngle = Math.atan2(tangent.x, tangent.z);

        setMovingCar({
          visible: true,
          x: pt.x,
          y: pt.y,
          z: pt.z,
          rotY: headingAngle,
          color: '#F43F5E',
          brakeLightsOn: false
        });
      }
    });
  }, [isAnimating, movingCar]);

  return (
    <div className="relative w-full h-[540px] lg:h-[650px] rounded-3xl overflow-hidden bg-white border border-slate-200/90 shadow-[0_16px_50px_-12px_rgba(15,23,42,0.12)]">
      {/* 3D Canvas */}
      <Canvas shadows camera={{ position: [0.5, 22, 0.05], fov: 45 }}>
        {/* Metric Lighting Setup */}
        <ambientLight intensity={1.1} color="#ffffff" />
        <directionalLight
          position={[12, 22, 10]}
          intensity={1.8}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          shadow-camera-left={-14}
          shadow-camera-right={14}
          shadow-camera-top={12}
          shadow-camera-bottom={-12}
          shadow-bias={-0.0005}
          color="#ffffff"
        />
        <pointLight position={[0, 6, 0]} intensity={0.4} color="#38bdf8" distance={16} />

        <CameraRig />

        {/* 1. Ground & Roadway Infrastructure */}
        <GroundRoadway />

        {/* 2. 4 Metric Parking Bays with Dynamic Floor LED Indicators */}
        <ParkingBays occupancyState={bayOccupancy} />

        {/* Static Parked Cars in Occupied Bays */}
        {BAY_CONFIGS.map((bay, idx) => {
          if (!bayOccupancy[idx]) return null;
          // Hide parked car if it is currently being animated out
          if (movingCar.visible && Math.abs(movingCar.x - bay.center[0]) < 0.3 && Math.abs(movingCar.z - bay.center[2]) < 0.3) {
            return null;
          }
          return (
            <Vehicle
              key={bay.id}
              position={[bay.center[0], 0, bay.center[2]]}
              rotation={[0, Math.PI / 2, 0]} // Parked facing +X
              color={idx === 0 ? '#3b82f6' : idx === 1 ? '#10b981' : idx === 2 ? '#f59e0b' : '#8b5cf6'}
              isOccupied={true}
            />
          );
        })}

        {/* 3. Dynamic Moving Vehicle (Driven by Spline FSM) */}
        {movingCar.visible && (
          <Vehicle
            position={[movingCar.x, movingCar.y, movingCar.z]}
            rotation={[0, movingCar.rotY, 0]}
            color={movingCar.color}
            brakeLightsOn={movingCar.brakeLightsOn}
            isOccupied={true}
          />
        )}

        {/* 4. Mechanical Barrier Gate: Hinge Pivot at (-2.4, 0.85, 0.0) */}
        <BarrierGate
          position={[-2.4, 0, 0]}
          gateAngle={gateAngle}
          armLength={2.6}
          direction={1}
          label="Entry Barrier"
        />

        {/* Exit Barrier Gate at (+2.4, 0, 2.5) */}
        <BarrierGate
          position={[2.4, 0, 2.5]}
          gateAngle={gateAngle}
          armLength={2.6}
          direction={-1}
          label="Exit Barrier"
        />

        {/* 5. Ultrasonic Sensor 1 (Entry at [-2.6, 0, -3.5]) pointing towards +X */}
        <SensorStation
          position={[-2.6, 0, -3.5]}
          rotation={[0, Math.PI / 2, 0]}
          label="Sensor 1 (Entry HC-SR04)"
          isTriggered={entryTriggered}
          isReject={fullRejectActive}
        />

        {/* Ultrasonic Sensor 2 (Exit at [+2.6, 0, 3.5]) pointing towards -X */}
        <SensorStation
          position={[2.6, 0, 3.5]}
          rotation={[0, -Math.PI / 2, 0]}
          label="Sensor 2 (Exit HC-SR04)"
          isTriggered={exitTriggered}
          isReject={false}
        />

        {/* 6. 3D Billboard Alert when Lot is Full (Rejection Mode) */}
        {fullRejectActive && (
          <Html position={[0, 2.6, -2.0]} center distanceFactor={14}>
            <div className="bg-white border-2 border-rose-500 text-rose-700 px-4 py-2.5 rounded-xl text-xs font-mono font-bold shadow-2xl flex items-center gap-2 animate-bounce whitespace-nowrap">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <span>SORRY: PARKING FULL (0/4 SLOTS AVAILABLE)</span>
            </div>
          </Html>
        )}

        <OrbitControls
          enableRotate={false}
          enablePan={true}
          enableZoom={true}
          minDistance={8}
          maxDistance={35}
        />
      </Canvas>

      {/* Floating Top Header: Live Telemetry, Slot Counter & Kinematic Status */}
      <div className="absolute top-4 left-4 right-4 flex flex-wrap items-center justify-between gap-3 pointer-events-none z-10">
        <div className="flex flex-wrap items-center gap-2 pointer-events-auto">
          {/* Barrier Status Pill */}
          <div className="bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-xl flex items-center gap-2 border border-slate-200 shadow-sm text-slate-800">
            <span className={`w-2.5 h-2.5 rounded-full ${
              gateAngle > 0.5 ? 'bg-emerald-500 animate-ping' : 'bg-rose-500'
            }`} />
            <span className="text-xs font-mono font-bold">
              GATE: <span className={gateAngle > 0.5 ? 'text-emerald-600' : 'text-rose-600'}>
                {gateAngle > 0.5 ? 'OPEN (90°)' : 'CLOSED (0°)'}
              </span>
            </span>
          </div>

          {/* Occupancy Indicator */}
          <div className="bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-xl flex items-center gap-2 text-xs font-mono border border-slate-200 shadow-sm text-slate-800">
            <Radio className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-slate-600">
              FREE:{' '}
              <strong className={bayOccupancy.filter(o => !o).length === 0 ? 'text-rose-600' : 'text-emerald-600'}>
                {bayOccupancy.filter(o => !o).length}/4
              </strong>
            </span>
          </div>

          {/* Dynamic Kinematic Action Status */}
          <div className="bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-xl text-xs font-mono border border-blue-200 text-blue-700 shadow-sm hidden sm:flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="font-semibold">{statusMessage}</span>
          </div>
        </div>

        {/* Digital Twin Sync Toggle */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={() => setDigitalTwinMirror(!digitalTwinMirror)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono flex items-center gap-2 border transition shadow-sm ${
              digitalTwinMirror
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 font-semibold'
                : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 font-semibold'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{digitalTwinMirror ? 'Live Hardware Mirror: ACTIVE' : 'Interactive Demo FSM'}</span>
          </button>
        </div>
      </div>

      {/* Floating Bottom Toolbar: Kinematic Simulation Controls & Fixed Top View Badge */}
      <div className="absolute bottom-4 left-4 right-4 flex flex-col sm:flex-row items-center justify-between gap-3 pointer-events-none z-10">
        {/* Simulation Triggers (Sequence locked with isAnimating) */}
        <div className="flex flex-wrap items-center gap-2 pointer-events-auto">
          <button
            disabled={isAnimating}
            onClick={() => { setDigitalTwinMirror(false); handleSimulateInbound(); }}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-mono text-xs font-bold transition shadow-md shadow-blue-500/25 flex items-center gap-1.5 disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Simulate Inbound</span>
          </button>

          <button
            disabled={isAnimating}
            onClick={() => { setDigitalTwinMirror(false); handleSimulateOutbound(); }}
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-mono text-xs font-semibold border border-slate-300 shadow-sm transition flex items-center gap-1.5 disabled:opacity-50"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Simulate Outbound</span>
          </button>

          <button
            disabled={isAnimating}
            onClick={() => { setDigitalTwinMirror(false); handleSimulateReject(); }}
            className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-mono text-xs font-semibold border border-rose-200 shadow-sm transition flex items-center gap-1.5 disabled:opacity-50"
          >
            <AlertOctagon className="w-3.5 h-3.5" />
            <span>Simulate Lot Full (Reject)</span>
          </button>
        </div>

        {/* Top View Indicator Badge */}
        <div className="bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl flex items-center gap-2 border border-slate-200 text-slate-700 text-xs font-mono pointer-events-auto shadow-sm">
          <Compass className="w-4 h-4 text-blue-600" />
          <span className="font-semibold">Top View</span>
        </div>
      </div>
    </div>
  );
}
