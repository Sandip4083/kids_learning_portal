"use client";
/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { useSound } from "@/contexts/SoundContext";
import { useGame } from "@/contexts/GameContext";
import { Lightbulb, XCircle } from "lucide-react";
import Link from "next/link";
import confetti from "canvas-confetti";

const WORDS = ["APPLE", "BRAIN", "CLOUD", "EARTH", "FLAME", "GRAPE", "HEART", "LIGHT"];
const GRID_SIZE = 10;

function generateGrid(words) {
  const grid = Array.from({ length: GRID_SIZE }, () => Array.from({ length: GRID_SIZE }, () => ""));
  const placed = [];

  words.forEach(word => {
    let attempts = 0;
    while (attempts < 50) {
      const dir = Math.random() > 0.5 ? "h" : "v";
      const r = Math.floor(Math.random() * (dir === "v" ? GRID_SIZE - word.length : GRID_SIZE));
      const c = Math.floor(Math.random() * (dir === "h" ? GRID_SIZE - word.length : GRID_SIZE));
      let canPlace = true;
      for (let i = 0; i < word.length; i++) {
        const cr = dir === "v" ? r + i : r;
        const cc = dir === "h" ? c + i : c;
        if (grid[cr][cc] !== "" && grid[cr][cc] !== word[i]) { canPlace = false; break; }
      }
      if (canPlace) {
        for (let i = 0; i < word.length; i++) {
          const cr = dir === "v" ? r + i : r;
          const cc = dir === "h" ? c + i : c;
          grid[cr][cc] = word[i];
        }
        placed.push(word);
        break;
      }
      attempts++;
    }
  });

  for (let r = 0; r < GRID_SIZE; r++)
    for (let c = 0; c < GRID_SIZE; c++)
      if (grid[r][c] === "") grid[r][c] = String.fromCharCode(65 + Math.floor(Math.random() * 26));

  return { grid, placed };
}

export default function WordSearchPage() {
  const { playSound } = useSound();
  const { addXp, playGame } = useGame();
  const [gridData, setGridData] = useState(null);
  const [found, setFound] = useState([]);
  const [selecting, setSelecting] = useState([]);
  const [showHowToPlay, setShowHowToPlay] = useState(false);

  const initGame = useCallback(() => {
    setGridData(generateGrid(WORDS));
    setFound([]); setSelecting([]); setShowHowToPlay(false);
  }, []);

  useEffect(() => { initGame(); }, [initGame]);

  if (!gridData) return null;

  const toggleCell = (r, c) => {
    playSound("pop");
    const key = `${r}-${c}`;
    const newSel = selecting.includes(key) ? selecting.filter(k => k !== key) : [...selecting, key];
    setSelecting(newSel);

    // Check if selection forms a word
    const letters = newSel.map(k => { const [rr, cc] = k.split("-").map(Number); return gridData.grid[rr][cc]; }).join("");
    const reversed = letters.split("").reverse().join("");
    const matchedWord = gridData.placed.find(w => (w === letters || w === reversed) && !found.includes(w));
    if (matchedWord) {
      setFound(f => [...f, matchedWord]);
      setSelecting([]);
      playSound("correct");
      if (found.length + 1 === gridData.placed.length) {
        confetti({ particleCount: 100, spread: 70 });
        playSound("levelup");
        addXp(15); playGame("word-search");
      }
    }
  };

  const done = found.length === gridData.placed.length;

  return (
    <div className="min-h-screen px-4 py-10">
      <div className="max-w-lg mx-auto text-center relative">
        <div className="flex items-center justify-between mb-4">
          <Link href="/games" className="text-sm text-primary font-bold hover:underline inline-block">← Back to Games</Link>
          <button onClick={() => setShowHowToPlay(!showHowToPlay)} className="p-2 rounded-full bg-sky/20 text-sky-dark hover:bg-sky/30 transition-colors">
            <Lightbulb size={20} />
          </button>
        </div>

        {showHowToPlay && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 bg-sky/10 p-4 rounded-2xl border border-sky/30 text-left relative">
            <button onClick={() => setShowHowToPlay(false)} className="absolute top-2 right-2 text-sky-dark hover:text-orange"><XCircle size={16}/></button>
            <h3 className="font-bold text-sky-dark flex items-center gap-2 mb-1"><Lightbulb size={16}/> How to Play</h3>
            <p className="text-sm text-[var(--muted)]">Tap letters one by one to form the hidden words. Words can go horizontally or vertically! Find all {gridData.placed.length} words to win.</p>
          </motion.div>
        )}

        <h1 className="text-3xl font-black mb-2">🔍 Word Search</h1>
        <p className="text-[var(--muted)] mb-4">Find all {gridData.placed.length} words! Tap letters to select.</p>

        <div className="flex flex-wrap justify-center gap-2 mb-4">
          {gridData.placed.map(w => (
            <span key={w} className={`px-3 py-1 rounded-full text-xs font-bold ${found.includes(w) ? 'bg-secondary/20 text-secondary line-through' : 'bg-[var(--surface-alt)]'}`}>
              {w}
            </span>
          ))}
        </div>

        <div className="inline-grid gap-1 mb-6" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}>
          {gridData.grid.map((row, r) => row.map((cell, c) => {
            const key = `${r}-${c}`;
            const isSel = selecting.includes(key);
            return (
              <motion.button key={key} whileTap={{ scale: 0.85 }} onClick={() => toggleCell(r, c)}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center transition-all ${
                  isSel ? 'bg-primary text-white' : 'bg-[var(--surface)] border border-[var(--border-color)] hover:bg-primary/10'
                }`}>
                {cell}
              </motion.button>
            );
          }))}
        </div>

        {selecting.length > 0 && (
          <button onClick={() => setSelecting([])} className="text-sm text-danger font-bold hover:underline mb-4 block mx-auto">Clear Selection</button>
        )}

        {done && <p className="text-2xl font-black text-secondary mb-4">🎉 All words found!</p>}

        <button onClick={initGame} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-bold">
          New Puzzle
        </button>
      </div>
    </div>
  );
}
