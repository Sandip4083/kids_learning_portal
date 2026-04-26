"use client";
/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { useEngagement } from "@/contexts/EngagementContext";

/**
 * Achievement popup toast with animation and auto-dismiss
 */
export default function AchievementPopup() {
  const { achievementQueue, dequeueAchievement } = useEngagement();
  const [current, setCurrent] = useState(null);

  useEffect(() => {
    if (achievementQueue.length > 0 && !current) {
      setCurrent(achievementQueue[0]);
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.3, x: 0.85 } });

      // Auto dismiss after 4 seconds
      setTimeout(() => {
        setCurrent(null);
        dequeueAchievement();
      }, 4000);
    }
  }, [achievementQueue, current, dequeueAchievement]);

  return (
    <AnimatePresence>
      {current && (
        <motion.div
          initial={{ x: 100, opacity: 0, scale: 0.8 }}
          animate={{ x: 0, opacity: 1, scale: 1 }}
          exit={{ x: 100, opacity: 0, scale: 0.8 }}
          className="achievement-popup"
        >
          <div className="bg-[var(--surface)] rounded-2xl border-2 border-primary shadow-2xl p-4 flex items-center gap-3 min-w-[280px]">
            <motion.span
              className="text-4xl"
              animate={{ rotate: [0, -15, 15, -15, 0], scale: [1, 1.2, 1] }}
              transition={{ duration: 0.5 }}
            >
              {current.icon || "🏆"}
            </motion.span>
            <div>
              <p className="text-xs text-primary font-bold uppercase tracking-wide">Achievement Unlocked!</p>
              <p className="font-black text-sm">{current.name || current.title}</p>
              <p className="text-xs text-[var(--muted)]">{current.description}</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
