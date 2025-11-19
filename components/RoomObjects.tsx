import React, { useState, useEffect, useRef } from 'react';
import { Text, useCursor, Html } from '@react-three/drei';
import { useFrame, useThree, ThreeElements } from '@react-three/fiber';
import * as THREE from 'three';
import { useMusic } from '../context/MusicContext';

// Augment the JSX namespace to include R3F elements
declare global {
  namespace JSX {
    interface IntrinsicElements {
      group: any;
      mesh: any;
      meshStandardMaterial: any;
      meshBasicMaterial: any;
      boxGeometry: any;
      planeGeometry: any;
      cylinderGeometry: any;
      ringGeometry: any;
      circleGeometry: any;
      torusGeometry: any;
      ambientLight: any;
      directionalLight: any;
      pointLight: any;
    }
  }
}

// Augment the JSX namespace to include R3F elements
declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}

// --- Materials ---
// High-end metallic material similar to the volume knob
const darkMetalMaterial = <meshStandardMaterial color="#1a1a1a" metalness={0.85} roughness={0.2} />;
const brushedMetalMaterial = <meshStandardMaterial color="#333" metalness={0.9} roughness={0.3} />;
const silverAccent = <meshStandardMaterial color="#e5e7eb" metalness={1} roughness={0.1} />;

const woodMaterial = <meshStandardMaterial color="#8B5A2B" roughness={0.8} />;
const screenMaterial = <meshStandardMaterial color="#050505" roughness={0.2} metalness={0.8} />;
const screenOff = <meshStandardMaterial color="#000" roughness={0.2} metalness={0.5} />;
const padMaterial = <meshStandardMaterial color="#111" roughness={0.9} metalness={0.1} />;

// --- Windows Logo Component ---
const WindowsLogo: React.FC = () => {
  return (
    <group scale={0.3} rotation={[0, 0, 0]}>
      <mesh position={[-0.55, 0.55, 0]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial color="#f25022" toneMapped={false} />
      </mesh>
      <mesh position={[0.55, 0.55, 0]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial color="#7fba00" toneMapped={false} />
      </mesh>
      <mesh position={[-0.55, -0.55, 0]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial color="#00a4ef" toneMapped={false} />
      </mesh>
      <mesh position={[0.55, -0.55, 0]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial color="#ffb900" toneMapped={false} />
      </mesh>
    </group>
  );
};

// --- RGB Controller Component ---
interface RGBControllerProps {
  rgb: { r: number, g: number, b: number };
  setRgb: (val: { r: number, g: number, b: number }) => void;
  isRainbow: boolean;
  setIsRainbow: (val: boolean) => void;
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
}

export const RGBController: React.FC<RGBControllerProps> = ({ rgb, setRgb, isRainbow, setIsRainbow, isOpen, setIsOpen }) => {
  const [hovered, setHovered] = useState(false);
  useCursor(hovered);

  // Calculate current display color
  const displayColor = isRainbow ? '#ffffff' : `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
  const cssColor = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;

  return (
    <group position={[-0.6, -0.05, 0.5]}>
      {/* Glowing Coaster/Pad */}
      <group position={[0, 0.002, 0]}>
        {/* Outer Glow Ring */}
        <mesh position={[0, 0, 0]} rotation={[-Math.PI/2, 0, 0]}>
           <ringGeometry args={[0.1, 0.105, 32]} />
           <meshBasicMaterial color={displayColor} toneMapped={false} />
        </mesh>
        {/* Dark Pad Base */}
        <mesh position={[0, 0, 0]} receiveShadow>
           <cylinderGeometry args={[0.1, 0.1, 0.004, 32]} />
           {padMaterial}
        </mesh>
      </group>

      {/* Controller Unit (Lifted slightly to sit on pad) */}
      <group position={[0, 0.005, 0]}>
        {/* Metallic Base Stand */}
        <mesh position={[0, -0.01, 0]} receiveShadow castShadow>
          <cylinderGeometry args={[0.08, 0.09, 0.02, 32]} />
          {darkMetalMaterial}
        </mesh>
        
        {/* Glowing Ring Base */}
        <mesh position={[0, -0.005, 0]}>
           <torusGeometry args={[0.082, 0.002, 16, 32]} />
           <meshBasicMaterial color={displayColor} toneMapped={false} opacity={0.8} transparent />
        </mesh>

        {/* The "Knob" / Controller Button */}
        <mesh 
          position={[0, 0.02, 0]} 
          onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
          castShadow
        >
          <cylinderGeometry args={[0.06, 0.06, 0.04, 32]} />
          {brushedMetalMaterial}
        </mesh>

        {/* Top Glow Ring */}
        <mesh position={[0, 0.041, 0]} rotation={[-Math.PI/2, 0, 0]}>
          <ringGeometry args={[0.045, 0.05, 32]} />
          <meshBasicMaterial color={displayColor} toneMapped={false} />
        </mesh>

        {/* Floating UI Label */}
        <Text position={[0, 0.12, 0]} fontSize={0.03} color="white" rotation={[-Math.PI/4, 0, 0]}>
          RGB LINK
        </Text>
      </group>

      {/* Popup UI for Sliders */}
      {isOpen && (
        <Html position={[0, 0.3, 0]} center transform distanceFactor={3}>
          <div 
            className="bg-zinc-900/95 text-white p-5 rounded-xl border border-zinc-700 shadow-2xl w-72 select-none backdrop-blur-xl"
            onPointerDown={(e) => e.stopPropagation()} 
          >
            <div className="flex justify-between items-center mb-4 border-b border-zinc-700 pb-3">
              <h3 className="font-bold text-xs uppercase tracking-widest text-zinc-400">Lighting Core</h3>
              <button onClick={() => setIsOpen(false)} className="text-zinc-500 hover:text-white transition-colors">✕</button>
            </div>

            <div className="space-y-5">
              {/* Rainbow Toggle */}
              <div className="flex items-center justify-between bg-zinc-800/50 p-2 rounded-lg">
                <label className="text-xs font-bold text-zinc-300">Rainbow Wave</label>
                <input 
                  type="checkbox" 
                  checked={isRainbow} 
                  onChange={(e) => setIsRainbow(e.target.checked)}
                  className="accent-indigo-500 w-4 h-4 cursor-pointer"
                />
              </div>

              {/* Sample Preview Box */}
              <div className="relative w-full h-12 rounded-lg overflow-hidden border border-zinc-600 shadow-inner group">
                 <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 z-10"></div>
                 <div 
                    className="w-full h-full transition-all duration-500"
                    style={{
                        background: isRainbow 
                          ? 'linear-gradient(90deg, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)' 
                          : cssColor,
                        boxShadow: `inset 0 0 20px rgba(0,0,0,0.5)`,
                        backgroundSize: '200% 100%',
                        animation: isRainbow ? 'rainbowMove 2s linear infinite' : 'none'
                    }}
                 />
                 <div className="absolute inset-0 flex items-center justify-center z-20">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-white/80 drop-shadow-md">
                        Live Preview
                    </span>
                 </div>
                 <style>{`
                    @keyframes rainbowMove { 0% { background-position: 100% 0; } 100% { background-position: -100% 0; } }
                 `}</style>
              </div>

              {/* Sliders (Disabled if Rainbow) */}
              <div className={`space-y-3 transition-all duration-300 ${isRainbow ? 'opacity-30 pointer-events-none blur-[1px]' : 'opacity-100'}`}>
                <div>
                  <div className="flex justify-between text-[10px] mb-1 text-red-400 font-mono">
                    <span>R</span> <span>{rgb.r}</span>
                  </div>
                  <input 
                    type="range" min="0" max="255" value={rgb.r} 
                    onChange={(e) => setRgb({ ...rgb, r: parseInt(e.target.value) })}
                    className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-red-500"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-[10px] mb-1 text-green-400 font-mono">
                    <span>G</span> <span>{rgb.g}</span>
                  </div>
                  <input 
                    type="range" min="0" max="255" value={rgb.g} 
                    onChange={(e) => setRgb({ ...rgb, g: parseInt(e.target.value) })}
                    className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-green-500"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-[10px] mb-1 text-blue-400 font-mono">
                    <span>B</span> <span>{rgb.b}</span>
                  </div>
                  <input 
                    type="range" min="0" max="255" value={rgb.b} 
                    onChange={(e) => setRgb({ ...rgb, b: parseInt(e.target.value) })}
                    className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
};

export const Desk: React.FC = () => (
  <group position={[0, -1.5, 0]}>
    {/* Table Top */}
    <mesh position={[0, 1.4, 0]} receiveShadow castShadow>
      <boxGeometry args={[4.5, 0.1, 2]} />
      {woodMaterial}
    </mesh>
    {/* Legs */}
    <mesh position={[-2, 0.7, 0.8]} castShadow><boxGeometry args={[0.1, 1.4, 0.1]} />{darkMetalMaterial}</mesh>
    <mesh position={[2, 0.7, 0.8]} castShadow><boxGeometry args={[0.1, 1.4, 0.1]} />{darkMetalMaterial}</mesh>
    <mesh position={[-2, 0.7, -0.8]} castShadow><boxGeometry args={[0.1, 1.4, 0.1]} />{darkMetalMaterial}</mesh>
    <mesh position={[2, 0.7, -0.8]} castShadow><boxGeometry args={[0.1, 1.4, 0.1]} />{darkMetalMaterial}</mesh>
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
      {/* Metallic Stand */}
      <mesh position={[0, 0, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.12, 0.5]} />
        {darkMetalMaterial}
      </mesh>
      <mesh position={[0, -0.24, 0.1]}>
        <boxGeometry args={[0.4, 0.02, 0.4]} />
        {darkMetalMaterial}
      </mesh>

      {/* Metallic Screen Bezel */}
      <mesh position={[0, 0.5, 0.1]} castShadow>
        <boxGeometry args={[1.82, 1.12, 0.04]} />
        <meshStandardMaterial color="#222" metalness={0.95} roughness={0.2} />
      </mesh>
      
      {/* Screen Display Area */}
      {active ? (
         <mesh position={[0, 0.5, 0.121]}>
           <planeGeometry args={[1.75, 1.05]} />
           {screenOff}
         </mesh>
      ) : (
         <group position={[0, 0.5, 0.121]}>
            <mesh>
              <planeGeometry args={[1.75, 1.05]} />
              <meshStandardMaterial color="#000" roughness={0.1} metalness={0.2} />
            </mesh>
            <group position={[0, 0.1, 0.01]}>
               <WindowsLogo />
            </group>
            {hovered && (
              <Text position={[0, -0.3, 0.02]} fontSize={0.08} color="white" outlineColor="black" outlineWidth={0.01}>
                Click to Start
              </Text>
            )}
         </group>
      )}
    </group>
  );
};

// --- Volume Knob Component ---
const VolumeKnob: React.FC = () => {
  const { volume } = useMusic();
  const rotationZ = THREE.MathUtils.degToRad(-135 + (volume * 270));

  return (
    <group position={[0, -0.22, 0.152]}>
      {/* Glowing Back Ring */}
      <mesh position={[0, 0, -0.002]}>
        <ringGeometry args={[0.035, 0.04, 32]} />
        <meshBasicMaterial 
          color="#0ea5e9" 
          opacity={0.2 + (volume * 0.8)} 
          transparent 
          side={THREE.DoubleSide} 
          toneMapped={false}
        />
      </mesh>

      {/* Metallic Knob Body */}
      <group rotation={[0, 0, rotationZ]}>
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.032, 0.032, 0.02, 32]} />
          {silverAccent}
        </mesh>
        {/* Indicator Line */}
        <mesh position={[0, 0.014, 0.011]}>
           <boxGeometry args={[0.004, 0.012, 0.005]} />
           <meshStandardMaterial 
             color="#0ea5e9" 
             emissive="#0ea5e9" 
             emissiveIntensity={1 + (volume * 2)} 
             toneMapped={false}
           />
        </mesh>
      </group>
      
      <Text position={[0, -0.05, 0.01]} fontSize={0.015} color="#888" font="https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxM.woff">
        VOLUME
      </Text>
    </group>
  );
};

export const Speakers: React.FC = () => (
  <group>
    {/* Left Speaker */}
    <group position={[-1.2, 0.2, -0.5]} rotation={[0, 0.2, 0]}>
      <mesh castShadow>
        <boxGeometry args={[0.3, 0.6, 0.3]} />
        {darkMetalMaterial}
      </mesh>
      {/* Metallic Trim around Drivers */}
      <mesh position={[0, 0.12, 0.151]}>
        <ringGeometry args={[0.08, 0.09, 32]} />
        {silverAccent}
      </mesh>
      <mesh position={[0, -0.08, 0.151]}>
        <ringGeometry args={[0.08, 0.09, 32]} />
        {silverAccent}
      </mesh>
      
      {/* Drivers */}
      <mesh position={[0, 0.12, 0.151]}>
        <circleGeometry args={[0.08]} />
        <meshStandardMaterial color="#111" roughness={0.4} />
      </mesh>
      <mesh position={[0, -0.08, 0.151]}>
        <circleGeometry args={[0.08]} />
        <meshStandardMaterial color="#111" roughness={0.4} />
      </mesh>
      <VolumeKnob />
    </group>

    {/* Right Speaker */}
    <group position={[1.2, 0.2, -0.5]} rotation={[0, -0.2, 0]}>
      <mesh castShadow>
        <boxGeometry args={[0.3, 0.6, 0.3]} />
        {darkMetalMaterial}
      </mesh>
      <mesh position={[0, 0.12, 0.151]}>
        <ringGeometry args={[0.08, 0.09, 32]} />
        {silverAccent}
      </mesh>
      <mesh position={[0, -0.08, 0.151]}>
        <ringGeometry args={[0.08, 0.09, 32]} />
        {silverAccent}
      </mesh>
      <mesh position={[0, 0.12, 0.151]}>
        <circleGeometry args={[0.08]} />
        <meshStandardMaterial color="#111" roughness={0.4} />
      </mesh>
      <mesh position={[0, -0.08, 0.151]}>
        <circleGeometry args={[0.08]} />
        <meshStandardMaterial color="#111" roughness={0.4} />
      </mesh>
    </group>
  </group>
);

// --- Procedural Keyboard ---

interface KeyProps {
  position: [number, number, number];
  width?: number;
  code: string;
  activeCodes: Set<string>;
  ledColor: string;
}

const Key: React.FC<KeyProps> = ({ position, width = 0.04, code, activeCodes, ledColor }) => {
  const isPressed = activeCodes.has(code);
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame(() => {
    if (groupRef.current) {
      const targetY = isPressed ? -0.005 : 0; 
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, 0.4);
    }
  });

  return (
    <group position={position} ref={groupRef}>
      <mesh castShadow receiveShadow position={[0, 0.02, 0]}>
        <boxGeometry args={[width, 0.03, 0.04]} />
        {/* Glow logic: keys have faint emission when idle, bright when pressed */}
        <meshStandardMaterial 
            color="#222" 
            metalness={0.6}
            roughness={0.4}
            emissive={ledColor} 
            emissiveIntensity={isPressed ? 3.0 : 0} 
            toneMapped={false}
        />
      </mesh>
    </group>
  );
};

interface KeyboardProps {
  ledColor: string;
  isRainbowMode: boolean;
}

export const Keyboard: React.FC<KeyboardProps> = ({ ledColor: userColor, isRainbowMode }) => {
  const [activeCodes, setActiveCodes] = useState<Set<string>>(new Set());
  const [rainbowColor, setRainbowColor] = useState(new THREE.Color(userColor));

  useFrame((state) => {
    if (isRainbowMode) {
      const time = state.clock.getElapsedTime();
      const hue = (time * 0.5) % 1;
      setRainbowColor(new THREE.Color().setHSL(hue, 1, 0.5));
    }
  });

  const currentColor = isRainbowMode ? `#${rainbowColor.getHexString()}` : userColor;

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

  const rows = [
    ['Backquote', 'Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6', 'Digit7', 'Digit8', 'Digit9', 'Digit0', 'Minus', 'Equal', 'Backspace'],
    ['Tab', 'KeyQ', 'KeyW', 'KeyE', 'KeyR', 'KeyT', 'KeyY', 'KeyU', 'KeyI', 'KeyO', 'KeyP', 'BracketLeft', 'BracketRight', 'Backslash'],
    ['CapsLock', 'KeyA', 'KeyS', 'KeyD', 'KeyF', 'KeyG', 'KeyH', 'KeyJ', 'KeyK', 'KeyL', 'Semicolon', 'Quote', 'Enter'],
    ['ShiftLeft', 'KeyZ', 'KeyX', 'KeyC', 'KeyV', 'KeyB', 'KeyN', 'KeyM', 'Comma', 'Period', 'Slash', 'ShiftRight'],
    ['ControlLeft', 'MetaLeft', 'AltLeft', 'Space', 'AltRight', 'Fn', 'ControlRight']
  ];

  return (
    <group position={[0, -0.05, 0.45]}>
      {/* Glowing Desk Mat for Keyboard */}
      <group position={[0, 0.002, 0.1]}>
         {/* Glow Border */}
         <mesh position={[0, -0.001, 0]}>
            <boxGeometry args={[0.86, 0.003, 0.40]} />
            <meshBasicMaterial color={currentColor} toneMapped={false} />
         </mesh>
         {/* Pad Surface */}
         <mesh receiveShadow>
            <boxGeometry args={[0.85, 0.004, 0.39]} />
            {padMaterial}
         </mesh>
      </group>

      {/* Lifted Keyboard Chassis to sit on mat */}
      <group position={[0, 0.005, 0]}>
        {/* Metallic Chassis */}
        <mesh receiveShadow castShadow position={[0, -0.01, 0.1]}>
            <boxGeometry args={[0.82, 0.02, 0.36]} />
            {darkMetalMaterial}
        </mesh>
        
        {/* Underglow Strip (Reflection on Chassis) */}
        <mesh position={[0, -0.02, 0.1]}>
            <boxGeometry args={[0.83, 0.005, 0.37]} />
            <meshBasicMaterial color={currentColor} toneMapped={false} opacity={0.1} transparent />
        </mesh>

        <group position={[-0.35, 0.01, -0.02]}>
            {rows.map((row, rowIndex) => {
            let currentX = 0;
            const z = rowIndex * 0.055;
            return row.map((code) => {
                let w = 0.04;
                if (code === 'Backspace') w = 0.09;
                if (code === 'Tab') w = 0.06;
                if (code === 'CapsLock') w = 0.07;
                if (code === 'Enter') w = 0.11;
                if (code === 'ShiftLeft') w = 0.10;
                if (code === 'ShiftRight') w = 0.13;
                if (code === 'Space') w = 0.3;
                if (code.startsWith('Control') || code.startsWith('Alt') || code.startsWith('Meta')) w = 0.05;

                const pos: [number, number, number] = [currentX + w / 2, 0, z];
                currentX += w + 0.01; 

                return <Key key={code} code={code} position={pos} width={w} activeCodes={activeCodes} ledColor={currentColor} />;
            });
            })}
        </group>
      </group>
    </group>
  );
};

export const Mouse: React.FC<{ ledColor: string }> = ({ ledColor }) => {
  const mouseRef = useRef<THREE.Group>(null);
  const [clickState, setClickState] = useState({ left: false, right: false });

  useFrame((state) => {
    if (mouseRef.current) {
      const targetX = 0.8 + (state.pointer.x * 0.1);
      const targetZ = 0.45 - (state.pointer.y * 0.1);
      mouseRef.current.position.lerp(new THREE.Vector3(targetX, -0.015, targetZ), 0.2); // Lifted slightly
    }
  });

  useEffect(() => {
    const handleDown = (e: MouseEvent) => {
        if (e.button === 0) setClickState(prev => ({ ...prev, left: true }));
        if (e.button === 2) setClickState(prev => ({ ...prev, right: true }));
    };
    const handleUp = (e: MouseEvent) => {
        if (e.button === 0) setClickState(prev => ({ ...prev, left: false }));
        if (e.button === 2) setClickState(prev => ({ ...prev, right: false }));
    };
    
    window.addEventListener('mousedown', handleDown);
    window.addEventListener('mouseup', handleUp);
    return () => {
      window.removeEventListener('mousedown', handleDown);
      window.removeEventListener('mouseup', handleUp);
    };
  }, []);

  return (
    <group>
      {/* Mousepad with RGB Border */}
      <group position={[0.8, -0.048, 0.45]}>
         {/* Glow Border */}
         <mesh position={[0, -0.001, 0]}>
            <boxGeometry args={[0.41, 0.003, 0.36]} />
            <meshBasicMaterial color={ledColor} toneMapped={false} />
         </mesh>
         {/* Pad Surface */}
         <mesh receiveShadow>
            <boxGeometry args={[0.4, 0.004, 0.35]} />
            {padMaterial}
         </mesh>
      </group>

      {/* Metallic Mouse */}
      <group ref={mouseRef} position={[0.8, -0.015, 0.45]}>
        <mesh castShadow position={[0, 0.03, 0]}>
          <boxGeometry args={[0.08, 0.05, 0.12]} />
          {darkMetalMaterial}
        </mesh>
        
        {/* Glowing Strip / Logo (Subtle ambient) */}
        <mesh position={[0, 0.056, 0.02]}>
           <planeGeometry args={[0.02, 0.02]} />
           <meshBasicMaterial color={ledColor} toneMapped={false} opacity={0.2} transparent />
        </mesh>
        <mesh position={[0, 0.03, 0.061]}>
           <planeGeometry args={[0.08, 0.005]} />
           <meshBasicMaterial color={ledColor} toneMapped={false} opacity={0.2} transparent />
        </mesh>

        {/* Buttons - Reactive Lighting */}
        {/* Left Button */}
        <mesh position={[-0.02, 0.055, -0.04]}>
           <boxGeometry args={[0.035, 0.005, 0.04]} />
           <meshStandardMaterial 
              color={clickState.left ? "#222" : "#333"} 
              metalness={0.8}
              emissive={ledColor}
              emissiveIntensity={clickState.left ? 3.0 : 0}
              toneMapped={false}
           />
        </mesh>
        {/* Right Button */}
        <mesh position={[0.02, 0.055, -0.04]}>
           <boxGeometry args={[0.035, 0.005, 0.04]} />
           <meshStandardMaterial 
              color={clickState.right ? "#222" : "#333"} 
              metalness={0.8}
              emissive={ledColor}
              emissiveIntensity={clickState.right ? 3.0 : 0}
              toneMapped={false}
           />
        </mesh>

        {/* Scroll Wheel - Fixed Position */}
        <mesh position={[0, 0.055, -0.03]}>
           <boxGeometry args={[0.008, 0.02, 0.02]} />
           <meshStandardMaterial color="#111" emissive={ledColor} emissiveIntensity={0.2} />
        </mesh>
      </group>
    </group>
  );
};