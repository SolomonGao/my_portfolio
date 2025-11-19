import React, { useRef, useEffect, useState } from 'react';
import { useFrame, useThree, ThreeElements } from '@react-three/fiber';
import { PerspectiveCamera, OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { Desk, Monitor, Keyboard, Mouse, Speakers, RGBController } from './RoomObjects';
import { ViewState } from '../types';
import { useMusic } from '../context/MusicContext';

// Fix for R3F intrinsic elements in TypeScript
declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}

interface SceneProps {
  viewState: ViewState;
  setViewState: (state: ViewState) => void;
}

const Scene: React.FC<SceneProps> = ({ viewState, setViewState }) => {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const orbitRef = useRef<any>(null);
  const { setVolume } = useMusic();
  
  // RGB State
  const [rgbValues, setRgbValues] = useState({ r: 0, g: 255, b: 128 });
  const [isRainbow, setIsRainbow] = useState(false);
  const [isRgbOpen, setIsRgbOpen] = useState(false);
  
  // Camera State - Default to FALSE (Free View) so zoom works immediately
  const [isCameraLocked, setIsCameraLocked] = useState(false);
  
  // Reset State - Handles smooth transition back to original view
  const [isResettingCamera, setIsResettingCamera] = useState(false);

  // Rainbow Logic for Mouse/Controller Sync
  const [rainbowColor, setRainbowColor] = useState(new THREE.Color());

  // Interaction Handlers (Volume, RGB, Camera Lock)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only allow room interactions when not focused on the computer screen
      if (viewState !== ViewState.IDLE) return;

      // RGB Controller Toggle
      if (e.key === 'Control' && !e.repeat) {
        setIsRgbOpen(prev => !prev);
      }

      // Camera Lock Toggle
      if (e.code === 'Space' && !e.repeat) {
        setIsCameraLocked(prev => !prev);
      }

      // Volume Controls
      // A = Increase (+), D = Decrease (-)
      if (e.code === 'KeyA') {
        setVolume(prev => Math.min(1, parseFloat((prev + 0.05).toFixed(2))));
      }
      if (e.code === 'KeyD') {
        setVolume(prev => Math.max(0, parseFloat((prev - 0.05).toFixed(2))));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewState, setVolume]);
  
  // Trigger Camera Reset when entering IDLE state (from Splash or Desktop)
  useEffect(() => {
    if (viewState === ViewState.IDLE) {
      setIsResettingCamera(true);
    }
  }, [viewState]);

  useFrame((state) => {
    if (isRainbow) {
       const time = state.clock.getElapsedTime();
       const hue = (time * 0.5) % 1;
       setRainbowColor(new THREE.Color().setHSL(hue, 1, 0.5));
    }

    if (!cameraRef.current) return;

    // Camera Logic based on State
    const step = 0.08; // Slightly faster interpolation for responsiveness
    
    if (viewState === ViewState.SPLASH) {
      // Cinematic rotation around the room
      const time = state.clock.getElapsedTime();
      const radius = 3.5;
      cameraRef.current.position.x = Math.sin(time * 0.2) * radius;
      cameraRef.current.position.z = Math.cos(time * 0.2) * radius;
      cameraRef.current.position.y = 1.5;
      cameraRef.current.lookAt(0, -0.5, 0);
      
      if (orbitRef.current) orbitRef.current.enabled = false;
    }
    else if (viewState === ViewState.IDLE) {
      const defaultPos = new THREE.Vector3(0, 1.5, 3.5);
      const defaultTarget = new THREE.Vector3(0, -0.5, 0);

      // Priority 1: Resetting to comfortable position (Transition)
      if (isResettingCamera) {
        cameraRef.current.position.lerp(defaultPos, step);
        if (orbitRef.current) {
          orbitRef.current.target.lerp(defaultTarget, step);
          orbitRef.current.update();
          orbitRef.current.enabled = false; // Disable control during reset
        }
        
        // Check if reset is complete (close enough)
        if (cameraRef.current.position.distanceTo(defaultPos) < 0.1) {
           setIsResettingCamera(false);
        }
      } 
      // Priority 2: Locked View Mode
      else if (isCameraLocked) {
        cameraRef.current.position.lerp(defaultPos, step);
        
        if (orbitRef.current) {
          orbitRef.current.target.lerp(defaultTarget, step);
          orbitRef.current.enabled = true;
          orbitRef.current.enableZoom = false; // Lock Zoom
          orbitRef.current.maxPolarAngle = Math.PI / 2.2;
          orbitRef.current.minPolarAngle = Math.PI / 4;
          orbitRef.current.maxAzimuthAngle = Math.PI / 4;
          orbitRef.current.minAzimuthAngle = -Math.PI / 4;
        }
      } 
      // Priority 3: Free View Mode
      else {
        if (orbitRef.current) {
          orbitRef.current.enabled = true;
          orbitRef.current.enableZoom = true; // Enable Zoom
          orbitRef.current.maxPolarAngle = Math.PI / 1.8; // Prevent going under floor
          orbitRef.current.minPolarAngle = 0.1;
          orbitRef.current.maxAzimuthAngle = Infinity; // Free rotation
          orbitRef.current.minAzimuthAngle = Infinity;
        }
      }
    } else if (viewState === ViewState.FOCUSED) {
      const targetPos = new THREE.Vector3(0, 0.1, 0.8); // Zoomed into monitor
      cameraRef.current.position.lerp(targetPos, step);
      if (orbitRef.current) {
        orbitRef.current.target.lerp(new THREE.Vector3(0, 0.1, -1), step);
        orbitRef.current.enabled = false; // Lock rotation when focused
      }
    }
  });

  // Derived color for passing to components
  const currentLedColor = isRainbow ? `#${rainbowColor.getHexString()}` : `rgb(${rgbValues.r}, ${rgbValues.g}, ${rgbValues.b})`;

  return (
    <>
      <PerspectiveCamera makeDefault ref={cameraRef} fov={50} position={[0, 1.5, 3.5]} />
      <OrbitControls ref={orbitRef} enablePan={false} enableZoom={true} />

      {/* Lighting - Optimized for Performance & Visual Fidelity */}
      <ambientLight intensity={0.4} />
      
      {/* Main Key Light - High Quality Shadows */}
      <pointLight 
        position={[2, 3, 2]} 
        intensity={0.8} 
        castShadow 
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-bias={-0.0001}
      />
      
      {/* Fill Light - Soft purple ambience, no shadow for perf */}
      <pointLight position={[-2, 2, 2]} intensity={0.5} color="#4c1d95" /> 
      
      {/* Dynamic Room RGB Light - Lower res shadow for softness & perf */}
      <pointLight 
        position={[0, 1, 0]} 
        intensity={1.5} 
        distance={3}
        color={currentLedColor}
        castShadow
        shadow-mapSize-width={512}
        shadow-mapSize-height={512}
        shadow-bias={-0.0001}
      />

      <Environment preset="city" />
      
      {/* Room Content */}
      <group>
        <Desk />
        
        <Monitor 
          active={viewState === ViewState.FOCUSED} 
          onClick={() => {
             if (viewState === ViewState.IDLE) setViewState(ViewState.FOCUSED);
          }} 
        />
        
        <Keyboard ledColor={currentLedColor} isRainbowMode={isRainbow} />
        
        <Mouse ledColor={currentLedColor} />
        
        <Speakers />

        <RGBController 
           rgb={rgbValues} 
           setRgb={setRgbValues} 
           isRainbow={isRainbow} 
           setIsRainbow={setIsRainbow} 
           isOpen={isRgbOpen}
           setIsOpen={setIsRgbOpen}
        />
      </group>

      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#111" roughness={0.6} metalness={0.2} />
      </mesh>
    </>
  );
};

export default Scene;