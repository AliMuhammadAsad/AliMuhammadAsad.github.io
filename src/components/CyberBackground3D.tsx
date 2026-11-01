'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function CyberBackground3D() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x05060a, 0.0018);

    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 85);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // Double Helix Construction
    const helixGroup = new THREE.Group();
    const particleCount = 280;
    const radius = 14;
    const height = 180;
    const turns = 4;

    const strand1Geo = new THREE.BufferGeometry();
    const strand2Geo = new THREE.BufferGeometry();
    const pos1 = new Float32Array(particleCount * 3);
    const pos2 = new Float32Array(particleCount * 3);
    const col1 = new Float32Array(particleCount * 3);
    const col2 = new Float32Array(particleCount * 3);

    const cyanColor = new THREE.Color(0x00f0ff);
    const purpleColor = new THREE.Color(0x9d00ff);
    const greenColor = new THREE.Color(0x00ffa3);

    for (let i = 0; i < particleCount; i++) {
      const t = (i / particleCount) * Math.PI * 2 * turns;
      const y = (i / particleCount) * height - height / 2;

      // Strand 1 (Cyan/Green)
      const x1 = Math.cos(t) * radius;
      const z1 = Math.sin(t) * radius;
      pos1[i * 3] = x1;
      pos1[i * 3 + 1] = y;
      pos1[i * 3 + 2] = z1;

      col1[i * 3] = cyanColor.r;
      col1[i * 3 + 1] = cyanColor.g;
      col1[i * 3 + 2] = cyanColor.b;

      // Strand 2 (Purple/Cyan, offset by PI)
      const x2 = Math.cos(t + Math.PI) * radius;
      const z2 = Math.sin(t + Math.PI) * radius;
      pos2[i * 3] = x2;
      pos2[i * 3 + 1] = y;
      pos2[i * 3 + 2] = z2;

      col2[i * 3] = purpleColor.r;
      col2[i * 3 + 1] = purpleColor.g;
      col2[i * 3 + 2] = purpleColor.b;
    }

    strand1Geo.setAttribute('position', new THREE.BufferAttribute(pos1, 3));
    strand1Geo.setAttribute('color', new THREE.BufferAttribute(col1, 3));
    strand2Geo.setAttribute('position', new THREE.BufferAttribute(pos2, 3));
    strand2Geo.setAttribute('color', new THREE.BufferAttribute(col2, 3));

    // Particle texture creator
    const getParticleTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 32;
      canvas.height = 32;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
        gradient.addColorStop(0, 'rgba(255,255,255,1)');
        gradient.addColorStop(0.3, 'rgba(0,240,255,0.8)');
        gradient.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 32, 32);
      }
      return new THREE.CanvasTexture(canvas);
    };

    const particleTexture = getParticleTexture();

    const particleMat1 = new THREE.PointsMaterial({
      size: 1.4,
      map: particleTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
      depthWrite: false,
    });

    const particleMat2 = new THREE.PointsMaterial({
      size: 1.4,
      map: particleTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
      depthWrite: false,
    });

    const strand1Points = new THREE.Points(strand1Geo, particleMat1);
    const strand2Points = new THREE.Points(strand2Geo, particleMat2);

    helixGroup.add(strand1Points);
    helixGroup.add(strand2Points);

    // Connecting rungs (cross-bars)
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.25,
      blending: THREE.AdditiveBlending,
    });

    const rungsPositions: number[] = [];
    for (let i = 0; i < particleCount; i += 4) {
      rungsPositions.push(
        pos1[i * 3],
        pos1[i * 3 + 1],
        pos1[i * 3 + 2],
        pos2[i * 3],
        pos2[i * 3 + 1],
        pos2[i * 3 + 2]
      );
    }

    const rungsGeo = new THREE.BufferGeometry();
    rungsGeo.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(rungsPositions, 3)
    );
    const rungs = new THREE.LineSegments(rungsGeo, lineMat);
    helixGroup.add(rungs);

    // Position helix slightly to the right/center for backdrop balance
    helixGroup.position.set(28, 0, -10);
    helixGroup.rotation.z = 0.25;
    scene.add(helixGroup);

    // Background Cyber Grid / Quantum Starfield
    const starCount = 650;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      starPos[i * 3] = (Math.random() - 0.5) * 220;
      starPos[i * 3 + 1] = (Math.random() - 0.5) * 220;
      starPos[i * 3 + 2] = (Math.random() - 0.5) * 220;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0x00f0ff,
      size: 0.7,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const starField = new THREE.Points(starGeo, starMat);
    scene.add(starField);

    // Mouse Interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Resize Handler
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Continuous Helix Rotation
      helixGroup.rotation.y = elapsedTime * 0.22;
      helixGroup.rotation.x = Math.sin(elapsedTime * 0.1) * 0.15;

      // Gentle starfield drift
      starField.rotation.y = elapsedTime * 0.02;

      // Mouse Parallax Damping
      targetX += (mouseX - targetX) * 0.04;
      targetY += (mouseY - targetY) * 0.04;
      camera.position.x = targetX * 12;
      camera.position.y = -targetY * 12;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      strand1Geo.dispose();
      strand2Geo.dispose();
      rungsGeo.dispose();
      starGeo.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      aria-hidden="true"
    />
  );
}

