"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { useSound } from "@/contexts/SoundContext";
import { useGame } from "@/contexts/GameContext";
import { Lightbulb, XCircle } from "lucide-react";
import Link from "next/link";
import confetti from "canvas-confetti";

const COLORS = [
  { name: "red", bg: "bg-danger", active: "bg-danger/50" },
  { name: "blue", bg: "bg-sky-dark", active: "bg-sky" },
  { name: "green", bg: "bg-secondary", active: "bg-secondary/50" },
  { name: "yellow", bg: "bg-accent", active: "bg-accent/50" },
];

export default function SimonSaysPage() {
  const { playSound } = useSound();
  const { addXp, playGame } = useGame();
  const [sequence, setSequence] = useState([]);
  const [playerSeq, setPlayerSeq] = useState([]);
  const [activeColor, setActiveColor] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [started, setStarted] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const timeoutRef = useRef(null);

  const flashColor = useCallback((color) => {
    setActiveColor(color);
    setTimeout(() => setActiveColor(null), 400);
  }, []);

  const playSequence = useCallback(async (seq) => {
    setIsPlaying(true);
    for (let i = 0; i < seq.length; i++) {
      await new Promise(r => setTimeout(r, 600));
      flashColor(seq[i]);
    }
    await new Promise(r => setTimeout(r, 400));
    setIsPlaying(false);
  }, [flashColor]);

  const nextRound = useCallback(() => {
    const next = COLORS[Math.floor(Math.random() * 4)].name;
    const newSeq = [...sequence, next];
    setSequence(newSeq);
    setPlayerSeq([]);
    playSequence(newSeq);
  }, [sequence, playSequence]);

  const startGame = () => {
    setSequence([]); setPlayerSeq([]); setGameOver(false); setScore(0); setStarted(true);
    const first = COLORS[Math.floor(Math.random() * 4)].name;
    setSequence([first]);
    setPlayerSeq([]);
    setTimeout(() => playSequence([first]), 500);
  };

  const handlePress = (colorName) => {
    if (isPlaying || gameOver) return;
    playSound("pop");
    flashColor(colorName);
    const newPlayerSeq = [...playerSeq, colorName];
    setPlayerSeq(newPlayerSeq);

    const idx = newPlayerSeq.length - 1;
    if (newPlayerSeq[idx] !== sequence[idx]) {
      setGameOver(true);
      playSound("wrong");
      if (score >= 10) { addXp(20); playGame("simon-says"); }
      return;
    }

    if (newPlayerSeq.length === sequence.length) {
      setScore(s => s + 1);
      playSound("correct");
      if (newPlayerSeq.length >= 15) {
        confetti({ particleCount: 150, spread: 80 });
        playSound("levelup");
        addXp(20); playGame("simon-says");
      }
      timeoutRef.current = setTimeout(() => nextRound(), 1000);
    }
  };

  useEffect(() => { return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); }; }, []);

  return (
    <div className="min-h-screen px-4 py-10">
      <div className="max-w-md mx-auto text-center relative">
        <div className="flex items-center justify-between mb-4">
          <Link href="/games" className="text-sm text-primary font-bold hover:underline inline-block">← Back to Games</Link>
          <button onClick={() => setShowHowToPlay(!showHowToPlay)} className="p-2 rounded-full bg-danger/20 text-danger hover:bg-danger/30 transition-colors">
            <Lightbulb size={20} />
          </button>
        </div>

        {showHowToPlay && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 bg-danger/10 p-4 rounded-2xl border border-danger/30 text-left relative">
            <button onClick={() => setShowHowToPlay(false)} className="absolute top-2 right-2 text-danger hover:text-orange"><XCircle size={16}/></button>
            <h3 className="font-bold text-danger flex items-center gap-2 mb-1"><Lightbulb size={16}/> How to Play</h3>
            <p className="text-sm text-[var(--muted)]">Watch the colors flash and remember the sequence. When it&apos;s your turn, tap the colors in the exact same order! Each round adds one more color to remember.</p>
          </motion.div>
        )}

        <h1 className="text-3xl font-black mb-2">🎵 Simon Says</h1>
        <p className="text-[var(--muted)] mb-2">Watch the pattern and repeat it!</p>
        <p className="text-lg font-bold text-primary mb-6">Score: {score}</p>

        <div className="grid grid-cols-2 gap-4 max-w-[280px] mx-auto mb-8">
          {COLORS.map(c => (
            <motion.button key={c.name} whileTap={{ scale: 0.9 }} onClick={() => handlePress(c.name)}
              disabled={isPlaying || gameOver || !started}
              className={`aspect-square rounded-2xl transition-all duration-200 border-2 border-[var(--border-color)] ${activeColor === c.name ? c.bg + ' scale-95 shadow-lg' : c.active} ${isPlaying || !started ? 'opacity-60' : 'hover:opacity-80'}`}
            />
          ))}
        </div>

        {gameOver && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="mb-6">
            <p className="text-2xl font-black text-danger mb-2">Game Over!</p>
            <p className="text-[var(--muted)]">You reached level {score}!</p>
          </motion.div>
        )}

        <button onClick={startGame} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-bold">
          {started ? "Restart" : "Start Game"}
        </button>
      </div>
    </div>
  );
}
