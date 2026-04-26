"use client";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useGame } from "@/contexts/GameContext";
import { Trophy, Medal, Award, Flame, Crown } from "lucide-react";

export default function LeaderboardPage() {
  const { xp, level } = useGame();
  const [tab, setTab] = useState("all");

  const allUsers = useMemo(() => {
    // Generate competitors relative to user's current XP
    // Ensure the base is at least 500 so competitors don't have negative XP
    const base = Math.max(500, xp);
    
    let rivals = [
      { name: "SuperStar⭐", xp: base + 1450, level: level + 5, avatar: "🦸" },
      { name: "MathWhiz🧮", xp: base + 820, level: level + 3, avatar: "🧙" },
      { name: "ScienceGirl🔬", xp: base + 350, level: level + 1, avatar: "👩‍🔬" },
      { name: "GameKing🎮", xp: Math.max(0, xp - 150), level: Math.max(1, level - 1), avatar: "🤴" },
      { name: "BookWorm📚", xp: Math.max(0, xp - 400), level: Math.max(1, level - 2), avatar: "🐛" },
      { name: "BrainBox🧠", xp: Math.max(0, xp - 800), level: Math.max(1, level - 3), avatar: "🤓" },
      { name: "QuizChamp🏆", xp: Math.max(0, xp - 1200), level: Math.max(1, level - 4), avatar: "🏅" },
      { name: "StarLearner💫", xp: Math.max(0, xp - 1600), level: Math.max(1, level - 5), avatar: "⭐" },
    ];

    if (tab === "weekly") {
      rivals = rivals.map(r => ({ ...r, xp: Math.floor(r.xp * 0.2) }));
      return [...rivals, { name: "You 🎯", xp: Math.floor(xp * 0.2), level, avatar: "🧒", isYou: true }]
        .sort((a, b) => b.xp - a.xp)
        .map((u, i) => ({ ...u, rank: i + 1 }));
    }

    return [...rivals, { name: "You 🎯", xp, level, avatar: "🧒", isYou: true }]
      .sort((a, b) => b.xp - a.xp)
      .map((u, i) => ({ ...u, rank: i + 1 }));
  }, [xp, level, tab]);

  const rankIcons = { 1: <Crown size={20} className="text-accent" />, 2: <Medal size={20} className="text-[#C0C0C0]" />, 3: <Award size={20} className="text-orange" /> };

  return (
    <div className="min-h-screen px-4 py-10">
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <h1 className="text-4xl font-black mb-2">🏆 Leaderboard</h1>
          <p className="text-[var(--muted)]">See how you rank against other learners!</p>
        </motion.div>

        {/* Tabs */}
        <div className="flex justify-center gap-2 mb-8">
          {[{id:"all",label:"All Time"},{id:"weekly",label:"This Week"}].map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)}
              className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${tab===t.id?'bg-primary text-white':'bg-[var(--surface)] border border-[var(--border-color)]'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Top 3 Podium */}
        <div className="flex justify-center items-end gap-4 mb-10">
          {[allUsers[1], allUsers[0], allUsers[2]].filter(Boolean).map((u, i) => {
            const heights = ["h-24", "h-32", "h-20"];
            const sizes = ["text-4xl", "text-5xl", "text-3xl"];
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.15 }}
                className={`flex flex-col items-center ${u?.isYou ? '' : ''}`}>
                <span className={`${sizes[i]} mb-2`}>{u?.avatar}</span>
                <p className={`text-xs font-bold text-center mb-1 ${u?.isYou ? 'text-primary' : ''}`}>{u?.name}</p>
                <p className="text-xs text-[var(--muted)]">{u?.xp} XP</p>
                <div className={`${heights[i]} w-20 rounded-t-xl mt-2 flex items-start justify-center pt-2 ${
                  i === 1 ? 'bg-gradient-to-b from-accent to-accent-dark' : i === 0 ? 'bg-gradient-to-b from-[#C0C0C0] to-[#A0A0A0]' : 'bg-gradient-to-b from-orange to-danger'
                }`}>
                  <span className="text-white font-black text-lg">#{u?.rank}</span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Full List */}
        <div className="space-y-2">
          {allUsers.map((u, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
              className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                u.isYou ? 'bg-primary/5 border-primary' : 'bg-[var(--surface)] border-[var(--border-color)]'
              }`}>
              <span className="w-8 text-center font-black text-lg">
                {rankIcons[u.rank] || `#${u.rank}`}
              </span>
              <span className="text-2xl">{u.avatar}</span>
              <div className="flex-1">
                <p className={`font-bold text-sm ${u.isYou ? 'text-primary' : ''}`}>{u.name}</p>
                <p className="text-xs text-[var(--muted)]">Level {u.level}</p>
              </div>
              <div className="text-right">
                <p className="font-black text-sm">{u.xp} XP</p>
                <div className="flex items-center gap-1 justify-end">
                  <Flame size={12} className="text-orange" />
                  <span className="text-xs text-[var(--muted)]">Lv.{u.level}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
