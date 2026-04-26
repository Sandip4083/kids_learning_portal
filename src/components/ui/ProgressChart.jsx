"use client";
import { motion } from "framer-motion";

/**
 * Lightweight SVG bar chart for weekly/monthly progress
 */
export default function ProgressChart({ data, color = "#6C5CE7", height = 160, label = "XP" }) {
  const maxVal = Math.max(...data.map((d) => d.xp), 1);

  return (
    <div className="w-full">
      <div className="flex items-end justify-between gap-1" style={{ height }}>
        {data.map((d, i) => {
          const barHeight = (d.xp / maxVal) * (height - 30);
          return (
            <div key={i} className="flex-1 flex flex-col items-center justify-end gap-1">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: barHeight }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="w-full rounded-t-lg relative group cursor-pointer"
                style={{
                  background: `linear-gradient(to top, ${color}88, ${color})`,
                  minHeight: d.xp > 0 ? 4 : 0,
                }}
              >
                {/* Tooltip */}
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[var(--foreground)] text-[var(--background)] text-[10px] px-2 py-0.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-bold">
                  {d.xp} {label}
                </div>
              </motion.div>
              <span className="text-[10px] text-[var(--muted)] font-semibold">{d.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
