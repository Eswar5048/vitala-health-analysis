import React, { useEffect, useRef, useState } from "react";

export default function VideoSection({ className = "", isFullscreenIntro = true, onSweepComplete }) {
  const canvasRef = useRef(null);
  const [isHdQuality, setIsHdQuality] = useState(true);
  const onSweepCompleteRef = useRef(onSweepComplete);

  useEffect(() => {
    onSweepCompleteRef.current = onSweepComplete;
  }, [onSweepComplete]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationFrameId;
    let startTime = performance.now();
    let time = 0;
    let sweepTriggered = false;

    const resize = () => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      if (rect.width > 0 && rect.height > 0) {
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);
      }
    };

    resize();
    window.addEventListener("resize", resize);

    // Primary ECG cardiac wave generator
    const getECGValue = (t) => {
      const cycle = t % 2.2;
      if (cycle < 0.18) {
        return Math.sin((cycle / 0.18) * Math.PI) * 14;
      } else if (cycle >= 0.22 && cycle < 0.27) {
        return -Math.sin(((cycle - 0.22) / 0.05) * Math.PI) * 12;
      } else if (cycle >= 0.27 && cycle < 0.39) {
        return Math.sin(((cycle - 0.27) / 0.12) * Math.PI) * 88;
      } else if (cycle >= 0.39 && cycle < 0.45) {
        return -Math.sin(((cycle - 0.39) / 0.06) * Math.PI) * 20;
      } else if (cycle >= 0.62 && cycle < 0.92) {
        return Math.sin(((cycle - 0.62) / 0.3) * Math.PI) * 24;
      }
      return 0;
    };

    const render = (now) => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      // Guard against non-finite or zero dimensions
      if (!width || !height || width <= 0 || height <= 0 || !Number.isFinite(width) || !Number.isFinite(height)) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      const elapsed = (now - startTime) / 1000;

      // 4.0s intro sweep duration
      const introDuration = 4.0;
      const isIntroPhase = elapsed < introDuration;
      const introProgress = Math.min(1, Math.max(0, elapsed / introDuration));
      const maxDrawX = Math.max(0, Math.min(width, isIntroPhase ? width * introProgress : width));

      if (elapsed >= introDuration && !sweepTriggered) {
        sweepTriggered = true;
        if (onSweepCompleteRef.current) onSweepCompleteRef.current();
      }

      // Dark clinical deep navy background
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, "#08162B");
      grad.addColorStop(0.5, "#0F2747");
      grad.addColorStop(1, "#091A32");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Subtle medical grid
      ctx.save();
      const gridSize = 32;
      for (let x = 0; x < width; x += gridSize) {
        const lineAlpha = isIntroPhase
          ? Math.max(0, Math.min(0.1, (1 - (x / width) + (introProgress * 1.5)) * 0.1))
          : 0.1;
        ctx.strokeStyle = `rgba(15, 118, 110, ${lineAlpha})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        const gridAlpha = isIntroPhase ? Math.min(0.1, introProgress * 0.1) : 0.1;
        ctx.strokeStyle = `rgba(15, 118, 110, ${gridAlpha})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
      ctx.restore();

      // Ambient radial glow behind the primary wave
      const glowAlpha = isIntroPhase ? introProgress * 0.25 : 0.25;
      const radialGlow = ctx.createRadialGradient(
        width * 0.5,
        height * 0.5,
        20,
        width * 0.5,
        height * 0.5,
        width * 0.5
      );
      radialGlow.addColorStop(0, `rgba(15, 118, 110, ${glowAlpha})`);
      radialGlow.addColorStop(1, "rgba(15, 39, 71, 0)");
      ctx.fillStyle = radialGlow;
      ctx.fillRect(0, 0, width, height);

      // Primary Pure ECG Waveform Flow
      const midY = height * 0.46;
      ctx.beginPath();
      ctx.strokeStyle = "#14B8A6";
      ctx.lineWidth = 2.5;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.shadowColor = "#0F766E";
      ctx.shadowBlur = 12;

      const speed = 75;
      for (let x = 0; x <= maxDrawX; x += 2) {
        const t = (x / speed) - (time * 0.85);
        const ecgVal = getECGValue((t % 220 + 220) % 2.2);
        const y = midY - ecgVal;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Leading glowing pulse dot during intro sweep
      if (isIntroPhase) {
        const curT = (maxDrawX / speed) - (time * 0.85);
        const leadY = midY - getECGValue((curT % 220 + 220) % 2.2);

        ctx.beginPath();
        ctx.arc(maxDrawX, leadY, 4, 0, Math.PI * 2);
        ctx.fillStyle = "#FFFFFF";
        ctx.shadowColor = "#14B8A6";
        ctx.shadowBlur = 15;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      time += 0.016;
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div
      className={`relative overflow-hidden bg-[#0F2747] border-0 shadow-none flex flex-col justify-between ${className}`}
    >
      {/* Dynamic Video Canvas */}
      <div className="absolute inset-0 z-0">
        <canvas
          ref={canvasRef}
          className="w-full h-full object-cover block"
          style={{ width: "100%", height: "100%" }}
        />
      </div>

      {/* Badges: ONLY displayed during the 4s intro sequence; completely hidden once sign-in appears */}
      {isFullscreenIntro && (
        <>
          {/* Top-Left: Live Stream Badge with Sharp Edges */}
          <div className="relative z-10 p-5 flex items-center justify-between pointer-events-none">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-none bg-[#08162B]/85 border border-teal-600/40 backdrop-blur-sm shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-none bg-teal-400 opacity-75"></span>
                <span className="relative inline-flex rounded-none h-2 w-2 bg-teal-500"></span>
              </span>
              <span className="text-xs font-medium tracking-wide text-teal-200 uppercase font-mono">
                Live Stream
              </span>
            </div>
          </div>

          <div className="relative z-10 flex-1"></div>

          {/* Bottom-Right: 24 FPS · HD Button with Sharp Edges */}
          <div className="relative z-10 p-5 flex items-center justify-end">
            <button
              type="button"
              onClick={() => setIsHdQuality(!isHdQuality)}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-none bg-[#08162B]/85 hover:bg-[#0A1D37] border border-teal-600/40 text-teal-200 text-xs font-mono font-medium backdrop-blur-sm transition-all cursor-pointer shadow-sm"
              title="Toggle Stream Quality"
            >
              <span className="h-2 w-2 rounded-none bg-teal-400"></span>
              <span>{isHdQuality ? "24 FPS · HD" : "24 FPS · SD"}</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
