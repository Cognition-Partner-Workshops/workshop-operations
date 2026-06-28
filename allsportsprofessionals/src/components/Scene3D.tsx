"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

function AnimatedSphere({
  position,
  color,
  speed,
  distort,
  size,
}: {
  position: [number, number, number];
  color: string;
  speed: number;
  distort: number;
  size: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * speed * 0.3;
      meshRef.current.rotation.y = state.clock.elapsedTime * speed * 0.2;
    }
  });

  return (
    <Float speed={2} rotationIntensity={1.5} floatIntensity={2}>
      <mesh ref={meshRef} position={position}>
        <icosahedronGeometry args={[size, 4]} />
        <MeshDistortMaterial
          color={color}
          distort={distort}
          speed={speed}
          roughness={0.2}
          metalness={0.8}
          transparent
          opacity={0.7}
        />
      </mesh>
    </Float>
  );
}

function ParticleField() {
  const particlesRef = useRef<THREE.Points>(null);
  const count = 500;

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.02;
      particlesRef.current.rotation.x = state.clock.elapsedTime * 0.01;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={positions}
          count={count}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.02}
        color="#60a5fa"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

function FloatingRing({
  position,
  color,
  rotationSpeed,
}: {
  position: [number, number, number];
  color: string;
  rotationSpeed: number;
}) {
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (ringRef.current) {
      ringRef.current.rotation.x =
        Math.sin(state.clock.elapsedTime * rotationSpeed) * Math.PI;
      ringRef.current.rotation.z = state.clock.elapsedTime * rotationSpeed * 0.5;
    }
  });

  return (
    <Float speed={1.5} floatIntensity={1}>
      <mesh ref={ringRef} position={position}>
        <torusGeometry args={[1, 0.05, 16, 100]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
          transparent
          opacity={0.6}
        />
      </mesh>
    </Float>
  );
}

export default function Scene3D() {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 60 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.3} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} color="#60a5fa" />
        <directionalLight
          position={[-5, -5, 3]}
          intensity={0.4}
          color="#d946ef"
        />
        <pointLight position={[0, 0, 3]} intensity={0.5} color="#f59e0b" />

        <AnimatedSphere
          position={[-3, 1.5, -2]}
          color="#3b82f6"
          speed={1.2}
          distort={0.4}
          size={1.2}
        />
        <AnimatedSphere
          position={[3.5, -1, -3]}
          color="#d946ef"
          speed={0.8}
          distort={0.5}
          size={0.8}
        />
        <AnimatedSphere
          position={[1, 2.5, -4]}
          color="#f59e0b"
          speed={1}
          distort={0.3}
          size={0.6}
        />
        <AnimatedSphere
          position={[-2, -2, -3]}
          color="#06b6d4"
          speed={0.9}
          distort={0.45}
          size={0.9}
        />

        <FloatingRing position={[0, 0, -2]} color="#3b82f6" rotationSpeed={0.3} />
        <FloatingRing
          position={[2, 1, -3]}
          color="#d946ef"
          rotationSpeed={0.2}
        />

        <ParticleField />
      </Canvas>
    </div>
  );
}
