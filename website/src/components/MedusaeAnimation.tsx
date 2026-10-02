import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export interface MedusaeConfig {
  cursor?: {
    radius?: number;
    strength?: number;
    dragFactor?: number;
  };
  halo?: {
    outerOscFrequency?: number;
    outerOscAmplitude?: number;
    outerOscJitterStrength?: number;
    outerOscJitterSpeed?: number;
    radiusBase?: number;
    radiusAmplitude?: number;
    shapeAmplitude?: number;
    rimWidth?: number;
    outerStartOffset?: number;
    outerEndOffset?: number;
    scaleX?: number;
    scaleY?: number;
  };
  particles?: {
    baseSize?: number;
    activeSize?: number;
    blobScaleX?: number;
    blobScaleY?: number;
    rotationSpeed?: number;
    rotationJitter?: number;
    cursorFollowStrength?: number;
    oscillationFactor?: number;
    colorBase?: string;
    colorOne?: string;
    colorTwo?: string;
    colorThree?: string;
  };
}

interface MedusaeAnimationProps {
  className?: string;
  config?: MedusaeConfig;
}

export const MedusaeAnimation: React.FC<MedusaeAnimationProps> = ({
  className = '',
  config,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    let animationFrameId: number;
    let isVisible = true;

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      50,
      container.clientWidth / Math.max(container.clientHeight, 1),
      0.1,
      100
    );
    camera.position.set(0, 0, 5);

    // 2. High-Performance WebGL Renderer with Transparent Background
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);

    // 3. Merged Configuration matching BreathDearMedusae & Campus Buddy Theme
    const cfg = {
      cursor: {
        radius: config?.cursor?.radius ?? 0.065,
        strength: config?.cursor?.strength ?? 3,
        dragFactor: config?.cursor?.dragFactor ?? 0.018,
      },
      halo: {
        outerOscFrequency: config?.halo?.outerOscFrequency ?? 2.6,
        outerOscAmplitude: config?.halo?.outerOscAmplitude ?? 0.76,
        radiusBase: config?.halo?.radiusBase ?? 2.4,
        radiusAmplitude: config?.halo?.radiusAmplitude ?? 0.5,
        shapeAmplitude: config?.halo?.shapeAmplitude ?? 0.75,
        rimWidth: config?.halo?.rimWidth ?? 1.8,
        outerStartOffset: config?.halo?.outerStartOffset ?? 0.4,
        outerEndOffset: config?.halo?.outerEndOffset ?? 2.2,
        scaleX: config?.halo?.scaleX ?? 1.3,
        scaleY: config?.halo?.scaleY ?? 1.0,
      },
      particles: {
        baseSize: config?.particles?.baseSize ?? 0.016,
        activeSize: config?.particles?.activeSize ?? 0.044,
        blobScaleX: config?.particles?.blobScaleX ?? 1.0,
        blobScaleY: config?.particles?.blobScaleY ?? 0.6,
        rotationSpeed: config?.particles?.rotationSpeed ?? 0.1,
        rotationJitter: config?.particles?.rotationJitter ?? 0.2,
        cursorFollowStrength: config?.particles?.cursorFollowStrength ?? 1.0,
        oscillationFactor: config?.particles?.oscillationFactor ?? 1.0,
        colorBase: config?.particles?.colorBase ?? '#0860E8',   // Campus Buddy Brand Blue
        colorOne: config?.particles?.colorOne ?? '#38BDF8',     // Sky Blue
        colorTwo: config?.particles?.colorTwo ?? '#FF874B',     // Brand Accent Orange
        colorThree: config?.particles?.colorThree ?? '#FCD34D', // Sun Yellow
      },
    };

    // 4. Uniforms
    const uniforms = {
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uOuterOscFrequency: { value: cfg.halo.outerOscFrequency },
      uOuterOscAmplitude: { value: cfg.halo.outerOscAmplitude },
      uHaloRadiusBase: { value: cfg.halo.radiusBase },
      uHaloRadiusAmplitude: { value: cfg.halo.radiusAmplitude },
      uHaloShapeAmplitude: { value: cfg.halo.shapeAmplitude },
      uHaloRimWidth: { value: cfg.halo.rimWidth },
      uHaloOuterStartOffset: { value: cfg.halo.outerStartOffset },
      uHaloOuterEndOffset: { value: cfg.halo.outerEndOffset },
      uHaloScaleX: { value: cfg.halo.scaleX },
      uHaloScaleY: { value: cfg.halo.scaleY },
      uParticleBaseSize: { value: cfg.particles.baseSize },
      uParticleActiveSize: { value: cfg.particles.activeSize },
      uBlobScaleX: { value: cfg.particles.blobScaleX },
      uBlobScaleY: { value: cfg.particles.blobScaleY },
      uParticleRotationSpeed: { value: cfg.particles.rotationSpeed },
      uParticleRotationJitter: { value: cfg.particles.rotationJitter },
      uParticleOscillationFactor: { value: cfg.particles.oscillationFactor },
      uParticleColorBase: { value: new THREE.Color(cfg.particles.colorBase) },
      uParticleColorOne: { value: new THREE.Color(cfg.particles.colorOne) },
      uParticleColorTwo: { value: new THREE.Color(cfg.particles.colorTwo) },
      uParticleColorThree: { value: new THREE.Color(cfg.particles.colorThree) },
    };

    // 5. GLSL Shaders from BreathDearMedusae
    const vertexShader = `
      uniform float uTime;
      uniform vec2 uMouse;
      uniform float uOuterOscFrequency;
      uniform float uOuterOscAmplitude;
      uniform float uHaloRadiusBase;
      uniform float uHaloRadiusAmplitude;
      uniform float uHaloShapeAmplitude;
      uniform float uHaloRimWidth;
      uniform float uHaloOuterStartOffset;
      uniform float uHaloOuterEndOffset;
      uniform float uHaloScaleX;
      uniform float uHaloScaleY;
      uniform float uParticleBaseSize;
      uniform float uParticleActiveSize;
      uniform float uBlobScaleX;
      uniform float uBlobScaleY;
      uniform float uParticleRotationSpeed;
      uniform float uParticleRotationJitter;
      uniform float uParticleOscillationFactor;
      varying vec2 vUv;
      varying float vSize;
      varying vec2 vPos;
      
      attribute vec3 aOffset; 
      attribute float aRandom;

      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
      }
      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        float a = hash(i);
        float b = hash(i + vec2(1.0, 0.0));
        float c = hash(i + vec2(0.0, 1.0));
        float d = hash(i + vec2(1.0, 1.0));
        return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
      }

      void main() {
        vUv = uv;
        
        // 1. Alive Flow (Base Layer)
        vec3 pos = aOffset;
        float driftSpeed = uTime * 0.15;
        float dx = sin(driftSpeed + pos.y * 0.5) + sin(driftSpeed * 0.5 + pos.y * 2.0);
        float dy = cos(driftSpeed + pos.x * 0.5) + cos(driftSpeed * 0.5 + pos.x * 2.0);
        pos.x += dx * 0.25; 
        pos.y += dy * 0.25;

        // 2. The Medusa Jellyfish Halo (Smooth & Subtle)
        vec2 relToMouse = pos.xy - uMouse;
        vec2 haloScale = max(vec2(uHaloScaleX, uHaloScaleY), vec2(0.0001));
        float distFromMouse = length(relToMouse / haloScale);
        vec2 dirToMouse = normalize(relToMouse + vec2(0.0001, 0.0));
        
        float shapeFactor = noise(dirToMouse * 2.0 + vec2(0.0, uTime * 0.1));
        float breathCycle = sin(uTime * 0.8);
        
        float baseRadius = uHaloRadiusBase + breathCycle * uHaloRadiusAmplitude;
        float currentRadius = baseRadius + (shapeFactor * uHaloShapeAmplitude);
        
        float dist = distFromMouse; 
        float rimInfluence = smoothstep(uHaloRimWidth, 0.0, abs(dist - currentRadius));
        
        vec2 pushDir = normalize(relToMouse + vec2(0.0001, 0.0));
        float pushAmt = (breathCycle * 0.5 + 0.5) * 0.5;
        
        pos.xy += pushDir * pushAmt * rimInfluence;
        pos.z += rimInfluence * 0.3 * sin(uTime);

        // 3. Outer Oscillation Waves
        float outerInfluence = smoothstep(baseRadius + uHaloOuterStartOffset, baseRadius + uHaloOuterEndOffset, dist);
        float outerOsc = sin(uTime * uOuterOscFrequency + pos.x * 0.6 + pos.y * 0.6);
        pos.xy += normalize(relToMouse + vec2(0.0001, 0.0)) * outerOsc * uOuterOscAmplitude * outerInfluence;

        // 4. Size & Organic Scale
        float baseSize = uParticleBaseSize + (sin(uTime + pos.x) * 0.003);
        float activeSize = uParticleActiveSize; 
        float currentScale = baseSize + (rimInfluence * activeSize);
        float stretch = rimInfluence * 0.02;
        
        vec3 transformed = position;
        transformed.x *= (currentScale + stretch) * uBlobScaleX;
        transformed.y *= currentScale * uBlobScaleY; 
        
        vSize = rimInfluence;
        vPos = pos.xy;
        
        // 5. Rotation Along Fluid Currents
        float dirLen = max(length(relToMouse), 0.0001);
        vec2 dir = relToMouse / dirLen;
        float oscPhase = aRandom * 6.28318530718;
        float osc = 0.5 + 0.5 * sin(uTime * (0.25 + uParticleOscillationFactor * 0.35) + oscPhase);
        float speedScale = mix(0.55, 1.35, osc) * (0.8 + uParticleOscillationFactor * 0.2);
        float jitterScale = mix(0.7, 1.45, osc) * (0.85 + uParticleOscillationFactor * 0.15);
        float jitter = sin(uTime * uParticleRotationSpeed * speedScale + pos.x * 0.35 + pos.y * 0.35) * (uParticleRotationJitter * jitterScale);
        vec2 perp = vec2(-dir.y, dir.x);
        vec2 jitteredDir = normalize(dir + perp * jitter);
        mat2 rot = mat2(jitteredDir.x, jitteredDir.y, -jitteredDir.y, jitteredDir.x);
        transformed.xy = rot * transformed.xy;
        
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos + transformed, 1.0);
      }
    `;

    const fragmentShader = `
      uniform float uTime;
      uniform vec3 uParticleColorBase;
      uniform vec3 uParticleColorOne;
      uniform vec3 uParticleColorTwo;
      uniform vec3 uParticleColorThree;
      varying vec2 vUv;
      varying float vSize;
      varying vec2 vPos;

      void main() {
        vec2 center = vec2(0.5);
        vec2 pos = abs(vUv - center) * 2.0; 
        
        // Superellipse squircle shape
        float d = pow(pow(pos.x, 2.6) + pow(pos.y, 2.6), 1.0 / 2.6);
        float alpha = 1.0 - smoothstep(0.8, 1.0, d);
        
        if (alpha < 0.01) discard;

        vec3 cBase = uParticleColorBase;
        vec3 cBlue = uParticleColorOne;
        vec3 cOrange = uParticleColorTwo;
        vec3 cGold = uParticleColorThree;
        
        float t = uTime * 1.2;
        float p1 = sin(vPos.x * 0.8 + t);
        float p2 = sin(vPos.y * 0.8 + t * 0.8 + p1);
        
        vec3 activeColor = mix(cBlue, cOrange, p1 * 0.5 + 0.5);
        activeColor = mix(activeColor, cGold, p2 * 0.5 + 0.5);
        
        vec3 finalColor = mix(cBase, activeColor, smoothstep(0.08, 0.75, vSize));
        float finalAlpha = alpha * mix(0.35, 0.9, vSize);

        gl_FragColor = vec4(finalColor, finalAlpha);
      }
    `;

    const geometry = new THREE.PlaneGeometry(1, 1);
    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
    });

    // 6. Instanced Particle Grid (100 x 55 = 5500 particles)
    const countX = 96;
    const countY = 52;
    const count = countX * countY;

    const offsets = new Float32Array(count * 3);
    const randoms = new Float32Array(count);

    const gridWidth = 40;
    const gridHeight = 22;
    const jitter = 0.25;

    let index = 0;
    for (let y = 0; y < countY; y++) {
      for (let x = 0; x < countX; x++) {
        const u = x / (countX - 1);
        const v = y / (countY - 1);

        let px = (u - 0.5) * gridWidth;
        let py = (v - 0.5) * gridHeight;

        px += (Math.random() - 0.5) * jitter;
        py += (Math.random() - 0.5) * jitter;

        offsets[index * 3] = px;
        offsets[index * 3 + 1] = py;
        offsets[index * 3 + 2] = 0;

        randoms[index] = Math.random();
        index++;
      }
    }

    const instancedMesh = new THREE.InstancedMesh(geometry, material, count);
    instancedMesh.geometry.setAttribute('aOffset', new THREE.InstancedBufferAttribute(offsets, 3));
    instancedMesh.geometry.setAttribute('aRandom', new THREE.InstancedBufferAttribute(randoms, 1));
    scene.add(instancedMesh);

    // 7. Interactive Pointer & Autonomous Breathing
    const mouseNorm = { x: 0, y: 0 };
    let hasMouseInteracted = false;

    const handlePointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      // Calculate normalized mouse (-1 to 1) relative to container viewport
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouseNorm.x = Math.max(-1.5, Math.min(1.5, x));
      mouseNorm.y = Math.max(-1.5, Math.min(1.5, y));
      hasMouseInteracted = true;
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });

    // 8. Resize Observer for dynamic responsiveness
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width === 0 || height === 0) return;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
      }
    });
    resizeObserver.observe(container);

    // 9. Intersection Observer (pause rendering when scrolled out of view)
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
    }, { threshold: 0.05 });
    intersectionObserver.observe(container);

    // 10. Animation Loop
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (!isVisible) return;

      const elapsedTime = clock.getElapsedTime();
      uniforms.uTime.value = elapsedTime;

      // Viewport dimension calculations in Three.js world coordinates at camera z
      const vFov = (camera.fov * Math.PI) / 180;
      const vHeight = 2 * Math.tan(vFov / 2) * camera.position.z;
      const vWidth = vHeight * camera.aspect;

      // Autonomous organic breathing drift if mouse hasn't moved recently
      let targetX = 0;
      let targetY = 0;

      if (hasMouseInteracted) {
        const baseX = (mouseNorm.x * vWidth) / 2;
        const baseY = (mouseNorm.y * vHeight) / 2;
        const jitterRadius = Math.min(vWidth, vHeight) * cfg.cursor.radius;
        const jitterX = (Math.sin(elapsedTime * 0.35) + Math.sin(elapsedTime * 0.77 + 1.2)) * 0.5;
        const jitterY = (Math.cos(elapsedTime * 0.31) + Math.sin(elapsedTime * 0.63 + 2.4)) * 0.5;
        targetX = (baseX + jitterX * jitterRadius * cfg.cursor.strength) * cfg.particles.cursorFollowStrength;
        targetY = (baseY + jitterY * jitterRadius * cfg.cursor.strength) * cfg.particles.cursorFollowStrength;
      } else {
        // Natural ambient sway in upper-right / center area
        targetX = Math.sin(elapsedTime * 0.4) * (vWidth * 0.18);
        targetY = Math.cos(elapsedTime * 0.32) * (vHeight * 0.14);
      }

      // Smooth dampening towards target
      const current = uniforms.uMouse.value;
      current.x += (targetX - current.x) * cfg.cursor.dragFactor;
      current.y += (targetY - current.y) * cfg.cursor.dragFactor;

      renderer.render(scene, camera);
    };

    animate();

    // 11. Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('pointermove', handlePointerMove);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, [config]);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 w-full h-full pointer-events-none overflow-hidden select-none ${className}`}
      style={{ zIndex: 0 }}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
};

export default MedusaeAnimation;
