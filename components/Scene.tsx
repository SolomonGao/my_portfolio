import React, { useRef, useEffect, useState } from 'react';
import { useFrame, useThree, ThreeElements } from '@react-three/fiber';
import { PerspectiveCamera, OrbitControls, Environment, SoftShadows } from '@react-three/drei';
import * as THREE from 'three';
import { Desk, Monitor, Keyboard, Mouse, Speakers, RGBController } from './RoomObjects';
import { ViewState } from '../types';
import { useMusic } from '../context/MusicContext';

// Augment the JSX namespace to include R3F elements
declare global {
  namespace JSX {
    interface IntrinsicElements {
      ambientLight: any;
      pointLight: any;
      directionalLight: any;
      group: any;
      mesh: any;
      planeGeometry: any;
      meshStandardMaterial: any;
    }
  }
}

interface SceneProps {
  viewState: ViewState;
  setViewState: (state: ViewState) => void;
}

const Scene: React.FC<SceneProps> = ({ viewState, setViewState }) => {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const orbitRef = useRef<any>(null);
  const { viewport } = useThree();
  const { setVolume } = useMusic();
  
  // RGB State
  const [rgbValues, setRgbValues] = useState({ r: 0, g: 255, b: 128 });
  const [isRainbow, setIsRainbow] = useState(false);
  const [isRgbOpen, setIsRgbOpen] = useState(false);

  // Rainbow Logic for Mouse/Controller Sync
  const [rainbowColor, setRainbowColor] = useState(new THREE.Color());
  useFrame((state) => {
    if (isRainbow) {
       const time = state.clock.getElapsedTime();
       const hue = (time * 0.5) % 1;
       setRainbowColor(new THREE.Color().setHSL(hue, 1, 0.5));
    }
  });

  // Determine final color string to pass to props
  const staticHex = new THREE.Color(`rgb(${rgbValues.r}, ${rgbValues.g}, ${rgbValues.b})`).getHexString();
  const finalColor = isRainbow ? `#${rainbowColor.getHexString()}` : `#${staticHex}`;

  // Responsive Logic
  const isMobile = viewport.width < 5;
  
  const defaultPos = new THREE.Vector3(
    isMobile ? 3 : 2.5, 
    isMobile ? 3 : 1.5, 
    isMobile ? 5.5 : 3.5
  );
  const defaultTarget = new THREE.Vector3(0, -0.5, 0);
  
  const monitorPos = new THREE.Vector3(0, 0.5, 1.8); 
  const monitorTarget = new THREE.Vector3(0, 0.5, -1);

  const shutdownPos = new THREE.Vector3(0, 1, 4);

  // Volume Hotkeys (A / D) and RGB Toggle (Ctrl)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      const key = e.key.toLowerCase();
      if (key === 'a') {
        setVolume((prev) => Math.min(1, prev + 0.05)); // A is Volume Increase
      } else if (key === 'd') {
        setVolume((prev) => Math.max(0, prev - 0.05)); // D is Volume Decrease
      } else if (e.key === 'Control') {
        setIsRgbOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setVolume]);

  useFrame((state) => {
    if (!cameraRef.current || !orbitRef.current) return;

    if (viewState === ViewState.IDLE) {
      return;
    }

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

  useEffect(() => {
    if (viewState === ViewState.IDLE && cameraRef.current) {
       cameraRef.current.position.copy(defaultPos);
    }
  }, [isMobile]);

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
        maxDistance={isMobile ? 12 : 8}
      />

      {/* Lighting */}
      <ambientLight intensity={0.2} />
      <directionalLight 
        position={[5, 8, 5]} 
        intensity={1.0} 
        castShadow 
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0001}
      />
      
      {/* Dynamic Screen Light */}
      <pointLight 
        position={[0, 0.5, 0.5]} 
        intensity={viewState === ViewState.FOCUSED ? 0.2 : 0.5} 
        color="#4f46e5" 
        distance={3} 
        decay={2}
      />

      <group receiveShadow>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]} receiveShadow>
          <planeGeometry args={[20, 20]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
      </group>

      <Desk />
      <Monitor active={viewState === ViewState.FOCUSED} onClick={() => setViewState(ViewState.FOCUSED)} />
      <Keyboard ledColor={finalColor} isRainbowMode={isRainbow} />
      
      <RGBController 
        rgb={rgbValues} 
        setRgb={setRgbValues} 
        isRainbow={isRainbow} 
        setIsRainbow={setIsRainbow} 
        isOpen={isRgbOpen}
        setIsOpen={setIsRgbOpen}
      />
      
      <Mouse ledColor={finalColor} />
      <Speakers />

      <SoftShadows size={15} samples={16} focus={0.8} />
      <Environment preset="city" blur={0.8} background={false} />
    </>
  );
};

export default Scene;