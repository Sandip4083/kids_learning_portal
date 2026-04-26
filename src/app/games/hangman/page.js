"use client";
/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { useSound } from "@/contexts/SoundContext";
import { useGame } from "@/contexts/GameContext";
import Link from "next/link";
import confetti from "canvas-confetti";

const words = [
  { word: "ELEPHANT", hint: "A large animal with a trunk" },
  { word: "BUTTERFLY", hint: "An insect with colorful wings" },
  { word: "RAINBOW", hint: "A colorful arc in the sky" },
  { word: "GIRAFFE", hint: "An animal with a long neck" },
  { word: "PENGUIN", hint: "A bird that can't fly but swims" },
  { word: "VOLCANO", hint: "Erupts with lava and ash" },
  { word: "UMBRELLA", hint: "Protects you from rain" },
  { word: "KANGAROO", hint: "An animal that hops and has a pouch" },
  { word: "OCEAN", hint: "A vast body of saltwater" },
  { word: "PLANET", hint: "Earth is one of these" },
  { word: "ASTRONAUT", hint: "A person who travels to space" },
  { word: "DINOSAUR", hint: "Extinct reptiles from millions of years ago" },
  { word: "COMPUTER", hint: "An electronic device for processing data" },
  { word: "CHOCOLATE", hint: "A sweet brown treat" },
  { word: "MOUNTAIN", hint: "A very tall landform" }
];

import { Lightbulb, XCircle } from "lucide-react";

export default function HangmanPage() {
  const { playSound } = useSound();
  const { addXp, playGame } = useGame();
  const [wordObj, setWordObj] = useState(null);
  const [guessed, setGuessed] = useState([]);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showWordHint, setShowWordHint] = useState(false);
  const maxWrong = 6;

  const initGame = useCallback(() => {
    setWordObj(words[Math.floor(Math.random() * words.length)]);
    setGuessed([]); setShowWordHint(false); setShowHowToPlay(false);
  }, []);

  useEffect(() => { initGame(); }, [initGame]);

  if (!wordObj) return null;

  const word = wordObj.word;
  const wrongGuesses = guessed.filter(l => !word.includes(l));
  const won = word.split("").every(l => guessed.includes(l));
  const lost = wrongGuesses.length >= maxWrong;

  const guess = (letter) => {
    if (guessed.includes(letter) || won || lost) return;
    setGuessed(g => [...g, letter]);
    if (word.includes(letter)) { playSound("correct"); }
    else { playSound("wrong"); }

    const newGuessed = [...guessed, letter];
    const newWon = word.split("").every(l => newGuessed.includes(l));
    const newLost = newGuessed.filter(l => !word.includes(l)).length >= maxWrong;
    if (newWon) { confetti({ particleCount: 100, spread: 70 }); playSound("levelup"); addXp(15); playGame("hangman"); }
  };

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  return (
    <div className="min-h-screen px-4 py-10">
      <div className="max-w-lg mx-auto text-center relative">
        <div className="flex items-center justify-between mb-4">
          <Link href="/games" className="text-sm text-primary font-bold hover:underline inline-block">← Back to Games</Link>
          <button onClick={() => setShowHowToPlay(!showHowToPlay)} className="p-2 rounded-full bg-secondary/20 text-secondary hover:bg-secondary/30 transition-colors">
            <Lightbulb size={20} />
          </button>
        </div>

        {showHowToPlay && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 bg-secondary/10 p-4 rounded-2xl border border-secondary/30 text-left relative">
            <button onClick={() => setShowHowToPlay(false)} className="absolute top-2 right-2 text-secondary hover:text-orange"><XCircle size={16}/></button>
            <h3 className="font-bold text-secondary flex items-center gap-2 mb-1"><Lightbulb size={16}/> How to Play</h3>
            <p className="text-sm text-[var(--muted)]">Guess the secret word by selecting letters. Be careful, every wrong letter costs you a life! You only have 6 lives.</p>
          </motion.div>
        )}

        <h1 className="text-3xl font-black mb-2">🔤 Hangman</h1>

        {/* Wrong count */}
        <div className="flex justify-center gap-1 mb-4">
          {Array.from({ length: maxWrong }).map((_, i) => (
            <div key={i} className={`w-4 h-4 rounded-full transition-colors ${i < wrongGuesses.length ? 'bg-danger' : 'bg-[var(--surface-alt)]'}`} />
          ))}
        </div>

        {/* Word display */}
        <div className="flex justify-center gap-2 mb-6 flex-wrap">
          {word.split("").map((letter, i) => (
            <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.05 }}
              className="w-10 h-12 rounded-xl bg-[var(--surface)] border-2 border-[var(--border-color)] flex items-center justify-center text-xl font-black">
              {guessed.includes(letter) || lost ? letter : ""}
            </motion.div>
          ))}
        </div>

        {/* Hint */}
        {showWordHint && <p className="text-sm text-sky-dark mb-4 font-semibold">💡 Hint: {wordObj.hint}</p>}
        {!showWordHint && !won && !lost && (
          <button onClick={() => setShowWordHint(true)} className="text-sm text-primary font-bold mb-4 hover:underline">Reveal Word Hint</button>
        )}

        {/* Result */}
        {(won || lost) && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="mb-6 p-4 rounded-2xl bg-[var(--surface)]">
            <p className="text-2xl font-black">{won ? "🎉 You Won!" : `😞 The word was "${word}"`}</p>
          </motion.div>
        )}

        {/* Keyboard */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {alphabet.map(letter => {
            const isGuessed = guessed.includes(letter);
            const isCorrect = isGuessed && word.includes(letter);
            const isWrong = isGuessed && !word.includes(letter);
            return (
              <motion.button key={letter} whileTap={{ scale: 0.9 }} onClick={() => guess(letter)} disabled={isGuessed || won || lost}
                className={`w-9 h-9 rounded-lg text-sm font-bold transition-all ${
                  isCorrect ? 'bg-secondary text-white' : isWrong ? 'bg-danger/20 text-danger' : 'bg-[var(--surface)] border border-[var(--border-color)] hover:bg-primary/10 hover:border-primary'
                } ${(isGuessed || won || lost) ? 'opacity-50 cursor-not-allowed' : ''}`}>
                {letter}
              </motion.button>
            );
          })}
        </div>

        <button onClick={initGame} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-bold">
          New Word
        </button>
      </div>
    </div>
  );
}
