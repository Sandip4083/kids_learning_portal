"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParent } from "@/contexts/ParentContext";
import { useGame } from "@/contexts/GameContext";
import { getTopicAccuracy, getWeeklyProgress, getStrongWeakTopics, formatTimeSpent } from "@/lib/analytics";
import ProgressChart from "@/components/ui/ProgressChart";
import AccuracyGauge from "@/components/ui/AccuracyGauge";
import { Lock, Eye, EyeOff, ArrowLeft, Download, Shield, BarChart3, Clock, Target, Trophy, BookOpen, Gamepad2 } from "lucide-react";
import Link from "next/link";

function PINGate({ onSuccess, hasPin, onSetPin }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [isSettingPin, setIsSettingPin] = useState(!hasPin);
  const [confirmPin, setConfirmPin] = useState("");
  const [step, setStep] = useState(1); // 1: enter, 2: confirm (for new PIN)

  const handleNumber = (num) => {
    if (isSettingPin) {
      if (step === 1) {
        const newPin = pin + num;
        setPin(newPin);
        if (newPin.length === 4) {
          setStep(2);
          setPin("");
          setConfirmPin(newPin);
        }
      } else {
        const newPin = pin + num;
        setPin(newPin);
        if (newPin.length === 4) {
          if (newPin === confirmPin) {
            onSetPin(newPin);
            onSuccess();
          } else {
            setError(true);
            setPin("");
            setStep(1);
            setConfirmPin("");
            setTimeout(() => setError(false), 1000);
          }
        }
      }
    } else {
      const newPin = pin + num;
      setPin(newPin);
      if (newPin.length === 4) {
        if (onSuccess(newPin)) {
          // success
        } else {
          setError(true);
          setPin("");
          setTimeout(() => setError(false), 1000);
        }
      }
    }
  };

  const handleDelete = () => {
    setPin((p) => p.slice(0, -1));
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`bg-[var(--surface)] rounded-3xl border border-[var(--border-color)] p-8 text-center max-w-sm w-full shadow-xl ${error ? "animate-shake" : ""}`}
      >
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Shield size={32} className="text-primary" />
        </div>
        <h2 className="text-2xl font-black mb-2">
          {isSettingPin ? (step === 1 ? "Set Parent PIN" : "Confirm PIN") : "Parent Mode"}
        </h2>
        <p className="text-sm text-[var(--muted)] mb-6">
          {isSettingPin
            ? step === 1 ? "Choose a 4-digit PIN to protect parent access" : "Enter the same PIN again to confirm"
            : "Enter your 4-digit PIN to access parent dashboard"}
        </p>

        {/* PIN dots */}
        <div className="flex justify-center gap-3 mb-6">
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              animate={error ? { x: [0, -5, 5, -5, 5, 0] } : {}}
              className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center text-xl font-black transition-all ${
                pin.length > i
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-[var(--border-color)]"
              }`}
            >
              {pin.length > i ? (showPin ? pin[i] : "●") : ""}
            </motion.div>
          ))}
        </div>

        {/* Show/hide toggle */}
        <button onClick={() => setShowPin(!showPin)} className="text-xs text-[var(--muted)] mb-4 flex items-center justify-center gap-1">
          {showPin ? <EyeOff size={12} /> : <Eye size={12} />}
          {showPin ? "Hide" : "Show"} PIN
        </button>

        {error && <p className="text-danger text-sm font-bold mb-4">{isSettingPin ? "PINs don't match! Try again." : "Wrong PIN! Try again."}</p>}

        {/* Number pad */}
        <div className="grid grid-cols-3 gap-2 max-w-[240px] mx-auto">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, null, 0, "del"].map((num, i) => (
            <button
              key={i}
              onClick={() => {
                if (num === "del") handleDelete();
                else if (num !== null) handleNumber(String(num));
              }}
              disabled={num === null}
              className={`h-14 rounded-xl font-bold text-lg transition-all touch-target ${
                num === null
                  ? "invisible"
                  : num === "del"
                  ? "bg-danger/10 text-danger hover:bg-danger/20"
                  : "bg-[var(--surface-alt)] hover:bg-primary/10 hover:text-primary active:scale-95"
              }`}
            >
              {num === "del" ? "⌫" : num}
            </button>
          ))}
        </div>

        <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm text-[var(--muted)] mt-6 hover:text-primary">
          <ArrowLeft size={14} /> Back to Dashboard
        </Link>
      </motion.div>
    </div>
  );
}

export default function ParentPage() {
  const { hasPin, setPin, enterParentMode, isParentMode, exitParentMode, childName } = useParent();
  const g = useGame();
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    return () => exitParentMode();
  }, [exitParentMode]);

  if (!authenticated) {
    return (
      <PINGate
        hasPin={hasPin}
        onSetPin={(pin) => setPin(pin)}
        onSuccess={(pin) => {
          if (!hasPin) {
            setAuthenticated(true);
            enterParentMode(pin || "0000");
            return true;
          }
          const success = enterParentMode(pin);
          if (success) setAuthenticated(true);
          return success;
        }}
      />
    );
  }

  const mathAccuracy = getTopicAccuracy(g.quizHistory, "math");
  const scienceAccuracy = getTopicAccuracy(g.quizHistory, "science");
  const weeklyData = getWeeklyProgress(g.quizHistory);
  const { strong, weak } = getStrongWeakTopics(g.topicPerformance);
  const totalTime = Object.values(g.timeSpent || {}).reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen px-4 py-10">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-bold mb-4">
            <Shield size={16} /> Parent Mode Active
          </div>
          <h1 className="text-4xl font-black mb-2">👨‍👩‍👧 Parent Dashboard</h1>
          <p className="text-[var(--muted)]">{childName}&apos;s Learning Progress Report</p>
        </motion.div>

        {/* Child Overview */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-primary to-sky-dark rounded-3xl p-6 text-white mb-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center">
              <Trophy size={24} className="mx-auto mb-1 text-accent" />
              <p className="text-2xl font-black">{g.level}</p>
              <p className="text-white/70 text-xs">Level</p>
            </div>
            <div className="text-center">
              <Target size={24} className="mx-auto mb-1 text-accent" />
              <p className="text-2xl font-black">{g.quizzesCompleted}</p>
              <p className="text-white/70 text-xs">Quizzes Done</p>
            </div>
            <div className="text-center">
              <Clock size={24} className="mx-auto mb-1 text-accent" />
              <p className="text-2xl font-black">{formatTimeSpent(totalTime)}</p>
              <p className="text-white/70 text-xs">Total Time</p>
            </div>
            <div className="text-center">
              <BookOpen size={24} className="mx-auto mb-1 text-accent" />
              <p className="text-2xl font-black">{g.storiesRead?.length || 0}</p>
              <p className="text-white/70 text-xs">Stories Read</p>
            </div>
          </div>
        </motion.div>

        {/* Performance */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-[var(--surface)] rounded-3xl border border-[var(--border-color)] p-6">
            <h3 className="font-black mb-4 flex items-center gap-2">
              <BarChart3 size={18} className="text-primary" /> Subject Accuracy
            </h3>
            <div className="flex justify-center gap-8">
              <AccuracyGauge value={mathAccuracy} label="Math" color="#6C5CE7" size={90} />
              <AccuracyGauge value={scienceAccuracy} label="Science" color="#00B894" size={90} />
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-[var(--surface)] rounded-3xl border border-[var(--border-color)] p-6">
            <h3 className="font-black mb-4 flex items-center gap-2">
              <Clock size={18} className="text-sky-dark" /> Time per Subject
            </h3>
            <div className="space-y-3">
              {[
                { label: "Math", time: g.timeSpent?.math || 0, color: "bg-primary" },
                { label: "Science", time: g.timeSpent?.science || 0, color: "bg-secondary" },
                { label: "Stories", time: g.timeSpent?.stories || 0, color: "bg-accent" },
                { label: "Games", time: g.timeSpent?.games || 0, color: "bg-pink" },
              ].map((item, i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-semibold">{item.label}</span>
                    <span className="text-[var(--muted)]">{formatTimeSpent(item.time)}</span>
                  </div>
                  <div className="h-2 bg-[var(--surface-alt)] rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${item.color}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${totalTime > 0 ? (item.time / totalTime) * 100 : 0}%` }}
                      transition={{ duration: 1 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Weekly Progress */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-[var(--surface)] rounded-3xl border border-[var(--border-color)] p-6 mb-8">
          <h3 className="font-black mb-4">📈 Weekly Progress</h3>
          <ProgressChart data={weeklyData} color="#6C5CE7" />
        </motion.div>

        {/* Strong/Weak Topics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-[var(--surface)] rounded-3xl border border-[var(--border-color)] p-6">
            <h3 className="font-black mb-3 text-secondary">💪 Strengths</h3>
            {strong.length > 0 ? strong.map((t, i) => (
              <div key={i} className="flex justify-between py-2 border-b border-[var(--border-color)] last:border-0">
                <span className="text-sm font-semibold capitalize">{t.topic}</span>
                <span className="text-sm font-black text-secondary">{t.accuracy}%</span>
              </div>
            )) : <p className="text-sm text-[var(--muted)]">More data needed</p>}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-[var(--surface)] rounded-3xl border border-[var(--border-color)] p-6">
            <h3 className="font-black mb-3 text-orange">🎯 Areas to Improve</h3>
            {weak.length > 0 ? weak.map((t, i) => (
              <div key={i} className="flex justify-between py-2 border-b border-[var(--border-color)] last:border-0">
                <span className="text-sm font-semibold capitalize">{t.topic}</span>
                <span className="text-sm font-black text-orange">{t.accuracy}%</span>
              </div>
            )) : <p className="text-sm text-[var(--muted)]">No weak areas — great job!</p>}
          </motion.div>
        </div>

        {/* Quiz History */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-[var(--surface)] rounded-3xl border border-[var(--border-color)] p-6 mb-8">
          <h3 className="font-black mb-4">📝 Full Quiz History</h3>
          {g.quizHistory.length > 0 ? (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {[...g.quizHistory].reverse().map((q, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-[var(--surface-alt)]">
                  <div className="flex items-center gap-3">
                    <span>{q.category === "math" ? "🧮" : "🔬"}</span>
                    <div>
                      <p className="text-sm font-bold capitalize">{q.category}</p>
                      <p className="text-xs text-[var(--muted)]">{new Date(q.date).toLocaleDateString()} {new Date(q.date).toLocaleTimeString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-black ${q.score / q.total >= 0.8 ? "text-secondary" : q.score / q.total >= 0.5 ? "text-accent-dark" : "text-danger"}`}>
                      {q.score}/{q.total}
                    </p>
                    <p className="text-[10px] text-[var(--muted)]">{Math.round((q.score / q.total) * 100)}%</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[var(--muted)]">No quizzes completed yet.</p>
          )}
        </motion.div>

        {/* Actions */}
        <div className="flex justify-center gap-3">
          <button onClick={() => { setAuthenticated(false); exitParentMode(); }}
            className="px-6 py-3 rounded-xl bg-danger/10 text-danger font-bold hover:bg-danger/20 transition-colors touch-target">
            <Lock size={16} className="inline mr-2" /> Exit Parent Mode
          </button>
        </div>
      </div>
    </div>
  );
}
