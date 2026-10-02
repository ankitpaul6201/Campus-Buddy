"use client";
import { useRef, useEffect, useState } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export const TextHoverEffect = ({
  text,
  duration,
  className,
}: {
  text: string;
  duration?: number;
  automatic?: boolean;
  className?: string;
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [cursor, setCursor] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);
  const [maskPosition, setMaskPosition] = useState<{ cx: number; cy: number }>({
    cx: 600,
    cy: 85,
  });

  // Title Case "Campus Buddy"
  const displayText = text || "Campus Buddy";

  // Large 1200 x 170 viewBox for huge, bold, perfectly proportioned text
  const viewBoxWidth = 1200;
  const viewBoxHeight = 170;

  useEffect(() => {
    if (svgRef.current && cursor.x !== null && cursor.y !== null) {
      const svgRect = svgRef.current.getBoundingClientRect();
      const cx = ((cursor.x - svgRect.left) / svgRect.width) * viewBoxWidth;
      const cy = ((cursor.y - svgRect.top) / svgRect.height) * viewBoxHeight;
      setMaskPosition({
        cx,
        cy,
      });
    }
  }, [cursor]);

  const fontStyle: React.CSSProperties = {
    fontFamily: "'Poppins', sans-serif",
    fontSize: "146px",
    fontWeight: 700,
    letterSpacing: "0.01em",
  };

  return (
    <svg
      ref={svgRef}
      width="100%"
      height="100%"
      viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
      xmlns="http://www.w3.org/2000/svg"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseMove={(e) => setCursor({ x: e.clientX, y: e.clientY })}
      className={cn("select-none cursor-pointer overflow-visible block", className)}
    >
      <defs>
        {/* Depth gradient: Top part LIGHT (luminous white/ice), bottom part DARK (deep navy) */}
        <linearGradient
          id="textLightToDark"
          x1="0%"
          y1="0%"
          x2="0%"
          y2="100%"
        >
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
          <stop offset="25%" stopColor="#D4E9FD" stopOpacity="0.88" />
          <stop offset="65%" stopColor="#0B57CD" stopOpacity="0.80" />
          <stop offset="100%" stopColor="#021C4A" stopOpacity="0.98" />
        </linearGradient>

        {/* Hover Spotlight Multi-Stop Color Gradient */}
        <linearGradient
          id="textGradient"
          gradientUnits="userSpaceOnUse"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="0%"
        >
          <stop offset="0%" stopColor="#eab308" />
          <stop offset="25%" stopColor="#ef4444" />
          <stop offset="50%" stopColor="#80eeb4" />
          <stop offset="75%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>

        {/* Cursor Tracking Reveal Mask: Expanded userSpaceOnUse bounds & feather-soft circular falloff */}
        <motion.radialGradient
          id="revealMask"
          gradientUnits="userSpaceOnUse"
          r="260"
          initial={{ cx: 600, cy: 85 }}
          animate={maskPosition}
          transition={{ duration: duration ?? 0, ease: "easeOut" }}
        >
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
          <stop offset="40%" stopColor="#FFFFFF" stopOpacity="0.85" />
          <stop offset="70%" stopColor="#FFFFFF" stopOpacity="0.35" />
          <stop offset="90%" stopColor="#000000" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0" />
        </motion.radialGradient>

        {/* Seamless userSpaceOnUse mask extending far outside letter bounds with zero straight edge clipping */}
        <mask
          id="textMask"
          maskUnits="userSpaceOnUse"
          maskContentUnits="userSpaceOnUse"
          x="-500"
          y="-300"
          width="2200"
          height="800"
        >
          <rect
            x="-500"
            y="-300"
            width="2200"
            height="800"
            fill="url(#revealMask)"
          />
        </mask>
      </defs>

      {/* Layer 1: Ambient Base Wordmark (Flawlessly unified, zero poking out artifacts) */}
      <text
        x="50%"
        y="48%"
        textAnchor="middle"
        dominantBaseline="central"
        strokeWidth="1.2"
        stroke="rgba(255, 255, 255, 0.4)"
        fill="url(#textLightToDark)"
        style={{
          ...fontStyle,
          opacity: hovered ? 0.98 : 0.92,
          transition: "opacity 0.25s ease",
        }}
      >
        {displayText}
      </text>

      {/* Layer 2: Interactive Spotlight Hover Reveal Layer (Exact same baseline & coordinates) */}
      <text
        x="50%"
        y="48%"
        textAnchor="middle"
        dominantBaseline="central"
        stroke="url(#textGradient)"
        fill="url(#textGradient)"
        strokeWidth="1.2"
        mask="url(#textMask)"
        className="select-none pointer-events-none"
        style={{
          ...fontStyle,
          filter: "drop-shadow(0 0 14px rgba(255, 255, 255, 0.45)) drop-shadow(0 0 28px rgba(11, 87, 205, 0.5))",
        }}
      >
        {displayText}
      </text>
    </svg>
  );
};

export const FooterBackgroundGradient = () => {
  return (
    <div
      className="absolute inset-0 z-0 pointer-events-none"
      style={{
        background:
          "radial-gradient(125% 125% at 50% 10%, #0751C666 50%, #3ca2fa33 100%)",
      }}
    />
  );
};

export default TextHoverEffect;
