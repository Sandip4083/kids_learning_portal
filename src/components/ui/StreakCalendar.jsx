"use client";
import { motion } from "framer-motion";

/**
 * GitHub-style streak calendar showing activity over last 12 weeks
 */
export default function StreakCalendar({ data }) {
  if (!data || data.length === 0) return null;

  const dayLabels = ["S", "M", "T", "W", "T", "F", "S"];

  return (
    <div className="overflow-x-auto">
      <div className="inline-flex gap-0.5">
        {/* Day labels */}
        <div className="flex flex-col gap-0.5 mr-1">
          {dayLabels.map((d, i) => (
            <span key={i} className="text-[9px] text-[var(--muted)] h-[14px] flex items-center">
              {i % 2 === 1 ? d : ""}
            </span>
          ))}
        </div>

        {/* Weeks */}
        {data.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-0.5">
            {week.map((day, di) => (
              <motion.div
                key={`${wi}-${di}`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: (wi * 7 + di) * 0.005 }}
                className={`streak-cell ${
                  day.isToday
                    ? "ring-1 ring-primary"
                    : ""
                }`}
                style={{
                  backgroundColor: day.active
                    ? `rgba(108, 92, 231, ${0.3 + 0.7})`
                    : "var(--surface-alt)",
                }}
                title={`${day.date}${day.active ? " ✅ Active" : ""}`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
