"use client";
import { useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useSound } from "@/contexts/SoundContext";
import { useGame } from "@/contexts/GameContext";
import { games } from "@/data/games";
import { ArrowRight, Star, Users, Zap, Cpu, Sparkles } from "lucide-react";

export default function GamesPage() {
  const { playSound } = useSound();
  const { visitSection, gamesPlayed, stopTimeTracking } = useGame();

  useEffect(() => {
    visitSection("games");
    return () => stopTimeTracking();
  }, [visitSection, stopTimeTracking]);

  return (
    <div className="min-h-screen px-4 py-10">
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <h1 className="text-4xl font-black mb-2">🎮 Game Zone</h1>
          <p className="text-[var(--muted)]">Play fun games against AI and earn XP while learning!</p>
          <p className="text-sm text-primary font-bold mt-2">{gamesPlayed.length}/{games.length} games played</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game, i) => {
            const played = gamesPlayed.includes(game.id);
            return (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -8 }}
              >
                <Link href={`/games/${game.id}`} onClick={() => playSound("pop")}
                  className={`block bg-gradient-to-br ${game.color} rounded-3xl p-1 shadow-lg hover:shadow-xl transition-shadow relative`}>

                  {/* NEW badge */}
                  {game.isNew && (
                    <div className="absolute -top-2 -right-2 z-10">
                      <motion.span
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-accent text-white text-xs font-black shadow-lg"
                      >
                        <Sparkles size={12} /> NEW
                      </motion.span>
                    </div>
                  )}

                  <div className="bg-[var(--surface)] rounded-[22px] p-6 h-full group hover:bg-transparent transition-colors duration-300">
                    <div className="flex items-start justify-between mb-4">
                      <motion.span className="text-4xl" whileHover={{ scale: 1.3, rotate: 15 }}>{game.icon}</motion.span>
                      <div className="flex flex-col items-end gap-1">
                        {played && <span className="px-2 py-1 rounded-full bg-secondary/10 text-secondary text-xs font-bold">✓ Played</span>}
                        {game.hasAI && (
                          <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center gap-1">
                            <Cpu size={10} /> AI
                          </span>
                        )}
                      </div>
                    </div>
                    <h3 className="text-lg font-extrabold mb-2 group-hover:text-white transition-colors">{game.title}</h3>
                    <p className="text-sm text-[var(--muted)] group-hover:text-white/80 mb-4 transition-colors">{game.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs">
                        <span className="flex items-center gap-1 text-[var(--muted)] group-hover:text-white/70 transition-colors">
                          <Star size={12} /> {game.difficulty}
                        </span>
                        <span className="flex items-center gap-1 text-[var(--muted)] group-hover:text-white/70 transition-colors">
                          <Users size={12} /> {game.players}
                        </span>
                      </div>
                      <span className="flex items-center gap-1 text-xs font-bold text-accent group-hover:text-white transition-colors">
                        <Zap size={12} /> +{game.xpReward} XP
                      </span>
                    </div>
                    <div className="mt-4 flex items-center gap-1 text-sm font-bold text-primary group-hover:text-white transition-colors">
                      Play Now <ArrowRight size={14} />
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
