"use client";

import React, { useRef, useMemo, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, Stars, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";

function SceneContent() {
  const pointsRef = useRef();
  const { mouse } = useThree();

  const particleCount = 2000;
  const positions = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return pos;
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    // Smooth mouse parallax
    if (pointsRef.current) {
      pointsRef.current.rotation.x = THREE.MathUtils.lerp(
        pointsRef.current.rotation.x,
        mouse.y * 0.2,
        0.1
      );
      pointsRef.current.rotation.y = THREE.MathUtils.lerp(
        pointsRef.current.rotation.y,
        mouse.x * 0.2,
        0.1
      );
      
      // Subtle pulse animation
      const s = 1 + Math.sin(time * 0.5) * 0.05;
      pointsRef.current.scale.set(s, s, s);
    }
  });

  return (
    <group>
      <Stars 
        radius={100} 
        depth={50} 
        count={5000} 
        factor={4} 
        saturation={0} 
        fade 
        speed={1} 
      />
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={positions.length / 3}
            array={positions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.015}
          color="#6366f1"
          transparent
          opacity={0.6}
          sizeAttenuation={true}
          blending={THREE.AdditiveBlending}
        />
      </points>
      
      {/* Floating ambient shapes for depth */}
      <Float speed={2} rotationIntensity={1} floatIntensity={1}>
        <mesh position={[2, 1, -5]}>
          <octahedronGeometry args={[0.5]} />
          <meshBasicMaterial color="#a855f7" wireframe transparent opacity={0.1} />
        </mesh>
      </Float>
      <Float speed={3} rotationIntensity={0.5} floatIntensity={2}>
        <mesh position={[-3, -2, -8]}>
          <tetrahedronGeometry args={[0.8]} />
          <meshBasicMaterial color="#6366f1" wireframe transparent opacity={0.1} />
        </mesh>
      </Float>
    </group>
  );
}

export default function HeroScene() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none opacity-50">
      <Canvas 
        dpr={[1, 2]} 
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={75} />
          <SceneContent />
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
        </Suspense>
      </Canvas>
      
      {/* Deep overlay for integration with the theme */}
      <div className="absolute inset-0 bg-[#030014]/40" />
      
      {/* Bottom fade for seamless scrolling */}
      <div className="absolute inset-x-0 bottom-0 h-64 bg-linear-to-t from-[#030014] via-[#030014]/80 to-transparent" />
    </div>
  );
}