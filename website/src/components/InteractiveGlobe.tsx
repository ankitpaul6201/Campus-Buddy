import React, { useEffect, useRef, useState, useCallback } from 'react';
import { MapPin } from 'lucide-react';
import worldPointsData from '../data/worldDottedPoints.json';

interface InteractiveGlobeProps {
  onSelectCampus?: (campusName: string) => void;
  selectedCollege?: string;
}

// 3D vector type
type Vec3 = [number, number, number];

// Chandigarh / Punjab coordinates (Lat 30.7333° N, Lng 76.7794° E)
const CHANDIGARH_LAT = 30.7333;
const CHANDIGARH_LNG = 76.7794;

// Convert Lat/Lng to 3D Cartesian coordinates on a unit sphere
const latLngToVec3 = (lat: number, lng: number): Vec3 => {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return [
    -(Math.sin(phi) * Math.cos(theta)),
    Math.cos(phi),
    Math.sin(phi) * Math.sin(theta)
  ];
};

const CHANDIGARH_3D = latLngToVec3(CHANDIGARH_LAT, CHANDIGARH_LNG);

export const InteractiveGlobe: React.FC<InteractiveGlobeProps> = ({
  onSelectCampus,
  selectedCollege
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Globe orientation state: rotY (azimuth), rotX (elevation/pitch)
  // Initial rotation angle puts India / Chandigarh facing the front
  const rotYRef = useRef<number>(-1.35);
  const rotXRef = useRef<number>(0.25);
  
  // Dragging state
  const isDraggingRef = useRef(false);
  const lastMouseX = useRef(0);
  const lastMouseY = useRef(0);
  const velocityX = useRef(0);
  const velocityY = useRef(0);
  const userInteractedTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isAutoSpinning = useRef(true);

  // Marker screen position state for DOM overlay
  const [markerPos, setMarkerPos] = useState<{
    x: number;
    y: number;
    visible: boolean;
    opacity: number;
    scale: number;
  }>({ x: 0, y: 0, visible: false, opacity: 0, scale: 1 });

  const [isMarkerHovered, setIsMarkerHovered] = useState(false);

  // Focus on Chandigarh
  const handleFocusChandigarh = useCallback(() => {
    rotYRef.current = -1.35;
    rotXRef.current = 0.28;
    velocityX.current = 0;
    velocityY.current = 0;
  }, []);

  // Auto-focus Chandigarh when selected in search bar
  useEffect(() => {
    if (selectedCollege && selectedCollege.toLowerCase().includes('sviet')) {
      handleFocusChandigarh();
    }
  }, [selectedCollege, handleFocusChandigarh]);

  // Main Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    const points: Vec3[] = worldPointsData as Vec3[];

    const render = () => {
      // Dimensions
      const rect = container.getBoundingClientRect();
      const size = Math.min(rect.width, rect.height) || 440;
      const dpr = window.devicePixelRatio || 1;

      if (canvas.width !== size * dpr || canvas.height !== size * dpr) {
        canvas.width = size * dpr;
        canvas.height = size * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, size, size);

      const cx = size / 2;
      const cy = size / 2;
      const radius = size * 0.42;

      // Handle continuous clockwise auto-rotation when user is not dragging
      if (!isDraggingRef.current) {
        if (isAutoSpinning.current) {
          // Clockwise rotation around axis
          rotYRef.current -= 0.0035;
        } else {
          // Apply gentle inertial damping
          rotYRef.current += velocityX.current;
          rotXRef.current += velocityY.current;
          velocityX.current *= 0.92;
          velocityY.current *= 0.92;
          if (Math.abs(velocityX.current) < 0.0005 && Math.abs(velocityY.current) < 0.0005) {
            isAutoSpinning.current = true;
          }
        }
      }

      // Clamp rotX pitch to prevent flipping upside down
      rotXRef.current = Math.max(-0.85, Math.min(0.85, rotXRef.current));

      const rotY = rotYRef.current;
      const rotX = rotXRef.current;

      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);

      // --- 1. SPHERE BASE FILL ---
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);

      // Soft light sphere gradient matching reference image
      const sphereGrad = ctx.createRadialGradient(
        cx - radius * 0.35, cy - radius * 0.35, radius * 0.05,
        cx, cy, radius
      );
      sphereGrad.addColorStop(0, '#FFFFFF');
      sphereGrad.addColorStop(0.7, '#FAFCFF');
      sphereGrad.addColorStop(0.92, '#F1F5F9');
      sphereGrad.addColorStop(1, '#E2E8F0');

      ctx.fillStyle = sphereGrad;
      ctx.shadowColor = 'rgba(15, 23, 42, 0.06)';
      ctx.shadowBlur = 24;
      ctx.shadowOffsetY = 12;
      ctx.fill();
      ctx.restore();

      // --- 2. INNER RIM SHADING (Creates the subtle 3D globe edge curvature) ---
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.clip();

      const rimGrad = ctx.createRadialGradient(
        cx, cy, radius * 0.82,
        cx, cy, radius
      );
      rimGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
      rimGrad.addColorStop(0.8, 'rgba(148, 163, 184, 0.06)');
      rimGrad.addColorStop(0.96, 'rgba(100, 116, 139, 0.16)');
      rimGrad.addColorStop(1, 'rgba(71, 85, 105, 0.28)');

      ctx.fillStyle = rimGrad;
      ctx.fill();

      // Top-left specular highlight rim
      const highlightGrad = ctx.createRadialGradient(
        cx - radius * 0.45, cy - radius * 0.45, radius * 0.1,
        cx - radius * 0.2, cy - radius * 0.2, radius * 0.85
      );
      highlightGrad.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
      highlightGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = highlightGrad;
      ctx.fill();

      ctx.restore();

      // --- 3. DOTTED CONTINENT POINTS ---
      // Rotate 3D points and render visible front-facing dots
      ctx.fillStyle = '#1E293B'; // Dark Slate/Navy dots matching reference image

      for (let i = 0; i < points.length; i++) {
        const [px, py, pz] = points[i];

        // 3D rotation: first rotY around Y axis, then rotX around X axis
        const x1 = px * cosY - pz * sinY;
        const z1 = px * sinY + pz * cosY;
        const y1 = py;

        const y2 = y1 * cosX - z1 * sinX;
        const z2 = y1 * sinX + z1 * cosX;
        const x2 = x1;

        // Front-hemisphere test: only render dots facing the camera
        if (z2 > 0.01) {
          const screenX = cx + x2 * radius;
          const screenY = cy - y2 * radius;

          // Perspective dot radius and edge falloff
          const dotRadius = Math.max(0.9, 1.25 + z2 * 0.65);
          const alpha = Math.min(1, Math.max(0.18, 0.25 + z2 * 0.75));

          ctx.globalAlpha = alpha;
          ctx.beginPath();
          ctx.arc(screenX, screenY, dotRadius, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.globalAlpha = 1.0;

      // --- 4. SVIET (CHANDIGARH / PUNJAB) 3D ROTATION ---
      const [cx3, cy3, cz3] = CHANDIGARH_3D;
      const mx1 = cx3 * cosY - cz3 * sinY;
      const mz1 = cx3 * sinY + cz3 * cosY;
      const my1 = cy3;

      const my2 = my1 * cosX - mz1 * sinX;
      const mz2 = my1 * sinX + mz1 * cosX;
      const mx2 = mx1;

      // When mz2 > 0, it rotates into the front hemisphere from behind the globe
      // As it approaches the limb (mz2 -> 0), it smoothly fades away behind the globe
      if (mz2 > 0) {
        const markerScreenX = cx + mx2 * radius;
        const markerScreenY = cy - my2 * radius;
        
        // Smooth fade as it emerges from behind the limb or goes behind the limb
        const visibility = Math.min(1, Math.max(0, mz2 * 4.5));

        // Draw surface pinpoint dot and stem on canvas
        ctx.save();
        ctx.globalAlpha = visibility;

        // Pulsing surface dot
        const pulse = (Math.sin(Date.now() / 250) + 1) / 2;
        ctx.beginPath();
        ctx.arc(markerScreenX, markerScreenY, 4 + pulse * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(8, 96, 232, 0.25)';
        ctx.fill();

        // Core marker anchor dot
        ctx.beginPath();
        ctx.arc(markerScreenX, markerScreenY, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = '#0F172A';
        ctx.fill();

        // Stem connector line
        ctx.beginPath();
        ctx.moveTo(markerScreenX, markerScreenY);
        ctx.lineTo(markerScreenX, markerScreenY - 18);
        ctx.strokeStyle = '#0F172A';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.restore();

        // Update DOM overlay position - smoothly tracks the 3D surface coordinates
        setMarkerPos({
          x: markerScreenX,
          y: markerScreenY - 20,
          visible: visibility > 0.05,
          opacity: visibility,
          scale: Math.max(0.72, Math.min(1.05, 0.75 + mz2 * 0.3))
        });
      } else {
        // Behind the globe - completely hidden
        setMarkerPos((prev) => ({ ...prev, visible: false, opacity: 0 }));
      }

      // --- 5. SPHERE OUTLINE RIM ---
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(226, 232, 240, 0.7)';
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.restore();

      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (userInteractedTimeout.current) clearTimeout(userInteractedTimeout.current);
    };
  }, []);

  // Pointer Interaction Handlers (Mouse & Touch Drag)
  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    isAutoSpinning.current = false;
    lastMouseX.current = e.clientX;
    lastMouseY.current = e.clientY;
    velocityX.current = 0;
    velocityY.current = 0;

    if (userInteractedTimeout.current) {
      clearTimeout(userInteractedTimeout.current);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;

    const deltaX = e.clientX - lastMouseX.current;
    const deltaY = e.clientY - lastMouseY.current;

    lastMouseX.current = e.clientX;
    lastMouseY.current = e.clientY;

    // Sensitivity: invert deltaX so dragging left rotates left, dragging right rotates right
    const sensitivity = 0.005;
    rotYRef.current -= deltaX * sensitivity;
    rotXRef.current += deltaY * sensitivity;

    velocityX.current = -deltaX * sensitivity;
    velocityY.current = deltaY * sensitivity;
  };

  const handlePointerUp = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;

    // Resume auto-rotation after 2.5 seconds of inactivity
    userInteractedTimeout.current = setTimeout(() => {
      isAutoSpinning.current = true;
    }, 2500);
  };

  const handleMarkerClick = () => {
    if (onSelectCampus) {
      onSelectCampus('SVIET Chandigarh');
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-[320px] sm:max-w-[500px] aspect-square mx-auto flex items-center justify-center select-none overflow-hidden"
    >
      {/* Background Soft Ambient Aura */}
      <div className="absolute inset-8 bg-gradient-to-tr from-[#E0F2FE]/50 via-[#F0F9FF]/30 to-[#E0E7FF]/40 rounded-full blur-3xl -z-10 pointer-events-none" />

      {/* Interactive 3D Dotted Canvas */}
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className="w-full h-full cursor-grab active:cursor-grabbing touch-pan-y block"
      />

      {/* SVIET Location Marker Overlay - seamlessly pinned to 3D rotation without jumping */}
      {markerPos.visible && (
        <div
          style={{
            position: 'absolute',
            left: `${markerPos.x}px`,
            top: `${markerPos.y}px`,
            transform: `translate(-50%, -100%) scale(${markerPos.scale})`,
            opacity: markerPos.opacity,
            zIndex: 30,
            pointerEvents: markerPos.opacity > 0.3 ? 'auto' : 'none',
            transition: 'opacity 0.08s linear'
          }}
          onMouseEnter={() => setIsMarkerHovered(true)}
          onMouseLeave={() => setIsMarkerHovered(false)}
          onClick={handleMarkerClick}
          className="cursor-pointer group flex flex-col items-center"
        >
          {/* Dark Pill Tag with abbreviation 'SVIET' matching reference image (like [ HQ ] / [ LATAM ]) */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#0F172A] text-white shadow-[0_6px_20px_rgba(0,0,0,0.35)] border border-slate-700/80 transition-transform group-hover:scale-108 active:scale-95">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-black tracking-wider uppercase">
              SVIET
            </span>
          </div>

          {/* Compact Popup Card: College Name, Location & Blinking Green Dot */}
          {isMarkerHovered && (
            <div
              className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-xl text-left pointer-events-none z-40 whitespace-nowrap"
            >
              <div className="flex items-center gap-1.5">
                {/* Blinking green dot */}
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>

                {/* College Name */}
                <span className="text-[12px] font-extrabold text-slate-900 leading-tight">
                  SVIET Chandigarh
                </span>
              </div>

              {/* Location */}
              <div className="mt-0.5 flex items-center gap-1 text-[10px] text-slate-500 pl-3.5 font-medium">
                <MapPin className="w-2.5 h-2.5 text-brand-blue shrink-0" />
                <span>Chandigarh / Punjab</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
