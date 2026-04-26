"use client";
/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useSound } from "@/contexts/SoundContext";
import { useGame } from "@/contexts/GameContext";
import { RotateCcw, Lightbulb, XCircle } from "lucide-react";
import Link from "next/link";
import confetti from "canvas-confetti";

const emojis = ["🍎","🍌","🍇","🍒","🍉","🍓","🥭","🍍"];

export default function MemoryMatchPage() {
  const { playSound } = useSound();
  const { addXp, playGame } = useGame();
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [showHint, setShowHint] = useState(false);

  const initGame = useCallback(() => {
    const shuffled = [...emojis, ...emojis].sort(() => Math.random() - 0.5).map((v, i) => ({ id: i, value: v }));
    setCards(shuffled); setFlipped([]); setMatched([]); setMoves(0);
  }, []);

  useEffect(() => { initGame(); }, [initGame]);

  const handleFlip = (id) => {
    if (flipped.length === 2 || flipped.includes(id) || matched.includes(id)) return;
    playSound("pop");
    const newFlipped = [...flipped, id];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      const [a, b] = newFlipped;
      if (cards[a].value === cards[b].value) {
        const newMatched = [...matched, a, b];
        setMatched(newMatched);
        setFlipped([]);
        playSound("correct");
        if (newMatched.length === cards.length) {
          confetti({ particleCount: 120, spread: 80 });
          playSound("levelup");
          addXp(15);
          playGame("memory-match");
        }
      } else {
        setTimeout(() => { setFlipped([]); playSound("wrong"); }, 800);
      }
    }
  };

  const done = matched.length === cards.length && cards.length > 0;

  return (
    <div className="min-h-screen px-4 py-10">
      <div className="max-w-lg mx-auto text-center relative">
        <div className="flex items-center justify-between mb-4">
          <Link href="/games" className="text-sm text-primary font-bold hover:underline inline-block">← Back to Games</Link>
          <button onClick={() => setShowHint(!showHint)} className="p-2 rounded-full bg-primary/20 text-primary hover:bg-primary/30 transition-colors">
            <Lightbulb size={20} />
          </button>
        </div>

        {showHint && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 bg-primary/10 p-4 rounded-2xl border border-primary/30 text-left relative">
            <button onClick={() => setShowHint(false)} className="absolute top-2 right-2 text-primary hover:text-orange"><XCircle size={16}/></button>
            <h3 className="font-bold text-primary flex items-center gap-2 mb-1"><Lightbulb size={16}/> How to Play</h3>
            <p className="text-sm text-[var(--muted)]">Tap on cards to flip them over. Try to remember where the fruits are and find all the matching pairs! Complete it in the fewest moves possible.</p>
          </motion.div>
        )}

        <h1 className="text-3xl font-black mb-2">🃏 Memory Match</h1>
        <p className="text-[var(--muted)] mb-4">{done ? `You won in ${moves} moves! 🎉` : `Moves: ${moves}`}</p>

        <div className="grid grid-cols-4 gap-3 mb-6">
          {cards.map((card) => {
            const isFlipped = flipped.includes(card.id) || matched.includes(card.id);
            return (
              <motion.button key={card.id} whileTap={{ scale: 0.9 }} onClick={() => handleFlip(card.id)}
                className={`aspect-square rounded-2xl text-2xl font-bold flex items-center justify-center border-2 transition-all duration-300 ${
                  matched.includes(card.id) ? 'bg-secondary/20 border-secondary' :
                  isFlipped ? 'bg-pink/20 border-pink' : 'bg-[var(--surface)] border-[var(--border-color)] hover:border-primary'
                }`}>
                <motion.span initial={false} animate={{ rotateY: isFlipped ? 0 : 180, opacity: isFlipped ? 1 : 0 }}>
                  {isFlipped ? card.value : ""}
                </motion.span>
                {!isFlipped && <span className="text-[var(--muted)]">?</span>}
              </motion.button>
            );
          })}
        </div>

        <button onClick={initGame} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-bold">
          <RotateCcw size={18} /> New Game
        </button>
      </div>
    </div>
  );
}
