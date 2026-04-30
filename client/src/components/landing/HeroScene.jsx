"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";

function NeuralNetwork(props) {
  const ref = useRef();
  const spheres = useMemo(() => {
    const data = new Float32Array(5000 * 3);
    for (let i = 0; i < 5000; i++) {
      data[i * 3] = (Math.random() - 0.5) * 10;
      data[i * 3 + 1] = (Math.random() - 0.5) * 10;
      data[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return data;
  }, []);

  useFrame((state, delta) => {
    ref.current.rotation.x -= delta / 10;
    ref.current.rotation.y -= delta / 15;
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={spheres} stride={3} frustumCulled={false} {...props}>
        <PointMaterial
          transparent
          color="#6366f1"
          size={0.015}
          sizeAttenuation={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </Points>
    </group>
  );
}

export default function HeroScene() {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas camera={{ position: [0, 0, 1] }}>
        <NeuralNetwork />
      </Canvas>
    </div>
  );
}
