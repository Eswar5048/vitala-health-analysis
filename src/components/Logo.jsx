import React from "react";

export default function Logo({ className = "w-11 h-11", size = 44 }) {
  return (
    <div
      className={`relative inline-flex items-center justify-center flex-shrink-0 group cursor-pointer transition-transform duration-300 hover:scale-105 ${className}`}
      style={{ width: `${size}px`, height: `${size}px` }}
      aria-label="Vital Brand Logo"
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full overflow-visible"
      >
        {/* Dynamic Glow Filter */}
        <defs>
          <filter id="vital-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="2.5" floodColor="#14B8A6" floodOpacity="0.5" />
          </filter>
          <linearGradient id="vital-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2DD4BF" />
            <stop offset="50%" stopColor="#0F766E" />
            <stop offset="100%" stopColor="#14B8A6" />
          </linearGradient>
          <linearGradient id="vital-grad-2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#14B8A6" />
            <stop offset="100%" stopColor="#2DD4BF" />
          </linearGradient>
        </defs>

        {/* Blueprint Grid Lines (Architectural Grid Structure) */}
        <g stroke="rgba(15, 118, 110, 0.45)" strokeWidth="1.2" strokeLinecap="square">
          {/* Vertical grid pillars */}
          <line x1="41" y1="16" x2="41" y2="84" />
          <line x1="59" y1="16" x2="59" y2="84" />
          <line x1="30" y1="33" x2="30" y2="67" />
          <line x1="70" y1="33" x2="70" y2="67" />

          {/* Horizontal grid crossbars */}
          <line x1="16" y1="41" x2="84" y2="41" />
          <line x1="16" y1="59" x2="84" y2="59" />
          <line x1="33" y1="30" x2="67" y2="30" />
          <line x1="33" y1="70" x2="67" y2="70" />
        </g>

        {/* Dynamic Interlocking Medical Ribbon Path 1 (Top-Left to Bottom-Right Loop) */}
        <path
          d="M33 50 C33 41, 41 33, 50 33 C59 33, 59 41, 59 50 C59 59, 50 67, 41 67 C33 67, 33 59, 33 50 Z"
          stroke="url(#vital-grad-1)"
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#vital-glow)"
          className="transition-all duration-500 group-hover:stroke-[#2DD4BF]"
        />

        {/* Dynamic Interlocking Medical Ribbon Path 2 (Top-Right / Outer Fluid Organic Cross Wave) */}
        <path
          d="M50 25 C41 25, 41 41, 30 41 C22 41, 22 50, 30 50 C41 50, 41 67, 50 75 C59 75, 59 59, 70 59 C78 59, 78 50, 70 50 C59 50, 59 33, 50 25 Z"
          stroke="url(#vital-grad-2)"
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#vital-glow)"
          className="transition-all duration-500 group-hover:stroke-[#14B8A6]"
        />

        {/* Dynamic Orbital Nodal Dots with Pulse Animation */}
        {/* Nodal Point 1: Top Right */}
        <g className="animate-pulse">
          <circle cx="68" cy="35" r="4" fill="#2DD4BF" />
          <circle cx="68" cy="35" r="6" stroke="#2DD4BF" strokeWidth="1" opacity="0.6" />
        </g>

        {/* Nodal Point 2: Bottom Left */}
        <g className="animate-pulse" style={{ animationDelay: "750ms" }}>
          <circle cx="32" cy="65" r="4" fill="#2DD4BF" />
          <circle cx="32" cy="65" r="6" stroke="#2DD4BF" strokeWidth="1" opacity="0.6" />
        </g>
      </svg>
    </div>
  );
}
