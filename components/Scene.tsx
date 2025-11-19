import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { PerspectiveCamera, OrbitControls, Environment, SoftShadows } from '@react-three/drei';
import * as THREE from 'three';
import { Desk, Monitor, Keyboard, Mouse, Speakers } from './RoomObjects';
import { ViewState } from '../types';

interface SceneProps {
  viewState: ViewState;
  setViewState: (state: ViewState) => void;
}

const Scene: React.FC<SceneProps> = ({ viewState, setViewState }) => {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const orbitRef = useRef<any>(null);
  
  // State positions
  const defaultPos = new THREE.Vector3(2, 2, 3);
  const defaultTarget = new THREE.Vector3(0, -0.5, 0);
  
  // Monitor focus position (zoom in)
  const monitorPos = new THREE.Vector3(0, 0.5, 1.8); 
  const monitorTarget = new THREE.Vector3(0, 0.5, -1);

  // Shutdown position (zoom out slightly differently)
  const shutdownPos = new THREE.Vector3(0, 1, 4);

  useFrame((state) => {
    if (!cameraRef.current || !orbitRef.current) return;

    // If we are in IDLE, let OrbitControls handle everything. Do NOT lerp.
    if (viewState === ViewState.IDLE) {
      return;
    }

    // If FOCUSED or SHUTTING_DOWN, take control of camera
    const step = 0.08;
    let targetPos = monitorPos;
    let targetLook = monitorTarget;

    if (viewState === ViewState.SHUTTING_DOWN) {
        targetPos = shutdownPos;
        targetLook = defaultTarget;
    }

    cameraRef.current.position.lerp(targetPos, step);
    orbitRef.current.target.lerp(targetLook, step);
    orbitRef.current.update();
  });

  // Handle resetting orbit controls target when switching back to IDLE
  useEffect(() => {
    if (viewState === ViewState.IDLE && orbitRef.current) {
        // Optional: Smoothly reset orbit target or just leave it where the user left it?
        // User said "Don't rebound". Leaving it is safest, or resetting to desk center.
        // Let's reset the target to desk center but keep camera position flexible
        // so it doesn't snap jarringly.
    }
  }, [viewState]);

  return (
    <>
      <PerspectiveCamera makeDefault ref={cameraRef} position={[2.5, 1.5, 3.5]} fov={50} />
      
      <OrbitControls 
        ref={orbitRef}
        target={[0, -0.5, 0]}
        enabled={viewState === ViewState.IDLE}
        enableZoom={true} 
        enablePan={false}
        maxPolarAngle={Math.PI / 2} 
        minPolarAngle={0}
        minDistance={1.5}
        maxDistance={8}
      />

      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight 
        position={[5, 8, 5]} 
        intensity={0.8} 
        castShadow 
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0001}
      />
      
      {/* Dynamic Screen Light */}
      <pointLight 
        position={[0, 0.5, 0.5]} 
        intensity={viewState === ViewState.FOCUSED ? 0.1 : 0.5} 
        color="#4f46e5" 
        distance={3} 
        decay={2}
      />

      {/* Room Shell */}
      <group receiveShadow>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]} receiveShadow>
          <planeGeometry args={[20, 20]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
      </group>

      {/* Objects */}
      <Desk />
      <Monitor active={viewState === ViewState.FOCUSED} onClick={() => setViewState(ViewState.FOCUSED)} />
      <Keyboard />
      <Mouse />
      <Speakers />

      <SoftShadows size={15} samples={16} focus={0.8} />
      <Environment preset="city" blur={0.8} background={false} />
    </>
  );
};

export default Scene;