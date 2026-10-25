import React, { useRef } from 'react';
import * as THREE from 'three';

/**
 * Metric-Scale Low-Poly Sedan
 * Dimensions: 1.8m width x 4.2m length x 1.4m height
 */
export function Vehicle({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  color = '#00F0FF',
  headlightsOn = true,
  brakeLightsOn = false,
  isOccupied = true
}) {
  if (!isOccupied) return null;

  return (
    <group position={position} rotation={rotation}>
      {/* Lower Chassis / Body */}
      <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.8, 0.5, 4.2]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.4} />
      </mesh>

      {/* Aerodynamic Cabin / Greenhouse */}
      <mesh position={[0, 0.95, -0.2]} castShadow>
        <boxGeometry args={[1.5, 0.55, 2.3]} />
        <meshStandardMaterial color="#0f172a" roughness={0.1} metalness={0.8} />
      </mesh>

      {/* Windshield */}
      <mesh position={[0, 0.9, 1.0]} rotation={[0.45, 0, 0]}>
        <planeGeometry args={[1.4, 0.55]} />
        <meshStandardMaterial color="#38bdf8" transparent opacity={0.65} roughness={0.1} />
      </mesh>

      {/* Rear Window */}
      <mesh position={[0, 0.9, -1.38]} rotation={[-0.45, Math.PI, 0]}>
        <planeGeometry args={[1.4, 0.55]} />
        <meshStandardMaterial color="#38bdf8" transparent opacity={0.65} roughness={0.1} />
      </mesh>

      {/* Front Dual Headlights (Electric Cyan / Warm White) */}
      <mesh position={[-0.65, 0.45, 2.11]}>
        <boxGeometry args={[0.35, 0.16, 0.04]} />
        <meshStandardMaterial
          color="#fef08a"
          emissive="#fef08a"
          emissiveIntensity={headlightsOn ? 1.5 : 0.2}
        />
      </mesh>
      <mesh position={[0.65, 0.45, 2.11]}>
        <boxGeometry args={[0.35, 0.16, 0.04]} />
        <meshStandardMaterial
          color="#fef08a"
          emissive="#fef08a"
          emissiveIntensity={headlightsOn ? 1.5 : 0.2}
        />
      </mesh>

      {/* Rear Tail / Brake Lights */}
      <mesh position={[-0.65, 0.48, -2.11]}>
        <boxGeometry args={[0.35, 0.16, 0.04]} />
        <meshStandardMaterial
          color="#ef4444"
          emissive="#ef4444"
          emissiveIntensity={brakeLightsOn ? 2.0 : 0.8}
        />
      </mesh>
      <mesh position={[0.65, 0.48, -2.11]}>
        <boxGeometry args={[0.35, 0.16, 0.04]} />
        <meshStandardMaterial
          color="#ef4444"
          emissive="#ef4444"
          emissiveIntensity={brakeLightsOn ? 2.0 : 0.8}
        />
      </mesh>

      {/* 4 Rubber Tires with Alloy Rims */}
      {[
        [-0.95, 0.32, 1.25],  // Front-Left
        [0.95, 0.32, 1.25],   // Front-Right
        [-0.95, 0.32, -1.25], // Rear-Left
        [0.95, 0.32, -1.25]   // Rear-Right
      ].map((pos, i) => (
        <group key={i} position={pos} rotation={[0, 0, Math.PI / 2]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.32, 0.32, 0.22, 24]} />
            <meshStandardMaterial color="#0b0f19" roughness={0.8} />
          </mesh>
          <mesh position={[0, pos[0] > 0 ? 0.115 : -0.115, 0]}>
            <cylinderGeometry args={[0.18, 0.18, 0.02, 16]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.2} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
