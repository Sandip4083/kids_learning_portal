"use client";
/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useGame } from "@/contexts/GameContext";
import { useSound } from "@/contexts/SoundContext";
import { useEngagement } from "@/contexts/EngagementContext";
import { achievements as allAchievements, dailyChallenges, levelThresholds } from "@/data/achievements";
import { getWeeklyProgress, getTopicAccuracy, getStrongWeakTopics, getStreakCalendarData, formatTimeSpent } from "@/lib/analytics";
import { getRecommendations } from "@/lib/personalization";
import ProgressChart from "@/components/ui/ProgressChart";
import StreakCalendar from "@/components/ui/StreakCalendar";
import AccuracyGauge from "@/components/ui/AccuracyGauge";
import SpinWheel from "@/components/ui/SpinWheel";
import { Trophy, Flame, Zap, Target, BookOpen, Gamepad2, Star, Gift, TrendingUp, Clock, ArrowRight, Award } from "lucide-react";

export default function DashboardPage() {
  const g = useGame();
  const { playSound } = useSound();
  const { canClaimDailyReward, claimDailyReward, canSpin, spin, DAILY_REWARDS } = useEngagement();
  const [dailyChallenge, setDailyChallenge] = useState(null);
  const [dailyRewardResult, setDailyRewardResult] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    g.visitSection("dashboard");
  }, [g.visitSection]);

  useEffect(() => {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
    setDailyChallenge(dailyChallenges[dayOfYear % dailyChallenges.length]);
  }, []);

  const xpForNext = levelThresholds[Math.min(g.level, 49)]?.xpRequired || 5000;
  const xpForCurrent = g.level > 1 ? levelThresholds[g.level - 1]?.xpRequired || 0 : 0;
  const progress = Math.min(((g.xp - xpForCurrent) / (xpForNext - xpForCurrent)) * 100, 100);
  const unlockedCount = g.achievements?.length || 0;

  const mathAccuracy = getTopicAccuracy(g.quizHistory, "math");
  const scienceAccuracy = getTopicAccuracy(g.quizHistory, "science");
  const weeklyData = getWeeklyProgress(g.quizHistory);
  const { strong, weak } = getStrongWeakTopics(g.topicPerformance);
  const streakCalendarData = getStreakCalendarData(g.streakCalendar);
  const recommendations = getRecommendations(g);

  const stats = [
    { icon: <Zap size={20} />, label: "Total XP", value: g.xp, color: "text-accent-dark" },
    { icon: <Trophy size={20} />, label: "Level", value: g.level, color: "text-primary" },
    { icon: <Flame size={20} />, label: "Streak", value: `${g.streak}d`, color: "text-orange" },
    { icon: <Target size={20} />, label: "Quizzes", value: g.quizzesCompleted, color: "text-pink" },
    { icon: <BookOpen size={20} />, label: "Stories", value: g.storiesRead?.length || 0, color: "text-secondary" },
    { icon: <Gamepad2 size={20} />, label: "Games", value: g.gamesPlayed?.length || 0, color: "text-sky-dark" },
  ];

  const handleClaimDailyReward = () => {
    const reward = claimDailyReward();
    if (reward) {
      g.addXp(reward.xp);
      setDailyRewardResult(reward);
      playSound("levelup");
      setTimeout(() => setDailyRewardResult(null), 3000);
    }
  };

  const handleSpin = (reward) => {
    const result = spin();
    if (result) {
      g.addXp(result.xp);
      playSound("levelup");
    }
  };

  return (
    <div className="min-h-screen px-4 py-10">
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="text-4xl font-black mb-2">📊 Dashboard</h1>
          <p className="text-[var(--muted)]">Track your learning progress & earn rewards!</p>
        </motion.div>

        {/* Level Progress */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-primary to-pink rounded-3xl p-6 sm:p-8 text-white mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-white/70 text-sm font-semibold">Current Level</p>
              <p className="text-4xl font-black">{g.level}</p>
              <p className="text-white/70 text-sm">{levelThresholds[Math.min(g.level - 1, 49)]?.title || "Legend"}</p>
            </div>
            <div className="text-right">
              <p className="text-white/70 text-sm font-semibold">XP to Next Level</p>
              <p className="text-2xl font-black">{g.xp} / {xpForNext}</p>
            </div>
          </div>
          <div className="h-4 bg-white/20 rounded-full overflow-hidden">
            <motion.div className="h-full bg-white rounded-full" animate={{ width: `${progress}%` }} transition={{ duration: 1 }} />
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {[
            { id: "overview", label: "Overview", icon: "📊" },
            { id: "analytics", label: "Analytics", icon: "📈" },
            { id: "rewards", label: "Rewards", icon: "🎁" },
            { id: "achievements", label: "Badges", icon: "🏆" },
          ].map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap touch-target ${
                activeTab === tab.id ? "bg-primary text-white" : "bg-[var(--surface)] border border-[var(--border-color)]"
              }`}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-8">
              {stats.map((s, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="bg-[var(--surface)] rounded-2xl border border-[var(--border-color)] p-3 text-center">
                  <div className={`flex justify-center mb-1 ${s.color}`}>{s.icon}</div>
                  <p className="text-xl font-black">{s.value}</p>
                  <p className="text-[10px] text-[var(--muted)] font-semibold">{s.label}</p>
                </motion.div>
              ))}
            </div>

            {/* Recommended for You */}
            {recommendations.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="bg-[var(--surface)] rounded-3xl border border-[var(--border-color)] p-6 mb-8">
                <h2 className="text-lg font-black mb-4 flex items-center gap-2">
                  <TrendingUp size={20} className="text-primary" /> Recommended for You
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {recommendations.map((rec, i) => (
                    <Link key={i} href={rec.href}
                      className="flex items-center gap-3 p-3 rounded-2xl bg-[var(--surface-alt)] hover:bg-primary/5 transition-colors touch-target">
                      <span className="text-2xl">{rec.icon}</span>
                      <div className="flex-1">
                        <p className="text-sm font-bold">{rec.title}</p>
                        <p className="text-xs text-[var(--muted)]">{rec.subtitle}</p>
                      </div>
                      <ArrowRight size={16} className="text-primary" />
                    </Link>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Daily Challenge */}
            {dailyChallenge && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="bg-[var(--surface)] rounded-3xl border border-[var(--border-color)] p-6 mb-8">
                <div className="flex items-center gap-3 mb-3">
                  <Gift size={24} className="text-accent-dark" />
                  <h2 className="text-lg font-black">Daily Challenge</h2>
                </div>
                <div className="flex items-center justify-between bg-accent/10 rounded-2xl p-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{dailyChallenge.icon}</span>
                    <div>
                      <p className="font-bold">{dailyChallenge.title}</p>
                      <p className="text-sm text-[var(--muted)]">{dailyChallenge.description}</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-accent-dark shrink-0">+{dailyChallenge.xpReward} XP</span>
                </div>
              </motion.div>
            )}

            {/* Recent Quizzes */}
            {g.quizHistory && g.quizHistory.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="bg-[var(--surface)] rounded-3xl border border-[var(--border-color)] p-6 mb-8">
                <h2 className="text-lg font-black mb-4 flex items-center gap-2">
                  <Star size={20} className="text-accent" /> Recent Quizzes
                </h2>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {g.quizHistory.slice(-5).reverse().map((q, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-[var(--surface-alt)]">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{q.category === "math" ? "🧮" : "🔬"}</span>
                        <div>
                          <p className="text-sm font-bold capitalize">{q.category} Quiz</p>
                          <p className="text-xs text-[var(--muted)]">{new Date(q.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <span className={`text-sm font-black ${q.score === q.total ? "text-secondary" : "text-primary"}`}>
                        {q.score}/{q.total}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </>
        )}

        {/* ANALYTICS TAB */}
        {activeTab === "analytics" && (
          <>
            {/* Accuracy Gauges */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="bg-[var(--surface)] rounded-3xl border border-[var(--border-color)] p-6 mb-8">
              <h2 className="text-lg font-black mb-4">📊 Accuracy by Subject</h2>
              <div className="flex justify-center gap-8">
                <AccuracyGauge value={mathAccuracy} label="Math" color="#6C5CE7" />
                <AccuracyGauge value={scienceAccuracy} label="Science" color="#00B894" />
              </div>
            </motion.div>

            {/* Weekly Progress */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="bg-[var(--surface)] rounded-3xl border border-[var(--border-color)] p-6 mb-8">
              <h2 className="text-lg font-black mb-4">📈 Weekly XP Progress</h2>
              <ProgressChart data={weeklyData} color="#6C5CE7" />
            </motion.div>

            {/* Time Spent */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="bg-[var(--surface)] rounded-3xl border border-[var(--border-color)] p-6 mb-8">
              <h2 className="text-lg font-black mb-4 flex items-center gap-2">
                <Clock size={20} className="text-sky-dark" /> Time Spent Learning
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Math", time: g.timeSpent?.math || 0, icon: "🧮", color: "from-primary to-sky" },
                  { label: "Science", time: g.timeSpent?.science || 0, icon: "🔬", color: "from-secondary to-sky" },
                  { label: "Stories", time: g.timeSpent?.stories || 0, icon: "📚", color: "from-accent to-orange" },
                  { label: "Games", time: g.timeSpent?.games || 0, icon: "🎮", color: "from-pink to-danger" },
                ].map((item, i) => (
                  <div key={i} className={`bg-gradient-to-br ${item.color} rounded-2xl p-4 text-white text-center`}>
                    <span className="text-2xl block mb-1">{item.icon}</span>
                    <p className="text-lg font-black">{formatTimeSpent(item.time)}</p>
                    <p className="text-white/70 text-xs">{item.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Strong vs Weak Topics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="bg-[var(--surface)] rounded-3xl border border-[var(--border-color)] p-6">
                <h2 className="text-lg font-black mb-3 text-secondary">💪 Strong Topics</h2>
                {strong.length > 0 ? strong.map((t, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-[var(--border-color)] last:border-0">
                    <div>
                      <p className="text-sm font-bold capitalize">{t.topic}</p>
                      <p className="text-xs text-[var(--muted)]">{t.category}</p>
                    </div>
                    <span className="text-sm font-black text-secondary">{t.accuracy}%</span>
                  </div>
                )) : <p className="text-sm text-[var(--muted)]">Complete more quizzes to see your strengths!</p>}
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="bg-[var(--surface)] rounded-3xl border border-[var(--border-color)] p-6">
                <h2 className="text-lg font-black mb-3 text-orange">🎯 Needs Practice</h2>
                {weak.length > 0 ? weak.map((t, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-[var(--border-color)] last:border-0">
                    <div>
                      <p className="text-sm font-bold capitalize">{t.topic}</p>
                      <p className="text-xs text-[var(--muted)]">{t.category}</p>
                    </div>
                    <span className="text-sm font-black text-orange">{t.accuracy}%</span>
                  </div>
                )) : <p className="text-sm text-[var(--muted)]">No weak areas detected — keep it up!</p>}
              </motion.div>
            </div>

            {/* Streak Calendar */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="bg-[var(--surface)] rounded-3xl border border-[var(--border-color)] p-6">
              <h2 className="text-lg font-black mb-4 flex items-center gap-2">
                <Flame size={20} className="text-orange" /> Activity Calendar
              </h2>
              <StreakCalendar data={streakCalendarData} />
              <p className="text-xs text-[var(--muted)] mt-3">🔥 {g.streak}-day streak · {g.streakCalendar?.length || 0} active days total</p>
            </motion.div>
          </>
        )}

        {/* REWARDS TAB */}
        {activeTab === "rewards" && (
          <>
            {/* Daily Login Reward */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="bg-[var(--surface)] rounded-3xl border border-[var(--border-color)] p-6 mb-8">
              <h2 className="text-lg font-black mb-4 flex items-center gap-2">
                <Gift size={20} className="text-accent-dark" /> Daily Login Reward
              </h2>
              <div className="grid grid-cols-7 gap-2 mb-4">
                {DAILY_REWARDS.map((r, i) => (
                  <div key={i} className={`text-center p-2 rounded-xl border ${
                    i < (canClaimDailyReward() ? 0 : 1) ? "bg-primary/10 border-primary" : "bg-[var(--surface-alt)] border-[var(--border-color)]"
                  }`}>
                    <span className="text-lg block">{r.icon}</span>
                    <p className="text-[10px] font-bold">{r.label}</p>
                    <p className="text-[10px] text-[var(--muted)]">+{r.xp} XP</p>
                  </div>
                ))}
              </div>
              {dailyRewardResult ? (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                  className="text-center p-4 bg-accent/10 rounded-2xl">
                  <p className="text-2xl mb-1">🎉</p>
                  <p className="font-black text-accent-dark">+{dailyRewardResult.xp} XP Claimed!</p>
                </motion.div>
              ) : (
                <button onClick={handleClaimDailyReward} disabled={!canClaimDailyReward()}
                  className={`w-full py-3 rounded-xl font-bold transition-all touch-target ${
                    canClaimDailyReward()
                      ? "bg-gradient-to-r from-accent to-orange text-white hover:shadow-lg"
                      : "bg-[var(--surface-alt)] text-[var(--muted)] cursor-not-allowed"
                  }`}>
                  {canClaimDailyReward() ? "🎁 Claim Daily Reward!" : "✅ Already Claimed Today"}
                </button>
              )}
            </motion.div>

            {/* Spin Wheel */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="bg-[var(--surface)] rounded-3xl border border-[var(--border-color)] p-6 mb-8">
              <h2 className="text-lg font-black mb-4 text-center">🎰 Lucky Spin Wheel</h2>
              <p className="text-sm text-[var(--muted)] text-center mb-6">Spin once per day for bonus XP!</p>
              <SpinWheel onSpin={handleSpin} canSpin={canSpin()} />
            </motion.div>
          </>
        )}

        {/* ACHIEVEMENTS TAB */}
        {activeTab === "achievements" && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-[var(--surface)] rounded-3xl border border-[var(--border-color)] p-6">
            <h2 className="text-lg font-black mb-4 flex items-center gap-2">
              <Trophy size={20} className="text-primary" /> Achievements ({unlockedCount}/{allAchievements.length})
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {allAchievements.map((a) => {
                const unlocked = g.achievements?.includes(a.id);
                return (
                  <motion.div key={a.id} whileHover={{ scale: 1.03 }}
                    className={`p-4 rounded-2xl border text-center transition-all ${
                      unlocked ? "bg-primary/5 border-primary" : "bg-[var(--surface-alt)] border-[var(--border-color)] opacity-50"
                    }`}>
                    <span className="text-2xl block mb-1">{a.icon}</span>
                    <p className="text-xs font-bold">{a.name}</p>
                    <p className="text-[10px] text-[var(--muted)]">{a.description}</p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
