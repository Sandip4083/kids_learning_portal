"use client";
import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { useSound } from "@/contexts/SoundContext";
import { useGame } from "@/contexts/GameContext";
import { RotateCcw, Lightbulb, XCircle } from "lucide-react";
import Link from "next/link";
import confetti from "canvas-confetti";

export default function TicTacToePage() {
  const { playSound } = useSound();
  const { addXp, playGame } = useGame();
  const [board, setBoard] = useState(Array(9).fill(""));
  const [currentPlayer, setCurrentPlayer] = useState("X");
  const [winner, setWinner] = useState(null);
  const [showHint, setShowHint] = useState(false);

  const checkWinner = useCallback((b) => {
    const winCombos = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    for (const [a, c, d] of winCombos) {
      if (b[a] && b[a] === b[c] && b[a] === b[d]) return b[a];
    }
    return b.every(cell => cell) ? "tie" : null;
  }, []);

  const makeMove = useCallback((i, player = currentPlayer, currentBoard = board) => {
    if (currentBoard[i] || winner) return;
    if (player === "X") playSound("pop");
    
    const newBoard = [...currentBoard];
    newBoard[i] = player;
    setBoard(newBoard);
    
    const w = checkWinner(newBoard);
    if (w) {
      setWinner(w);
      if (w !== "tie") {
        if (w === "X") {
          confetti({ particleCount: 100, spread: 70 });
          playSound("levelup");
          addXp(10);
        } else {
          playSound("wrong");
        }
      }
      playGame("tic-tac-toe");
    } else {
      setCurrentPlayer(player === "X" ? "O" : "X");
    }
    return newBoard;
  }, [board, winner, currentPlayer, checkWinner, playSound, addXp, playGame]);

  // AI Logic
  useEffect(() => {
    if (currentPlayer === "O" && !winner) {
      const timer = setTimeout(() => {
        // Smart AI: Try to win, then try to block, then pick random
        const emptyIndices = board.map((c, i) => c === "" ? i : null).filter(i => i !== null);
        if (emptyIndices.length > 0) {
          let move = null;
          // 1. Try to win
          for (let i of emptyIndices) {
            const testBoard = [...board];
            testBoard[i] = "O";
            if (checkWinner(testBoard) === "O") { move = i; break; }
          }
          // 2. Try to block
          if (move === null) {
            for (let i of emptyIndices) {
              const testBoard = [...board];
              testBoard[i] = "X";
              if (checkWinner(testBoard) === "X") { move = i; break; }
            }
          }
          // 3. Take center or random
          if (move === null) {
            if (board[4] === "") move = 4;
            else move = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
          }
          makeMove(move, "O", board);
          playSound("pop");
        }
      }, 600); // AI thinking delay
      return () => clearTimeout(timer);
    }
  }, [currentPlayer, winner, board, checkWinner, makeMove, playSound]);

  const reset = () => { setBoard(Array(9).fill("")); setCurrentPlayer("X"); setWinner(null); };

  const cellColors = { X: "bg-pink text-white", O: "bg-secondary text-white" };

  return (
    <div className="min-h-screen px-4 py-10">
      <div className="max-w-md mx-auto text-center relative">
        <div className="flex items-center justify-between mb-4">
          <Link href="/games" className="text-sm text-primary font-bold hover:underline inline-block">← Back to Games</Link>
          <button onClick={() => setShowHint(!showHint)} className="p-2 rounded-full bg-accent/20 text-accent hover:bg-accent/30 transition-colors">
            <Lightbulb size={20} />
          </button>
        </div>

        {showHint && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 bg-accent/10 p-4 rounded-2xl border border-accent/30 text-left relative">
            <button onClick={() => setShowHint(false)} className="absolute top-2 right-2 text-accent hover:text-orange"><XCircle size={16}/></button>
            <h3 className="font-bold text-accent flex items-center gap-2 mb-1"><Lightbulb size={16}/> How to Play</h3>
            <p className="text-sm text-[var(--muted)]">You are &apos;X&apos; and the Computer is &apos;O&apos;. Try to place 3 of your marks in a horizontal, vertical, or diagonal row to win!</p>
          </motion.div>
        )}

        <h1 className="text-3xl font-black mb-2">❌ Tic-Tac-Toe</h1>
        <p className="text-[var(--muted)] mb-6">
          {winner ? (winner === "tie" ? "It's a tie! 🤝" : `${winner} Wins! 🎉`) : (currentPlayer === "X" ? "Your turn (X)" : "Computer is thinking...")}
        </p>

        <div className="grid grid-cols-3 gap-3 max-w-[300px] mx-auto mb-6">
          {board.map((cell, i) => (
            <motion.button key={i} whileHover={!cell && !winner ? { scale: 1.05 } : {}} whileTap={!cell && !winner ? { scale: 0.95 } : {}}
              onClick={() => makeMove(i)}
              className={`aspect-square rounded-2xl text-3xl font-black flex items-center justify-center border-2 border-[var(--border-color)] transition-all ${cell ? cellColors[cell] : 'bg-[var(--surface)] hover:bg-[var(--surface-alt)]'}`}>
              {cell && <motion.span initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }}>{cell}</motion.span>}
            </motion.button>
          ))}
        </div>

        <button onClick={reset} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary-dark transition-colors">
          <RotateCcw size={18} /> Reset
        </button>
      </div>
    </div>
  );
}
