"use client";

import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/* Single interactive cube component */
function CubeMesh({ position, size, rotationSpeed, floatSpeed, floatRange, seed, color, isWireframe, scrollYRef, mouseRef }) {
  const meshRef = useRef();

  // Store initial positions to apply offsets relative to them
  const initialY = position[1];
  const initialX = position[0];

  useFrame((state) => {
    if (!meshRef.current) return;

    const time = state.clock.getElapsedTime();

    // 1. Smooth, slow-growing intro animation on mount (first 2.5 seconds)
    const introDuration = 2.5;
    const introFactor = Math.min(time / introDuration, 1);
    const easedFactor = 1 - Math.pow(1 - introFactor, 3); // cubic ease out

    // Apply scale dynamically
    meshRef.current.scale.setScalar(easedFactor * size);

    // 2. Slow, elegant rotation on different axes
    meshRef.current.rotation.x = time * rotationSpeed[0] * 0.12 + seed;
    meshRef.current.rotation.y = time * rotationSpeed[1] * 0.10 + seed;
    meshRef.current.rotation.z = time * rotationSpeed[2] * 0.08 + seed;

    // 3. Slow sine-wave vertical float
    const floatOffset = Math.sin(time * floatSpeed + seed) * floatRange;
    
    // 4. Scroll reaction (parallax drift)
    const scrollFactor = scrollYRef.current * 0.0035;

    // 5. Subtle mouse attraction/repulsion drift
    const mouseXTarget = mouseRef.current.x * 0.8;

    // Smooth interpolation (lerp) for positions
    meshRef.current.position.y = THREE.MathUtils.lerp(
      meshRef.current.position.y,
      initialY + floatOffset + scrollFactor,
      0.05
    );
    meshRef.current.position.x = THREE.MathUtils.lerp(
      meshRef.current.position.x,
      initialX + mouseXTarget * (size * 0.5),
      0.05
    );
  });

  return (
    <mesh ref={meshRef} position={position}>
      <boxGeometry args={[1, 1, 1]} /> {/* standard unit box size, scaled in useFrame */}
      {isWireframe ? (
        <meshBasicMaterial 
          color={color} 
          wireframe 
          transparent 
          opacity={0.24} // increased visibility (from 0.12)
        />
      ) : (
        <meshPhysicalMaterial
          color={color}
          transparent
          opacity={0.34} // increased visibility (from 0.18)
          roughness={0.15}
          metalness={0.1}
          clearcoat={0.8}
          clearcoatRoughness={0.1}
          transmission={0.7} // shinier glass look
          thickness={1.5}
          side={THREE.DoubleSide}
        />
      )}
    </mesh>
  );
}

/* Group containing all cubes */
function CubesScene({ scrollYRef, mouseRef, isMobile }) {
  // Generate different cubes
  const cubeList = useMemo(() => {
    const count = isMobile ? 10 : 22;
    // Saturated/brighter aesthetic colors
    const colors = [
      '#f3f4f6', // Silver/White
      '#05d68d', // Bright Emerald green
      '#f5bc3d', // Vibrant Gold
      '#b79aff', // Lavender purple
      '#3fe5ff', // Neon ice-blue
    ];

    const temp = [];
    for (let i = 0; i < count; i++) {
      const isWireframe = Math.random() > 0.65;
      const color = colors[i % colors.length];
      
      const x = (Math.random() - 0.5) * 16;
      const y = (Math.random() - 0.5) * 14 - 1;
      const z = (Math.random() - 0.5) * 6 - 2;

      temp.push({
        id: i,
        position: [x, y, z],
        size: 0.35 + Math.random() * 1.15,
        rotationSpeed: [
          0.3 + Math.random() * 0.7,
          0.3 + Math.random() * 0.7,
          0.3 + Math.random() * 0.7,
        ],
        floatSpeed: 0.15 + Math.random() * 0.25,
        floatRange: 0.15 + Math.random() * 0.35,
        seed: Math.random() * 200,
        color,
        isWireframe,
      });
    }
    return temp;
  }, [isMobile]);

  return (
    <group>
      {cubeList.map((cube) => (
        <CubeMesh
          key={cube.id}
          position={cube.position}
          size={cube.size}
          rotationSpeed={cube.rotationSpeed}
          floatSpeed={cube.floatSpeed}
          floatRange={cube.floatRange}
          seed={cube.seed}
          color={cube.color}
          isWireframe={cube.isWireframe}
          scrollYRef={scrollYRef}
          mouseRef={mouseRef}
        />
      ))}
    </group>
  );
}

export default function GlobalBackground() {
  const scrollYRef = useRef(0);
  const mouseRef = useRef({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Trigger state for smooth entrance CSS transition
  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Track window scroll and mouse positions globally
  useEffect(() => {
    const handleScroll = () => {
      scrollYRef.current = window.scrollY;
    };

    const handleMouseMove = (e) => {
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('resize', handleResize);
    
    // Initial check
    handleResize();
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className={`global-3d-bg ${loaded ? 'loaded' : ''}`}>
      <Canvas
        camera={{ position: [0, 0, 7], fov: 60 }}
        gl={{ alpha: true, antialias: false, powerPreference: "high-performance" }}
        dpr={isMobile ? 1 : [1, 1.5]}
        style={{ pointerEvents: 'none' }}
      >
        {/* Stronger, premium lighting setup to make shapes pop */}
        <ambientLight intensity={0.9} />
        <directionalLight position={[5, 10, 5]} intensity={1.2} color="#ffffff" />
        <directionalLight position={[-5, -5, -5]} intensity={0.6} color="#05d68d" />
        <pointLight position={[0, 0, 5]} intensity={0.8} color="#f5bc3d" />
        
        <CubesScene scrollYRef={scrollYRef} mouseRef={mouseRef} isMobile={isMobile} />
      </Canvas>
      {/* Soft overlay vignette */}
      <div className="global-3d-overlay" />
    </div>
  );
}
