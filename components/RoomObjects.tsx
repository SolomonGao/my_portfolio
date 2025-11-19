import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Text, useCursor } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// --- Materials ---
const woodMaterial = <meshStandardMaterial color="#8B5A2B" roughness={0.8} />;
const screenMaterial = <meshStandardMaterial color="#050505" roughness={0.2} metalness={0.8} />;
const screenGlow = <meshStandardMaterial emissive="#4f46e5" emissiveIntensity={1.5} color="#4f46e5" />;
const screenOff = <meshStandardMaterial color="#000" roughness={0.2} metalness={0.5} />;
const plasticBlack = <meshStandardMaterial color="#151515" roughness={0.6} metalness={0.1} />;
const plasticDarkGrey = <meshStandardMaterial color="#222" roughness={0.6} />;
const keyBaseMat = new THREE.MeshStandardMaterial({ color: "#1a1a1a", roughness: 0.5 });
const keyActiveMat = new THREE.MeshStandardMaterial({ color: "#333", emissive: "#00ff00", emissiveIntensity: 0.8 });

export const Desk: React.FC = () => (
  <group position={[0, -1.5, 0]}>
    {/* Table Top */}
    <mesh position={[0, 1.4, 0]} receiveShadow castShadow>
      <boxGeometry args={[4, 0.1, 2]} />
      {woodMaterial}
    </mesh>
    {/* Legs */}
    <mesh position={[-1.8, 0.7, 0.8]} castShadow><boxGeometry args={[0.1, 1.4, 0.1]} /><meshStandardMaterial color="#111" /></mesh>
    <mesh position={[1.8, 0.7, 0.8]} castShadow><boxGeometry args={[0.1, 1.4, 0.1]} /><meshStandardMaterial color="#111" /></mesh>
    <mesh position={[-1.8, 0.7, -0.8]} castShadow><boxGeometry args={[0.1, 1.4, 0.1]} /><meshStandardMaterial color="#111" /></mesh>
    <mesh position={[1.8, 0.7, -0.8]} castShadow><boxGeometry args={[0.1, 1.4, 0.1]} /><meshStandardMaterial color="#111" /></mesh>
  </group>
);

export const Monitor: React.FC<{ onClick: () => void, active: boolean }> = ({ onClick, active }) => {
  const [hovered, setHovered] = useState(false);
  useCursor(hovered && !active);

  return (
    <group position={[0, 0.1, -0.5]} 
      onPointerOver={() => !active && setHovered(true)} 
      onPointerOut={() => setHovered(false)}
      onClick={(e) => { 
        e.stopPropagation(); 
        if (!active) onClick(); 
      }}
    >
      {/* Stand */}
      <mesh position={[0, 0, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.1, 0.5]} />
        {plasticDarkGrey}
      </mesh>
      {/* Screen Bezel */}
      <mesh position={[0, 0.5, 0.1]} castShadow>
        <boxGeometry args={[1.8, 1.1, 0.05]} />
        {screenMaterial}
      </mesh>
      {/* Screen Display */}
      <mesh position={[0, 0.5, 0.13]}>
        <planeGeometry args={[1.7, 1]} />
        {active ? screenOff : screenGlow}
      </mesh>
      {hovered && !active && (
        <Text position={[0, 1.3, 0]} fontSize={0.15} color="white" outlineColor="black" outlineWidth={0.02}>
          Click to Start
        </Text>
      )}
    </group>
  );
};

export const Speakers: React.FC = () => (
  <group>
    {/* Left Speaker */}
    <group position={[-1.2, 0.2, -0.5]} rotation={[0, 0.2, 0]}>
      <mesh castShadow>
        <boxGeometry args={[0.3, 0.6, 0.3]} />
        {plasticBlack}
      </mesh>
      <mesh position={[0, 0, 0.151]}>
        <circleGeometry args={[0.08]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <mesh position={[0, -0.15, 0.151]}>
        <circleGeometry args={[0.1]} />
        <meshStandardMaterial color="#333" />
      </mesh>
    </group>
    {/* Right Speaker */}
    <group position={[1.2, 0.2, -0.5]} rotation={[0, -0.2, 0]}>
      <mesh castShadow>
        <boxGeometry args={[0.3, 0.6, 0.3]} />
        {plasticBlack}
      </mesh>
      <mesh position={[0, 0, 0.151]}>
        <circleGeometry args={[0.08]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <mesh position={[0, -0.15, 0.151]}>
        <circleGeometry args={[0.1]} />
        <meshStandardMaterial color="#333" />
      </mesh>
    </group>
  </group>
);

// --- Procedural Keyboard ---

interface KeyProps {
  position: [number, number, number];
  width?: number;
  label?: string;
  code: string;
  activeCodes: Set<string>;
}

const Key: React.FC<KeyProps> = ({ position, width = 0.04, code, activeCodes }) => {
  const isPressed = activeCodes.has(code);
  const groupRef = useRef<THREE.Group>(null);
  
  // Animation for key press
  useFrame(() => {
    if (groupRef.current) {
      const targetY = isPressed ? -0.01 : 0;
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, 0.4);
    }
  });

  return (
    <group position={position} ref={groupRef}>
      <mesh castShadow receiveShadow position={[0, 0.015, 0]}>
        <boxGeometry args={[width, 0.03, 0.04]} />
        <primitive object={isPressed ? keyActiveMat : keyBaseMat} attach="material" />
      </mesh>
    </group>
  );
};

export const Keyboard: React.FC = () => {
  const [activeCodes, setActiveCodes] = useState<Set<string>>(new Set());

  useEffect(() => {
    const handleDown = (e: KeyboardEvent) => setActiveCodes(prev => new Set(prev).add(e.code));
    const handleUp = (e: KeyboardEvent) => setActiveCodes(prev => {
      const next = new Set(prev);
      next.delete(e.code);
      return next;
    });
    window.addEventListener('keydown', handleDown);
    window.addEventListener('keyup', handleUp);
    return () => {
      window.removeEventListener('keydown', handleDown);
      window.removeEventListener('keyup', handleUp);
    };
  }, []);

  // Layout generation for a 60% keyboard
  // 0.05 unit spacing approx
  const rows = [
    ['Backquote', 'Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6', 'Digit7', 'Digit8', 'Digit9', 'Digit0', 'Minus', 'Equal', 'Backspace'],
    ['Tab', 'KeyQ', 'KeyW', 'KeyE', 'KeyR', 'KeyT', 'KeyY', 'KeyU', 'KeyI', 'KeyO', 'KeyP', 'BracketLeft', 'BracketRight', 'Backslash'],
    ['CapsLock', 'KeyA', 'KeyS', 'KeyD', 'KeyF', 'KeyG', 'KeyH', 'KeyJ', 'KeyK', 'KeyL', 'Semicolon', 'Quote', 'Enter'],
    ['ShiftLeft', 'KeyZ', 'KeyX', 'KeyC', 'KeyV', 'KeyB', 'KeyN', 'KeyM', 'Comma', 'Period', 'Slash', 'ShiftRight'],
    ['ControlLeft', 'MetaLeft', 'AltLeft', 'Space', 'AltRight', 'Fn', 'ControlRight']
  ];

  const rowOffsets = [0, 0.02, 0.04, 0.06, 0]; // Visual stagger
  const keySpacing = 0.05;

  return (
    <group position={[0, -0.05, 0.45]}>
      {/* Chassis */}
      <mesh receiveShadow castShadow position={[0, -0.01, 0.1]}>
        <boxGeometry args={[0.8, 0.02, 0.35]} />
        {plasticBlack}
      </mesh>

      {/* Generated Keys */}
      <group position={[-0.35, 0.01, -0.02]}>
        {rows.map((row, rowIndex) => {
          let currentX = 0;
          const z = rowIndex * 0.055;
          
          return row.map((code, keyIndex) => {
            let w = 0.04;
            // Special widths
            if (code === 'Backspace') w = 0.09;
            if (code === 'Tab') w = 0.06;
            if (code === 'CapsLock') w = 0.07;
            if (code === 'Enter') w = 0.11;
            if (code === 'ShiftLeft') w = 0.10;
            if (code === 'ShiftRight') w = 0.13;
            if (code === 'Space') w = 0.3;
            if (code.startsWith('Control') || code.startsWith('Alt') || code.startsWith('Meta')) w = 0.05;

            const pos: [number, number, number] = [currentX + w / 2, 0, z];
            currentX += w + 0.01; // space between keys

            return <Key key={code} code={code} position={pos} width={w} activeCodes={activeCodes} />;
          });
        })}
      </group>
    </group>
  );
};

export const Mouse: React.FC = () => {
  const mouseRef = useRef<THREE.Group>(null);
  const [clicked, setClicked] = useState(false);

  useFrame((state) => {
    if (mouseRef.current) {
      // Map screen pointer (-1 to 1) to mousepad area on desk
      // Mousepad area approx: x: [0.5, 1.0], z: [0.2, 0.6]
      // Only move mouse if we are NOT in FOCUSED mode to avoid weird jumps, or map nicely?
      // User wants real feedback.
      const targetX = 0.8 + (state.pointer.x * 0.1);
      const targetZ = 0.45 - (state.pointer.y * 0.1);
      
      mouseRef.current.position.lerp(new THREE.Vector3(targetX, -0.02, targetZ), 0.2);
    }
  });

  useEffect(() => {
    const handleDown = () => setClicked(true);
    const handleUp = () => setClicked(false);
    window.addEventListener('mousedown', handleDown);
    window.addEventListener('mouseup', handleUp);
    return () => {
      window.removeEventListener('mousedown', handleDown);
      window.removeEventListener('mouseup', handleUp);
    };
  }, []);

  return (
    <group>
      {/* Mousepad */}
      <mesh position={[0.8, -0.045, 0.45]} receiveShadow>
        <boxGeometry args={[0.4, 0.01, 0.35]} />
        <meshStandardMaterial color="#222" />
      </mesh>

      {/* Mouse */}
      <group ref={mouseRef} position={[0.8, -0.02, 0.45]}>
        <mesh castShadow position={[0, 0.03, 0]}>
          <boxGeometry args={[0.08, 0.05, 0.12]} />
          <meshStandardMaterial 
            color={clicked ? "#4f46e5" : "#151515"} 
            emissive={clicked ? "#4f46e5" : "black"}
            roughness={0.3} 
          />
        </mesh>
        {/* Scroll Wheel */}
        <mesh position={[0, 0.055, -0.03]}>
           <boxGeometry args={[0.01, 0.01, 0.02]} />
           <meshStandardMaterial color="#333" />
        </mesh>
      </group>
    </group>
  );
};