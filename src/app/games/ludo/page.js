"use client";
/* eslint-disable react-hooks/refs */
import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { useSound } from "@/contexts/SoundContext";
import { useGame } from "@/contexts/GameContext";
import confetti from "canvas-confetti";
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6, RotateCcw, ArrowLeft, Users, Bot, Play, Lightbulb, XCircle } from "lucide-react";
import Link from "next/link";

// --- BOARD CONFIGURATION ---
const BOARD_SIZE = 52;
const HOME_STRETCH = 6;
const SAFE_CELLS = [0, 8, 13, 21, 26, 34, 39, 47];

// Standard 15x15 path mapping
const PATH_COORDS = [
  {x: 1, y: 6}, {x: 2, y: 6}, {x: 3, y: 6}, {x: 4, y: 6}, {x: 5, y: 6}, // 0-4
  {x: 6, y: 5}, {x: 6, y: 4}, {x: 6, y: 3}, {x: 6, y: 2}, {x: 6, y: 1}, {x: 6, y: 0}, // 5-10
  {x: 7, y: 0}, {x: 8, y: 0}, // 11-12
  {x: 8, y: 1}, {x: 8, y: 2}, {x: 8, y: 3}, {x: 8, y: 4}, {x: 8, y: 5}, // 13-17
  {x: 9, y: 6}, {x: 10, y: 6}, {x: 11, y: 6}, {x: 12, y: 6}, {x: 13, y: 6}, {x: 14, y: 6}, // 18-23
  {x: 14, y: 7}, {x: 14, y: 8}, // 24-25
  {x: 13, y: 8}, {x: 12, y: 8}, {x: 11, y: 8}, {x: 10, y: 8}, {x: 9, y: 8}, // 26-30
  {x: 8, y: 9}, {x: 8, y: 10}, {x: 8, y: 11}, {x: 8, y: 12}, {x: 8, y: 13}, {x: 8, y: 14}, // 31-36
  {x: 7, y: 14}, {x: 6, y: 14}, // 37-38
  {x: 6, y: 13}, {x: 6, y: 12}, {x: 6, y: 11}, {x: 6, y: 10}, {x: 6, y: 9}, // 39-43
  {x: 5, y: 8}, {x: 4, y: 8}, {x: 3, y: 8}, {x: 2, y: 8}, {x: 1, y: 8}, {x: 0, y: 8}, // 44-49
  {x: 0, y: 7}, {x: 0, y: 6} // 50-51
];

// eslint-disable-next-line no-unused-vars
const HOME_STRETCHES = {
  red: [{x: 1, y: 7}, {x: 2, y: 7}, {x: 3, y: 7}, {x: 4, y: 7}, {x: 5, y: 7}],
  green: [{x: 7, y: 1}, {x: 7, y: 2}, {x: 7, y: 3}, {x: 7, y: 4}, {x: 7, y: 5}],
  yellow: [{x: 13, y: 7}, {x: 12, y: 7}, {x: 11, y: 7}, {x: 10, y: 7}, {x: 9, y: 7}],
  blue: [{x: 7, y: 13}, {x: 7, y: 12}, {x: 7, y: 11}, {x: 7, y: 10}, {x: 7, y: 9}],
};

const COLORS = {
  red: { hex: "#E53935", startCell: 0, homeEntry: 50, name: "Red", order: 0 },
  green: { hex: "#4CAF50", startCell: 13, homeEntry: 11, name: "Green", order: 1 },
  yellow: { hex: "#FDD835", startCell: 26, homeEntry: 24, name: "Yellow", order: 2 },
  blue: { hex: "#2196F3", startCell: 39, homeEntry: 37, name: "Blue", order: 3 },
};

const DiceIcons = [null, Dice1, Dice2, Dice3, Dice4, Dice5, Dice6];

const INIT_PIECES = () => ({
  red: Array(4).fill(null).map((_, i) => ({ id: i, position: -1, homeStretch: -1, finished: false })),
  green: Array(4).fill(null).map((_, i) => ({ id: i, position: -1, homeStretch: -1, finished: false })),
  yellow: Array(4).fill(null).map((_, i) => ({ id: i, position: -1, homeStretch: -1, finished: false })),
  blue: Array(4).fill(null).map((_, i) => ({ id: i, position: -1, homeStretch: -1, finished: false })),
});

export default function LudoPage() {
  const { playSound } = useSound();
  const { addXp, playGame, visitSection } = useGame();

  // --- GAME STATE ---
  const [gameState, setGameState] = useState("setup"); // setup, playing, gameover
  const [playMode, setPlayMode] = useState("single"); // single, multi
  const [playerCount, setPlayerCount] = useState(2); // 2, 3, 4
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  
  const [activePlayers, setActivePlayers] = useState([]); // [{ color: 'red', isAI: false }]
  const [turnIndex, setTurnIndex] = useState(0);
  const [pieces, setPieces] = useState(INIT_PIECES());
  const piecesRef = useRef(pieces);
  const isMovingRef = useRef(false);

  useEffect(() => {
    piecesRef.current = pieces;
  }, [pieces]);
  
  const [diceValue, setDiceValue] = useState(null);
  const [rolling, setRolling] = useState(false);
  const [winner, setWinner] = useState(null);
  const [message, setMessage] = useState("");
  const [moveablePieces, setMoveablePieces] = useState([]);
  
  const computerTimeoutRef = useRef(null);

  useEffect(() => {
    visitSection("games");
    playGame("ludo");
    return () => clearTimeout(computerTimeoutRef.current);
  }, [visitSection, playGame]);


  // --- SETUP GAME ---
  const startGame = () => {
    playSound("click");
    let setupPlayers = [];
    if (playMode === "single") {
      setupPlayers = [
        { color: "red", isAI: false },
        { color: "yellow", isAI: true }
      ];
    } else {
      const colors = ["red", "green", "yellow", "blue"];
      setupPlayers = colors.slice(0, playerCount).map(c => ({ color: c, isAI: false }));
    }
    
    setActivePlayers(setupPlayers);
    setPieces(INIT_PIECES());
    setTurnIndex(0);
    setDiceValue(null);
    setWinner(null);
    setMoveablePieces([]);
    setMessage(`${COLORS[setupPlayers[0].color].name}'s Turn! Roll the dice 🎲`);
    setGameState("playing");
  };

  const nextTurn = useCallback((extraRoll = false) => {
    isMovingRef.current = false;
    setMoveablePieces([]);
    if (extraRoll) {
      setMessage(`Got a 6! Roll again 🎲`);
      setDiceValue(null);
      return;
    }
    setTurnIndex((prev) => {
      const next = (prev + 1) % activePlayers.length;
      const nextP = activePlayers[next];
      setMessage(`${COLORS[nextP.color].name}'s Turn! 🎲`);
      return next;
    });
    setDiceValue(null);
  }, [activePlayers]);

  const checkWin = useCallback((newPieces, color) => {
    if (newPieces[color].every((p) => p.finished)) {
      setGameState("gameover");
      setWinner(activePlayers.find(p => p.color === color));
      
      // XP reward logic
      if (!activePlayers.find(p => p.color === color).isAI) {
        addXp(25);
        confetti({ particleCount: 300, spread: 120, origin: { y: 0.6 } });
        playSound("levelup");
      }
      return true;
    }
    return false;
  }, [activePlayers, addXp, playSound]);

  const calculateMove = (piece, dice, color) => {
    if (piece.finished) return null;

    // Moving out of base
    if (piece.position === -1) {
      if (dice === 6) return { ...piece, position: COLORS[color].startCell };
      return null;
    }

    // Moving within home stretch
    if (piece.homeStretch >= 0) {
      const newHS = piece.homeStretch + dice;
      if (newHS === HOME_STRETCH) return { ...piece, homeStretch: newHS, finished: true };
      if (newHS < HOME_STRETCH) return { ...piece, homeStretch: newHS };
      return null;
    }

    // Moving on main path
    const newPos = (piece.position + dice) % BOARD_SIZE;
    const entry = COLORS[color].homeEntry;
    
    // Check if crossing into home stretch
    // We check distance to entry point
    const stepsFromEntry = (newPos - entry + BOARD_SIZE) % BOARD_SIZE;
    const stepsToEntry = (entry - piece.position + BOARD_SIZE) % BOARD_SIZE;

    // If steps to entry is less than or equal to dice roll, AND we aren't passing the start
    if (stepsToEntry <= dice && stepsToEntry > 0) {
      const remaining = dice - stepsToEntry;
      if (remaining <= HOME_STRETCH) {
        if (remaining === HOME_STRETCH) return { ...piece, position: entry, homeStretch: remaining, finished: true };
        return { ...piece, position: entry, homeStretch: remaining };
      }
      return null; // Requires exact roll to finish or move inside
    }

    return { ...piece, position: newPos };
  };

  const findMoveablePieces = useCallback((currentPieces, dice, color) => {
    return currentPieces[color]
      .map((p, i) => ({ index: i, result: calculateMove(p, dice, color) }))
      .filter((m) => m.result !== null);
  }, []);

  const executeMove = useCallback((color, pieceIndex, dice) => {
    if (isMovingRef.current) return;
    isMovingRef.current = true;
    
    const d = dice || diceValue;
    const currentPieces = piecesRef.current;
    const piece = currentPieces[color][pieceIndex];
    const result = calculateMove(piece, d, color);

    if (!result) return;

    const newPieces = { ...currentPieces };
    newPieces[color] = [...currentPieces[color]];
    newPieces[color][pieceIndex] = result;

    // Handle captures
    let captured = false;
    if (result.position >= 0 && result.homeStretch < 0 && !SAFE_CELLS.includes(result.position)) {
      activePlayers.forEach((ap) => {
        if (ap.color !== color) {
          newPieces[ap.color] = currentPieces[ap.color].map((op) => {
            if (op.position === result.position && op.homeStretch < 0 && !op.finished) {
              playSound("correct");
              captured = true;
              return { ...op, position: -1, homeStretch: -1 };
            }
            return op;
          });
        }
      });
    }

    setPieces(newPieces);

    if (result.finished) {
      playSound("levelup");
    } else if (!captured) {
      playSound("pop");
    }

    if (!checkWin(newPieces, color)) {
      // Extra roll on 6 or capture
      if (d === 6 || captured) {
        setTimeout(() => nextTurn(true), 600);
      } else {
        setTimeout(() => nextTurn(false), 600);
      }
    }

    setMoveablePieces([]);
  }, [diceValue, activePlayers, checkWin, playSound, nextTurn]);

  // --- COMPUTER LOGIC ---
  const triggerComputerTurn = useCallback((currentPlayerColor) => {
    if (rolling || winner || gameState !== "playing" || diceValue !== null || isMovingRef.current) return;
    isMovingRef.current = true;
    setRolling(true);
    playSound("click");

    let count = 0;
    const interval = setInterval(() => {
      setDiceValue(Math.floor(Math.random() * 6) + 1);
      count++;
      if (count >= 10) {
        clearInterval(interval);
        const finalDice = Math.floor(Math.random() * 6) + 1;
        setDiceValue(finalDice);
        setRolling(false);
        
        setTimeout(() => {
          const currentPieces = piecesRef.current;
          const moveable = findMoveablePieces(currentPieces, finalDice, currentPlayerColor);

          if (moveable.length === 0) {
            setTimeout(() => nextTurn(finalDice === 6), 1000);
            return;
          }

          let bestMove = moveable[0];
          for (const m of moveable) {
            if (m.result.finished) { bestMove = m; break; }
            if (m.result.position >= 0 && m.result.homeStretch < 0 && !SAFE_CELLS.includes(m.result.position)) {
              const canCapture = activePlayers.some(ap => 
                ap.color !== currentPlayerColor && 
                currentPieces[ap.color].some(op => op.position === m.result.position && op.homeStretch < 0)
              );
              if (canCapture) { bestMove = m; break; }
            }
            if (currentPieces[currentPlayerColor][m.index].position === -1 && m.result.position !== -1) {
              bestMove = m;
            }
          }

          // Apply move
          const result = bestMove.result;
          const newPieces = { ...currentPieces };
          newPieces[currentPlayerColor] = [...currentPieces[currentPlayerColor]];
          newPieces[currentPlayerColor][bestMove.index] = result;

          // Handle captures
          let captured = false;
          if (result.position >= 0 && result.homeStretch < 0 && !SAFE_CELLS.includes(result.position)) {
            activePlayers.forEach((ap) => {
              if (ap.color !== currentPlayerColor) {
                newPieces[ap.color] = currentPieces[ap.color].map((op) => {
                  if (op.position === result.position && op.homeStretch < 0 && !op.finished) {
                    playSound("correct");
                    captured = true;
                    return { ...op, position: -1, homeStretch: -1 };
                  }
                  return op;
                });
              }
            });
          }

          setPieces(newPieces);

          if (result.finished) {
            playSound("levelup");
          } else if (!captured) {
            playSound("pop");
          }

          if (!checkWin(newPieces, currentPlayerColor)) {
            if (finalDice === 6 || captured) {
              setTimeout(() => nextTurn(true), 600);
            } else {
              setTimeout(() => nextTurn(false), 600);
            }
          }

        }, 800);
      }
    }, 80);
  }, [rolling, winner, gameState, activePlayers, findMoveablePieces, checkWin, playSound, nextTurn, diceValue]);

  // Handle computer turns automatically
  useEffect(() => {
    if (gameState === "playing" && activePlayers.length > 0 && !winner) {
      const currentPlayer = activePlayers[turnIndex];
      if (currentPlayer.isAI && !rolling && moveablePieces.length === 0 && diceValue === null) {
        computerTimeoutRef.current = setTimeout(() => {
          triggerComputerTurn(currentPlayer.color);
        }, 1000);
      }
    }
    return () => clearTimeout(computerTimeoutRef.current);
  }, [turnIndex, gameState, activePlayers, rolling, moveablePieces, winner, triggerComputerTurn, diceValue]);

  const rollDice = () => {
    if (rolling || gameState !== "playing" || winner || activePlayers[turnIndex].isAI || moveablePieces.length > 0 || diceValue !== null || isMovingRef.current) return;
    isMovingRef.current = true;
    setRolling(true);
    playSound("click");

    let count = 0;
    const interval = setInterval(() => {
      setDiceValue(Math.floor(Math.random() * 6) + 1);
      count++;
      if (count >= 10) {
        clearInterval(interval);
        const finalDice = Math.floor(Math.random() * 6) + 1;
        setDiceValue(finalDice);
        setRolling(false);

        const currentPlayerColor = activePlayers[turnIndex].color;
        const currentPieces = piecesRef.current;
        const moveable = findMoveablePieces(currentPieces, finalDice, currentPlayerColor);
        
        if (moveable.length === 0) {
          setTimeout(() => nextTurn(finalDice === 6), 1200);
        } else if (moveable.length === 1 && currentPieces[currentPlayerColor][moveable[0].index].position !== -1) {
          // Auto move if only one option and it's not a base exit
          setTimeout(() => {
            isMovingRef.current = false; // Allow executeMove to run
            executeMove(currentPlayerColor, moveable[0].index, finalDice);
          }, 600);
        } else {
          setMoveablePieces(moveable.map((m) => m.index));
          setMessage("Choose a pin to move! 👆");
          isMovingRef.current = false; // Wait for user click
        }
      }
    }, 80);
  };

  const restart = () => {
    clearTimeout(computerTimeoutRef.current);
    isMovingRef.current = false;
    setGameState("setup");
    setPieces(INIT_PIECES());
    setDiceValue(null);
    setRolling(false);
    setWinner(null);
    setMoveablePieces([]);
    setMessage("");
    setTurnIndex(0);
  };

  const DiceIcon = diceValue ? DiceIcons[diceValue] : Dice1;

  // --- RENDERERS ---
  const renderSetup = () => (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md mx-auto bg-[var(--surface)] rounded-3xl border border-[var(--border-color)] p-8 text-center shadow-lg">
      <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-4">
        <Dice6 size={32} />
      </div>
      <h2 className="text-3xl font-black mb-6">Game Setup</h2>
      
      <div className="space-y-6 text-left">
        <div>
          <label className="text-sm font-bold text-[var(--muted)] mb-2 block">Select Mode</label>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => setPlayMode("single")} className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${playMode === "single" ? "border-primary bg-primary/5" : "border-[var(--border-color)]"}`}>
              <Bot size={24} className={playMode === "single" ? "text-primary" : "text-[var(--muted)]"} />
              <span className={`font-bold ${playMode === "single" ? "text-primary" : ""}`}>vs Computer</span>
            </button>
            <button onClick={() => setPlayMode("multi")} className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${playMode === "multi" ? "border-primary bg-primary/5" : "border-[var(--border-color)]"}`}>
              <Users size={24} className={playMode === "multi" ? "text-primary" : "text-[var(--muted)]"} />
              <span className={`font-bold ${playMode === "multi" ? "text-primary" : ""}`}>With Friends</span>
            </button>
          </div>
        </div>

        {playMode === "multi" && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
            <label className="text-sm font-bold text-[var(--muted)] mb-2 block">Number of Players</label>
            <div className="flex gap-3">
              {[2, 3, 4].map(num => (
                <button key={num} onClick={() => setPlayerCount(num)} className={`flex-1 py-3 rounded-xl border-2 font-black transition-all ${playerCount === num ? "border-primary bg-primary text-white" : "border-[var(--border-color)]"}`}>
                  {num}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      <button onClick={startGame} className="w-full mt-8 py-4 rounded-2xl bg-gradient-to-r from-primary to-pink text-white font-black text-lg shadow-lg hover:shadow-xl transition-all touch-target flex items-center justify-center gap-2">
        <Play size={20} fill="currentColor" /> Start Game
      </button>
    </motion.div>
  );

  const renderBoard = () => {
    // We render a 15x15 CSS Grid.
    return (
      <div className="relative w-full max-w-[500px] aspect-square mx-auto bg-white border border-gray-300 rounded-md shadow-2xl p-1 sm:p-2">
        <div className="w-full h-full grid grid-cols-[repeat(15,minmax(0,1fr))] grid-rows-[repeat(15,minmax(0,1fr))] gap-0 border border-gray-300">
          
          {/* Base Red (Top-Left) */}
          <div className="col-start-1 col-end-7 row-start-1 row-end-7 bg-[#E53935] flex items-center justify-center p-[15%]">
            <div className="w-full h-full bg-white rounded-lg sm:rounded-xl relative grid grid-cols-2 grid-rows-2 p-[15%] gap-[15%]">
              {pieces.red.map((p, i) => (
                <div key={`red-base-${i}`} className="w-full h-full flex items-center justify-center">
                  {p.position === -1 && !p.finished && (
                    <motion.div layoutId={`piece-red-${i}`} className={`w-[80%] aspect-square rounded-full border-[3px] border-white shadow-md bg-[#E53935] ${moveablePieces.includes(i) && activePlayers[turnIndex].color === 'red' ? 'animate-pulse ring-4 ring-primary' : ''}`} onClick={() => { if(moveablePieces.includes(i) && activePlayers[turnIndex].color === 'red') executeMove('red', i, diceValue); }} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Base Green (Top-Right) */}
          <div className="col-start-10 col-end-16 row-start-1 row-end-7 bg-[#4CAF50] flex items-center justify-center p-[15%]">
            <div className="w-full h-full bg-white rounded-lg sm:rounded-xl relative grid grid-cols-2 grid-rows-2 p-[15%] gap-[15%]">
              {pieces.green.map((p, i) => (
                <div key={`green-base-${i}`} className="w-full h-full flex items-center justify-center">
                  {p.position === -1 && !p.finished && (
                    <motion.div layoutId={`piece-green-${i}`} className={`w-[80%] aspect-square rounded-full border-[3px] border-white shadow-md bg-[#4CAF50] ${moveablePieces.includes(i) && activePlayers[turnIndex].color === 'green' ? 'animate-pulse ring-4 ring-primary' : ''}`} onClick={() => { if(moveablePieces.includes(i) && activePlayers[turnIndex].color === 'green') executeMove('green', i, diceValue); }} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Base Blue (Bottom-Left) */}
          <div className="col-start-1 col-end-7 row-start-10 row-end-16 bg-[#2196F3] flex items-center justify-center p-[15%]">
            <div className="w-full h-full bg-white rounded-lg sm:rounded-xl relative grid grid-cols-2 grid-rows-2 p-[15%] gap-[15%]">
              {pieces.blue.map((p, i) => (
                <div key={`blue-base-${i}`} className="w-full h-full flex items-center justify-center">
                  {p.position === -1 && !p.finished && (
                    <motion.div layoutId={`piece-blue-${i}`} className={`w-[80%] aspect-square rounded-full border-[3px] border-white shadow-md bg-[#2196F3] ${moveablePieces.includes(i) && activePlayers[turnIndex].color === 'blue' ? 'animate-pulse ring-4 ring-primary' : ''}`} onClick={() => { if(moveablePieces.includes(i) && activePlayers[turnIndex].color === 'blue') executeMove('blue', i, diceValue); }} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Base Yellow (Bottom-Right) */}
          <div className="col-start-10 col-end-16 row-start-10 row-end-16 bg-[#FDD835] flex items-center justify-center p-[15%]">
            <div className="w-full h-full bg-white rounded-lg sm:rounded-xl relative grid grid-cols-2 grid-rows-2 p-[15%] gap-[15%]">
              {pieces.yellow.map((p, i) => (
                <div key={`yellow-base-${i}`} className="w-full h-full flex items-center justify-center">
                  {p.position === -1 && !p.finished && (
                    <motion.div layoutId={`piece-yellow-${i}`} className={`w-[80%] aspect-square rounded-full border-[3px] border-white shadow-md bg-[#FDD835] ${moveablePieces.includes(i) && activePlayers[turnIndex].color === 'yellow' ? 'animate-pulse ring-4 ring-primary' : ''}`} onClick={() => { if(moveablePieces.includes(i) && activePlayers[turnIndex].color === 'yellow') executeMove('yellow', i, diceValue); }} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Center Home */}
          <div className="col-start-7 col-end-10 row-start-7 row-end-10 relative overflow-hidden">
            <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
              <polygon points="0,0 50,50 0,100" fill="#E53935" stroke="#ccc" strokeWidth="1" />
              <polygon points="0,0 100,0 50,50" fill="#4CAF50" stroke="#ccc" strokeWidth="1" />
              <polygon points="100,0 100,100 50,50" fill="#FDD835" stroke="#ccc" strokeWidth="1" />
              <polygon points="0,100 100,100 50,50" fill="#2196F3" stroke="#ccc" strokeWidth="1" />
            </svg>
          </div>

          {/* Path Cells mapping */}
          {Array.from({ length: 15 }).map((_, y) => 
            Array.from({ length: 15 }).map((_, x) => {
              // Skip bases and center
              if ((x < 6 && y < 6) || (x > 8 && y < 6) || (x < 6 && y > 8) || (x > 8 && y > 8) || (x >= 6 && x <= 8 && y >= 6 && y <= 8)) return null;

              const pathIdx = PATH_COORDS.findIndex(c => c.x === x && c.y === y);
              let isSafe = false, bgColor = "bg-white", isArrow = false, arrowDir = "";

              // Safe spots and starting colored cells
              if (pathIdx === COLORS.red.startCell) { bgColor = "bg-[#E53935]"; isSafe = true; }
              else if (pathIdx === COLORS.green.startCell) { bgColor = "bg-[#4CAF50]"; isSafe = true; }
              else if (pathIdx === COLORS.yellow.startCell) { bgColor = "bg-[#FDD835]"; isSafe = true; }
              else if (pathIdx === COLORS.blue.startCell) { bgColor = "bg-[#2196F3]"; isSafe = true; }
              else if (pathIdx !== -1 && SAFE_CELLS.includes(pathIdx)) { isSafe = true; }

              // Arrows
              if (x === 0 && y === 7) { isArrow = true; arrowDir = "→"; }
              if (x === 7 && y === 0) { isArrow = true; arrowDir = "↓"; }
              if (x === 14 && y === 7) { isArrow = true; arrowDir = "←"; }
              if (x === 7 && y === 14) { isArrow = true; arrowDir = "↑"; }

              // Home Stretches
              let hsCol = "";
              let hsIdx = -1;
              if (y === 7 && x >= 1 && x <= 5) { bgColor = "bg-[#E53935]"; hsCol = "red"; hsIdx = x - 1; }
              if (x === 7 && y >= 1 && y <= 5) { bgColor = "bg-[#4CAF50]"; hsCol = "green"; hsIdx = y - 1; }
              if (y === 7 && x >= 9 && x <= 13) { bgColor = "bg-[#FDD835]"; hsCol = "yellow"; hsIdx = 13 - x; }
              if (x === 7 && y >= 9 && y <= 13) { bgColor = "bg-[#2196F3]"; hsCol = "blue"; hsIdx = 13 - y; }

              // Gather pieces on this cell
              const pins = [];
              if (pathIdx !== -1) {
                ["red", "green", "yellow", "blue"].forEach(c => {
                  pieces[c].forEach(p => { if (p.position === pathIdx && p.homeStretch < 0 && !p.finished) pins.push({ color: c, p }); });
                });
              } else if (hsCol) {
                pieces[hsCol].forEach(p => { if (p.homeStretch === hsIdx && !p.finished) pins.push({ color: hsCol, p }); });
              }

              return (
                <div key={`cell-${x}-${y}`} className={`border border-gray-300 relative flex items-center justify-center ${bgColor}`} style={{ gridColumnStart: x + 1, gridRowStart: y + 1 }}>
                  {isSafe && pathIdx !== COLORS.red.startCell && pathIdx !== COLORS.green.startCell && pathIdx !== COLORS.yellow.startCell && pathIdx !== COLORS.blue.startCell && (
                    <span className="text-[10px] sm:text-lg text-black/20 font-black leading-none">⭐</span>
                  )}
                  {isArrow && <span className="text-black/30 font-black">{arrowDir}</span>}
                  
                  {/* Render Pins */}
                  {pins.map((pinObj, i) => (
                    <motion.div
                      key={`pin-${pinObj.color}-${pinObj.p.id}`}
                      layoutId={`piece-${pinObj.color}-${pinObj.p.id}`}
                      className={`absolute w-[60%] aspect-square rounded-full border-[2px] sm:border-[3px] border-white shadow-md z-10
                        ${moveablePieces.includes(pinObj.p.id) && activePlayers[turnIndex].color === pinObj.color ? 'animate-pulse ring-4 ring-primary' : ''}`}
                      style={{ 
                        backgroundColor: COLORS[pinObj.color].hex,
                        transform: pins.length > 1 ? `translate(${(i % 2 === 0 ? -1 : 1) * 20}%, ${(i < 2 ? -1 : 1) * 20}%) scale(0.8)` : 'none',
                      }}
                      onClick={() => {
                        if (moveablePieces.includes(pinObj.p.id) && activePlayers[turnIndex].color === pinObj.color) {
                          executeMove(pinObj.color, pinObj.p.id, diceValue);
                        }
                      }}
                    />
                  ))}
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen px-4 py-6 sm:py-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/games" className="p-2 rounded-xl bg-[var(--surface-alt)] hover:bg-primary/10 hover:text-primary transition-colors touch-target">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-3xl font-black">Classic Ludo</h1>
              <p className="text-[var(--muted)] text-sm">A timeless board game adventure</p>
            </div>
          </div>
          <button onClick={() => setShowHowToPlay(!showHowToPlay)} className="p-2 rounded-full bg-danger/20 text-danger hover:bg-danger/30 transition-colors shrink-0">
            <Lightbulb size={24} />
          </button>
        </div>

        {showHowToPlay && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 bg-danger/10 p-4 rounded-2xl border border-danger/30 text-left relative max-w-2xl mx-auto">
            <button onClick={() => setShowHowToPlay(false)} className="absolute top-2 right-2 text-danger hover:text-orange"><XCircle size={16}/></button>
            <h3 className="font-bold text-danger flex items-center gap-2 mb-1"><Lightbulb size={16}/> How to Play</h3>
            <p className="text-sm text-[var(--muted)]">Roll a 6 to move a piece out of the base! Race all 4 of your pieces around the board and into the center home. If you land on an opponent&apos;s piece, you capture it and send it back to their base! Safe spots have a ⭐.</p>
          </motion.div>
        )}

        {gameState === "setup" && renderSetup()}

        {gameState === "playing" && (
          <div className="flex flex-col xl:flex-row gap-8 items-center xl:items-start justify-center">
            
            {/* CLEAN CONTROL PANEL - LEFT/TOP */}
            <div className="w-full max-w-[500px] xl:max-w-[320px] flex flex-col gap-4">
              
              <div className="bg-[var(--surface)] rounded-3xl border border-[var(--border-color)] p-6 shadow-sm">
                <h3 className="font-black text-lg mb-4 flex items-center gap-2">
                  <Users size={20} className="text-primary" /> Active Players
                </h3>
                <div className="space-y-3">
                  {activePlayers.map((p, i) => (
                    <div key={p.color} className={`flex items-center justify-between p-3 rounded-2xl border-2 transition-all ${turnIndex === i ? 'border-primary bg-primary/5 shadow-sm' : 'border-transparent bg-[var(--surface-alt)] opacity-70'}`}>
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: COLORS[p.color].hex }} />
                        <div>
                          <p className="font-bold text-sm leading-none flex items-center gap-1">
                            {COLORS[p.color].name} {p.isAI && <Bot size={14} className="text-orange" />}
                          </p>
                          <p className="text-[10px] text-[var(--muted)] mt-1">{pieces[p.color].filter(pi => pi.finished).length}/4 home</p>
                        </div>
                      </div>
                      {turnIndex === i && (
                        <span className="flex h-3 w-3 relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[var(--surface)] rounded-3xl border border-[var(--border-color)] p-6 shadow-sm text-center">
                <p className={`font-black mb-4 min-h-[48px] flex items-center justify-center text-lg ${activePlayers[turnIndex].isAI ? 'text-orange' : 'text-primary'}`}>
                  {message}
                </p>
                <button
                  onClick={rollDice}
                  disabled={rolling || activePlayers[turnIndex].isAI || moveablePieces.length > 0 || diceValue !== null}
                  className={`w-full flex items-center justify-center gap-3 px-6 py-5 rounded-2xl font-black text-xl shadow-lg transition-all touch-target ${
                    !activePlayers[turnIndex].isAI && !rolling && moveablePieces.length === 0 && diceValue === null
                      ? "bg-gradient-to-r from-primary to-pink text-white hover:shadow-xl hover:-translate-y-1"
                      : "bg-[var(--surface-alt)] text-[var(--muted)] cursor-not-allowed"
                  }`}
                >
                  {rolling ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.3 }}>
                      <DiceIcon size={32} />
                    </motion.div>
                  ) : (
                    <DiceIcon size={32} />
                  )}
                  {diceValue ? `Rolled: ${diceValue}` : "Roll Dice"}
                </button>
              </div>

            </div>

            {/* BOARD - RIGHT/BOTTOM */}
            <div className="w-full max-w-[600px] shrink-0">
              {renderBoard()}
            </div>
          </div>
        )}

        {gameState === "gameover" && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md mx-auto bg-[var(--surface)] rounded-3xl border border-[var(--border-color)] p-8 text-center shadow-lg">
            <div className="text-7xl mb-4">{winner.isAI ? "🤖" : "🏆"}</div>
            <h2 className="text-3xl font-black mb-2">
              {winner.isAI ? "Computer Wins!" : `${COLORS[winner.color].name} Wins!`}
            </h2>
            <p className="text-[var(--muted)] mb-6">
              {!winner.isAI && playMode === "single"
                ? "Amazing! You earned 25 XP! 🎉"
                : "Great game! Want to play again? 💪"}
            </p>
            <div className="flex justify-center gap-3">
              <button onClick={restart} className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-gradient-to-r from-primary to-pink text-white font-bold touch-target">
                <RotateCcw size={18} /> New Game
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
