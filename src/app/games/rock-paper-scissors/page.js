"use client";
/* eslint-disable react-hooks/purity */
import { useState } from "react";
import { motion } from "framer-motion";
import { useSound } from "@/contexts/SoundContext";
import { useGame } from "@/contexts/GameContext";
import { Lightbulb, XCircle } from "lucide-react";
import Link from "next/link";
import confetti from "canvas-confetti";

const choices = [
  { name: "Rock", emoji: "🪨" },
  { name: "Paper", emoji: "📄" },
  { name: "Scissors", emoji: "✂️" },
];

export default function RPSPage() {
  const { playSound } = useSound();
  const { addXp, playGame } = useGame();
  const [playerChoice, setPlayerChoice] = useState(null);
  const [cpuChoice, setCpuChoice] = useState(null);
  const [result, setResult] = useState(null);
  const [scores, setScores] = useState({ player: 0, cpu: 0 });
  const [showHowToPlay, setShowHowToPlay] = useState(false);

  const play = (choice) => {
    playSound("pop");
    const cpu = choices[Math.floor(Math.random() * 3)];
    setPlayerChoice(choice);
    setCpuChoice(cpu);

    let res;
    if (choice.name === cpu.name) res = "tie";
    else if (
      (choice.name === "Rock" && cpu.name === "Scissors") ||
      (choice.name === "Paper" && cpu.name === "Rock") ||
      (choice.name === "Scissors" && cpu.name === "Paper")
    ) {
      res = "win";
      setScores(s => ({ ...s, player: s.player + 1 }));
      playSound("correct");
      if (scores.player + 1 === 5) {
        confetti({ particleCount: 100, spread: 70 });
        playSound("levelup");
        addXp(5);
        playGame("rock-paper-scissors");
      }
    } else {
      res = "lose";
      setScores(s => ({ ...s, cpu: s.cpu + 1 }));
      playSound("wrong");
    }
    setResult(res);
  };

  const reset = () => {
    setPlayerChoice(null); setCpuChoice(null); setResult(null);
    setScores({ player: 0, cpu: 0 });
  };

  return (
    <div className="min-h-screen px-4 py-10">
      <div className="max-w-md mx-auto text-center relative">
        <div className="flex items-center justify-between mb-4">
          <Link href="/games" className="text-sm text-primary font-bold hover:underline inline-block">← Back to Games</Link>
          <button onClick={() => setShowHowToPlay(!showHowToPlay)} className="p-2 rounded-full bg-accent/20 text-accent hover:bg-accent/30 transition-colors">
            <Lightbulb size={20} />
          </button>
        </div>

        {showHowToPlay && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 bg-accent/10 p-4 rounded-2xl border border-accent/30 text-left relative">
            <button onClick={() => setShowHowToPlay(false)} className="absolute top-2 right-2 text-accent hover:text-orange"><XCircle size={16}/></button>
            <h3 className="font-bold text-accent flex items-center gap-2 mb-1"><Lightbulb size={16}/> How to Play</h3>
            <p className="text-sm text-[var(--muted)]">Choose Rock 🪨, Paper 📄, or Scissors ✂️ to beat the computer. Rock beats Scissors, Scissors beats Paper, and Paper beats Rock. The first player to reach 5 points wins!</p>
          </motion.div>
        )}

        <h1 className="text-3xl font-black mb-2">✊ Rock Paper Scissors</h1>
        <p className="text-[var(--muted)] mb-6">First to 5 wins!</p>

        <div className="flex justify-center gap-8 mb-6 text-sm font-bold">
          <div className="text-center">
            <p className="text-[var(--muted)]">You</p>
            <p className="text-3xl font-black text-primary">{scores.player}</p>
          </div>
          <div className="text-center">
            <p className="text-[var(--muted)]">CPU</p>
            <p className="text-3xl font-black text-danger">{scores.cpu}</p>
          </div>
        </div>

        {playerChoice && cpuChoice && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex justify-center items-center gap-8 mb-6">
            <div className="text-center">
              <motion.span className="text-5xl block mb-2" initial={{ x: -50 }} animate={{ x: 0 }}>{playerChoice.emoji}</motion.span>
              <p className="text-xs font-bold">{playerChoice.name}</p>
            </div>
            <span className="text-2xl font-black text-[var(--muted)]">VS</span>
            <div className="text-center">
              <motion.span className="text-5xl block mb-2" initial={{ x: 50 }} animate={{ x: 0 }}>{cpuChoice.emoji}</motion.span>
              <p className="text-xs font-bold">{cpuChoice.name}</p>
            </div>
          </motion.div>
        )}

        {result && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`text-xl font-black mb-6 ${result === 'win' ? 'text-secondary' : result === 'lose' ? 'text-danger' : 'text-accent-dark'}`}>
            {result === "win" ? "You Win! 🎉" : result === "lose" ? "You Lose! 😅" : "It's a Tie! 🤝"}
          </motion.p>
        )}

        <div className="flex justify-center gap-4 mb-6">
          {choices.map(c => (
            <motion.button key={c.name} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => play(c)}
              className="w-20 h-20 rounded-2xl bg-[var(--surface)] border-2 border-[var(--border-color)] hover:border-primary text-3xl flex items-center justify-center transition-colors">
              {c.emoji}
            </motion.button>
          ))}
        </div>

        <button onClick={reset} className="text-sm text-primary font-bold hover:underline">Reset Scores</button>
      </div>
    </div>
  );
}
