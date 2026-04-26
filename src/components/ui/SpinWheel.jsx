"use client";
import { useState, useCallback } from "react";
import { motion } from "framer-motion";

const SEGMENTS = [
  { label: "+5 XP", xp: 5, color: "#6C5CE7" },
  { label: "+10 XP", xp: 10, color: "#00B894" },
  { label: "+15 XP", xp: 15, color: "#FDCB6E" },
  { label: "+25 XP", xp: 25, color: "#E84393" },
  { label: "+50 XP", xp: 50, color: "#74B9FF" },
  { label: "+30 XP", xp: 30, color: "#e17055" },
  { label: "+20 XP", xp: 20, color: "#D63031" },
  { label: "+40 XP", xp: 40, color: "#00cec9" },
];

/**
 * Animated CSS spin wheel with XP rewards
 */
export default function SpinWheel({ onSpin, canSpin = true }) {
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState(null);

  const segmentAngle = 360 / SEGMENTS.length;

  const handleSpin = useCallback(() => {
    if (spinning || !canSpin) return;
    setSpinning(true);
    setResult(null);

    // Random result
    const winIndex = Math.floor(Math.random() * SEGMENTS.length);
    const extraSpins = 5 + Math.floor(Math.random() * 3); // 5-7 full rotations
    const targetAngle = extraSpins * 360 + (360 - winIndex * segmentAngle - segmentAngle / 2);
    const newRotation = rotation + targetAngle;

    setRotation(newRotation);

    // Show result after spin completes
    setTimeout(() => {
      setResult(SEGMENTS[winIndex]);
      setSpinning(false);
      if (onSpin) onSpin(SEGMENTS[winIndex]);
    }, 4200);
  }, [spinning, canSpin, onSpin, rotation, segmentAngle]);

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Wheel container */}
      <div className="relative">
        {/* Pointer */}
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-10 text-2xl">▼</div>

        {/* Wheel */}
        <div
          className="w-56 h-56 rounded-full relative overflow-hidden border-4 border-[var(--border-color)] shadow-xl"
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: spinning ? "transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)" : "none",
          }}
        >
          {SEGMENTS.map((seg, i) => {
            const angle = i * segmentAngle;
            return (
              <div
                key={i}
                className="absolute w-full h-full"
                style={{
                  clipPath: `polygon(50% 50%, ${50 + 50 * Math.cos(((angle - 90) * Math.PI) / 180)}% ${50 + 50 * Math.sin(((angle - 90) * Math.PI) / 180)}%, ${50 + 50 * Math.cos(((angle + segmentAngle - 90) * Math.PI) / 180)}% ${50 + 50 * Math.sin(((angle + segmentAngle - 90) * Math.PI) / 180)}%)`,
                  backgroundColor: seg.color,
                }}
              >
                <div
                  className="absolute text-white text-[10px] font-bold"
                  style={{
                    left: "50%",
                    top: "20%",
                    transform: `rotate(${angle + segmentAngle / 2}deg) translateX(-50%)`,
                    transformOrigin: "50% 150%",
                  }}
                >
                  {seg.label}
                </div>
              </div>
            );
          })}
          {/* Center circle */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center text-lg font-black">
              🎰
            </div>
          </div>
        </div>
      </div>

      {/* Result */}
      {result && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center bg-primary/10 rounded-2xl px-6 py-3"
        >
          <p className="text-2xl font-black text-primary">🎉 {result.label}!</p>
        </motion.div>
      )}

      {/* Spin button */}
      <button
        onClick={handleSpin}
        disabled={spinning || !canSpin}
        className={`px-8 py-3 rounded-2xl font-bold text-lg transition-all touch-target ${
          canSpin && !spinning
            ? "bg-gradient-to-r from-primary to-pink text-white shadow-lg hover:shadow-xl hover:-translate-y-1"
            : "bg-[var(--surface-alt)] text-[var(--muted)] cursor-not-allowed"
        }`}
      >
        {spinning ? "Spinning..." : canSpin ? "🎰 Spin!" : "✅ Spun Today!"}
      </button>
    </div>
  );
}
