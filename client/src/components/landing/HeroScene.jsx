"use client";

import { useRef, useState, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { 
  Float, 
  MeshTransmissionMaterial, 
  Environment, 
  OrbitControls, 
  ContactShadows,
  PerspectiveCamera,
  Text
} from "@react-three/drei";
import * as THREE from "three";

function CrystalModel({ ...props }) {
  const mesh = useRef();
  const [hovered, setHover] = useState(false);
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    mesh.current.rotation.x = Math.cos(t / 4) / 8;
    mesh.current.rotation.y = Math.sin(t / 4) / 8;
    mesh.current.rotation.z = (1 + Math.sin(t / 1.5)) / 20;
    mesh.current.position.y = (1 + Math.sin(t / 1.5)) / 10;
  });

  return (
    <group {...props}>
      <mesh
        ref={mesh}
        onPointerOver={() => setHover(true)}
        onPointerOut={() => setHover(false)}
      >
        <octahedronGeometry args={[1, 0]} />
        <MeshTransmissionMaterial
          backside
          backsideThickness={5}
          thickness={2}
          samples={16}
          transmission={1}
          clearcoat={1}
          clearcoatRoughness={0}
          chromaticAberration={0.5}
          anisotropy={0.3}
          roughness={0}
          distortion={0.5}
          distortionScale={0.5}
          temporalDistortion={0.1}
          color="#a5b4fc"
        />
      </mesh>
      
      {/* Internal Core */}
      <mesh scale={[0.4, 0.4, 0.4]}>
        <octahedronGeometry args={[1, 0]} />
        <meshStandardMaterial 
          emissive="#6366f1" 
          emissiveIntensity={2} 
          toneMapped={false} 
        />
      </mesh>
    </group>
  );
}

function Scene() {
  const { mouse } = useThree();
  const group = useRef();

  useFrame(() => {
    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, (mouse.x * Math.PI) / 10, 0.1);
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, (mouse.y * Math.PI) / 10, 0.1);
  });

  return (
    <group ref={group}>
      <CrystalModel position={[0, 0, 0]} />
      <ContactShadows
        position={[0, -1.5, 0]}
        opacity={0.4}
        scale={10}
        blur={2}
        far={4}
      />
    </group>
  );
}

export default function HeroScene() {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={50} />
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
        
        <Scene />
        
        <Environment preset="city" />
        <OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />
      </Canvas>
    </div>
  );
}

