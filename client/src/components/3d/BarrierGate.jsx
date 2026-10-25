import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';

/**
 * Mechanical Barrier Gate with Mathematically Exact Axle Pivot Group
 * - Position default: (X = -2.4, Y = 0, Z = 0)
 * - Axle Pivot: local (0, 0.85, 0) -> world (X = -2.4, Y = 0.85, Z = 0)
 * - Closed: rotation.z = 0 (arm spans horizontally across roadway)
 * - Open: rotation.z = Math.PI / 2 (arm points straight up 90 deg)
 */
export function BarrierGate({
  position = [-2.4, 0, 0],
  gateState = 'CLOSED',
  gateAngle = 0,
  armLength = 2.6,
  direction = 1, // 1 extends to +X, -1 extends to -X
  label = 'Entry Barrier'
}) {
  const gatePivotRef = useRef();

  // Animate gatePivot rotation whenever gateState or gateAngle changes
  useEffect(() => {
    if (!gatePivotRef.current) return;

    const targetRad = (gateState === 'OPEN' || gateState === 'MANUAL_HOLD')
      ? Math.PI / 2
      : gateAngle;

    gsap.to(gatePivotRef.current.rotation, {
      z: direction * targetRad,
      duration: 0.6,
      ease: 'power2.out'
    });
  }, [gateState, gateAngle, direction]);

  const isOpen = gateState === 'OPEN' || gateState === 'MANUAL_HOLD' || gateAngle > 0.5;

  return (
    <group position={position}>
      {/* 1. Static Servo Housing Pillar */}
      <group position={[-0.2 * direction, 0.45, 0]}>
        {/* Main Aluminum / Industrial Steel Pillar */}
        <mesh position={[0, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.42, 0.9, 0.42]} />
          <meshStandardMaterial color="#f59e0b" roughness={0.3} metalness={0.2} />
        </mesh>

        {/* Hazard Safety Base */}
        <mesh position={[0, -0.35, 0]}>
          <boxGeometry args={[0.48, 0.2, 0.48]} />
          <meshStandardMaterial color="#1e293b" roughness={0.8} />
        </mesh>

        {/* SG90 Servo Bracket Housing */}
        <mesh position={[0.18 * direction, 0.35, 0]} castShadow>
          <boxGeometry args={[0.18, 0.25, 0.18]} />
          <meshStandardMaterial color="#0284c7" roughness={0.4} />
        </mesh>

        {/* Overhead Status LED Light Indicator */}
        <mesh position={[0, 0.52, 0]}>
          <sphereGeometry args={[0.07, 16, 16]} />
          <meshStandardMaterial
            color={isOpen ? '#10b981' : '#f43f5e'}
            emissive={isOpen ? '#10b981' : '#f43f5e'}
            emissiveIntensity={1.8}
          />
        </mesh>
      </group>

      {/* 2. Empty gatePivot Group positioned EXACTLY at servo motor shaft axle (local [0, 0.85, 0]) */}
      <group ref={gatePivotRef} position={[0, 0.85, 0]}>
        {/* Axle Flange / Hub Cap */}
        <mesh position={[0, 0, 0.05]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.09, 0.09, 0.08, 24]} />
          <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.2} />
        </mesh>

        {/* 3. Barrier Arm Mesh child of gatePivot.
            Length = armLength. Local center is X = (armLength / 2) * direction.
            Hinge end sits exactly at (0, 0, 0). */}
        <group position={[(armLength / 2) * direction, 0, 0]}>
          {/* Main White Aluminum Boom Arm */}
          <mesh castShadow>
            <boxGeometry args={[armLength, 0.11, 0.05]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.2} />
          </mesh>

          {/* Alternating Red Reflective Safety Stripes */}
          {[-0.8, -0.3, 0.2, 0.7].map((offsetFactor, idx) => (
            <mesh key={idx} position={[offsetFactor * (armLength / 2), 0, 0]}>
              <boxGeometry args={[armLength * 0.12, 0.115, 0.055]} />
              <meshStandardMaterial color="#ef4444" roughness={0.3} />
            </mesh>
          ))}
        </group>
      </group>
    </group>
  );
}
