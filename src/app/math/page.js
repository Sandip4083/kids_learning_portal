"use client";
/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSound } from "@/contexts/SoundContext";
import { useGame } from "@/contexts/GameContext";
import { mathQuestions, mathCategories } from "@/data/mathQuestions";
import { selectAdaptiveQuestions, adjustDifficulty } from "@/lib/personalization";
import confetti from "canvas-confetti";
import { CheckCircle, XCircle, ArrowRight, RotateCcw, Trophy, Clock, Zap, Brain, TrendingUp, TrendingDown, Wand2, Sparkles, RefreshCw, Flame } from "lucide-react";
import Image from "next/image";

export default function MathPage() {
  const { playSound } = useSound();
  const { addXp, completeQuiz, visitSection, currentDifficulty, updateDifficulty, stopTimeTracking } = useGame();

  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [difficultyMessage, setDifficultyMessage] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState("all");
  const [isAIGenerated, setIsAIGenerated] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Gamification state
  const [combo, setCombo] = useState(0);
  const [mascotMessage, setMascotMessage] = useState("Let's solve some math!");
  const [shake, setShake] = useState(false);

  const difficulty = currentDifficulty?.math || "easy";

  const [questions, setQuestions] = useState(() => {
    return selectAdaptiveQuestions(mathQuestions, difficulty, 10);
  });

  useEffect(() => {
    visitSection("math");
    return () => stopTimeTracking();
  }, [visitSection, stopTimeTracking]);



  const handleTimeout = useCallback(() => {
    if (!showResult && !finished) {
      setAnswers((prev) => [
        ...prev,
        {
          question: questions[currentQ].question,
          selected: null,
          correct: questions[currentQ].answer,
          isCorrect: false,
          topic: questions[currentQ].topic,
          timedOut: true,
        },
      ]);
      playSound("wrong");
      setShowResult(true);
      setCombo(0);
      setMascotMessage("Time's up! Be faster next time!");
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  }, [currentQ, questions, showResult, finished, playSound]);

  // Timer
  useEffect(() => {
    if (finished || showResult) return;
    if (timeLeft <= 0) { handleTimeout(); return; }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, finished, showResult, handleTimeout]);

  const generateAIQuestions = (diff) => {
    const q = [];
    const ops = diff === "hard" ? ["+", "-", "*", "/"] : diff === "medium" ? ["+", "-", "*"] : ["+", "-"];
    
    for (let i = 0; i < 10; i++) {
      const op = ops[Math.floor(Math.random() * ops.length)];
      let a, b, answer, question;
      
      switch(op) {
        case "+":
          a = Math.floor(Math.random() * (diff === "hard" ? 100 : diff === "medium" ? 50 : 20)) + 1;
          b = Math.floor(Math.random() * (diff === "hard" ? 100 : diff === "medium" ? 50 : 20)) + 1;
          answer = a + b;
          question = `${a} + ${b} = ?`;
          break;
        case "-":
          a = Math.floor(Math.random() * (diff === "hard" ? 100 : diff === "medium" ? 50 : 20)) + 10;
          b = Math.floor(Math.random() * a) + 1;
          answer = a - b;
          question = `${a} - ${b} = ?`;
          break;
        case "*":
          a = Math.floor(Math.random() * (diff === "hard" ? 15 : 10)) + 2;
          b = Math.floor(Math.random() * (diff === "hard" ? 15 : 10)) + 2;
          answer = a * b;
          question = `${a} × ${b} = ?`;
          break;
        case "/":
          b = Math.floor(Math.random() * 10) + 2;
          answer = Math.floor(Math.random() * 12) + 2;
          a = b * answer;
          question = `${a} ÷ ${b} = ?`;
          break;
      }
      
      // Make questions more engaging by wrapping them in fun scenarios sometimes
      if (Math.random() > 0.6) {
         const entities = ["apples", "spaceships", "robots", "candies", "dinosaurs"];
         const entity = entities[Math.floor(Math.random() * entities.length)];
         if (op === "+") question = `If you have ${a} ${entity} and find ${b} more, how many ${entity} do you have?`;
         if (op === "-") question = `You have ${a} ${entity}. You give away ${b}. How many are left?`;
      }
      
      const options = new Set([answer]);
      while(options.size < 4) {
        const offset = Math.floor(Math.random() * 10) + 1;
        const wrong = Math.random() > 0.5 ? answer + offset : answer - offset;
        if (wrong >= 0) options.add(wrong);
      }
      
      q.push({
        id: `ai_${i}`,
        topic: "AI Generated",
        difficulty: diff,
        question: question,
        options: Array.from(options).sort(() => Math.random() - 0.5).map(String),
        answer: String(answer)
      });
    }
    return q;
  };

  const handleSelect = (option) => {
    if (showResult) return;
    setSelected(option);
    const isCorrect = option === questions[currentQ].answer;
    setShowResult(true);

    if (isCorrect) {
      const newCombo = combo + 1;
      setCombo(newCombo);
      setScore((s) => s + 1);
      playSound("correct");
      
      if (newCombo >= 3) {
        setMascotMessage("You're ON FIRE! 🔥");
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.8, x: 0.2 } });
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.8, x: 0.8 } });
      } else {
        const praises = ["Great job!", "Awesome!", "Correct!", "You're a star!"];
        // eslint-disable-next-line react-hooks/purity
        setMascotMessage(praises[Math.floor(Math.random() * praises.length)]);
        confetti({ particleCount: 30, spread: 40, origin: { y: 0.7 }, colors: ['#4ade80', '#3b82f6', '#f472b6'] });
      }
    } else {
      playSound("wrong");
      setCombo(0);
      setMascotMessage("Oops! Let's try the next one.");
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }

    setAnswers((prev) => [
      ...prev,
      {
        question: questions[currentQ].question,
        selected: option,
        correct: questions[currentQ].answer,
        isCorrect,
        topic: questions[currentQ].topic,
      },
    ]);
  };

  const handleNext = useCallback(() => {
    if (currentQ + 1 < questions.length) {
      setCurrentQ((q) => q + 1);
      setSelected(null);
      setShowResult(false);
      setTimeLeft(difficulty === "hard" ? 20 : difficulty === "medium" ? 25 : 30);
      if (combo >= 3) {
        setMascotMessage("Keep the streak alive!");
      } else {
        setMascotMessage("You got this!");
      }
    } else {
      setFinished(true);

      // Build topic details for granular tracking
      const topicDetails = answers.concat(showResult ? [] : [{
        topic: questions[currentQ]?.topic,
        isCorrect: false,
      }]).map((a) => ({
        topic: a.topic,
        correct: a.isCorrect,
      }));

      const finalScore = score;
      const comboBonus = combo > 2 ? combo * 5 : 0;
      addXp(finalScore * 10 + (difficulty === "hard" ? 20 : difficulty === "medium" ? 10 : 0) + comboBonus);
      completeQuiz("math", finalScore, questions.length, topicDetails);

      // Adaptive difficulty adjustment
      const result = adjustDifficulty(difficulty, finalScore, questions.length);
      if (result.changed) {
        updateDifficulty("math", result.newDifficulty);
        setDifficultyMessage(result.message);
      }

      if (finalScore >= 8) {
        confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
        playSound("levelup");
      }
    }
  }, [currentQ, questions, showResult, score, addXp, completeQuiz, playSound, difficulty, updateDifficulty, answers, combo]);

  const restart = () => {
    if (isAIGenerated) {
      setQuestions(generateAIQuestions(currentDifficulty?.math || "easy"));
    } else {
      const topicFiltered = selectedTopic === "all"
        ? mathQuestions
        : mathQuestions.filter((q) => q.topic === selectedTopic);
      const newQuestions = selectAdaptiveQuestions(
        topicFiltered.length >= 10 ? topicFiltered : mathQuestions,
        currentDifficulty?.math || "easy",
        10
      );
      setQuestions(newQuestions);
    }
    setCurrentQ(0);
    setSelected(null);
    setShowResult(false);
    setScore(0);
    setFinished(false);
    setAnswers([]);
    setTimeLeft(30);
    setDifficultyMessage(null);
    setCombo(0);
    setMascotMessage("Let's solve some math!");
  };

  const q = questions[currentQ];
  const progress = ((currentQ + (showResult ? 1 : 0)) / questions.length) * 100;

  const difficultyColors = {
    easy: "bg-secondary/10 text-secondary",
    medium: "bg-accent/10 text-accent-dark",
    hard: "bg-danger/10 text-danger",
  };

  return (
    <div className="min-h-screen relative overflow-hidden px-4 py-10 bg-gradient-to-b from-[var(--background)] to-purple-50/30 dark:to-purple-900/10">
      {/* Floating Background Math Symbols */}
      <div className="absolute inset-0 pointer-events-none opacity-10 dark:opacity-5 overflow-hidden">
        {['+', '-', '×', '÷', '=', '%', 'π', '∞'].map((sym, i) => (
          <motion.div
            key={i}
            className="absolute text-6xl font-black text-primary"
            initial={{ y: "100vh", x: `${(i * 27 + 13) % 100}vw`, rotate: 0 }}
            animate={{ 
              y: "-20vh", 
              rotate: 360,
              x: `${(i * 33 + 7) % 100}vw`
            }}
            transition={{ 
              duration: 15 + (i % 4) * 5, 
              repeat: Infinity, 
              ease: "linear",
              delay: i * 1.2
            }}
          >
            {sym}
          </motion.div>
        ))}
      </div>

      <div className="max-w-5xl mx-auto relative z-10 flex flex-col lg:flex-row gap-8 items-start">
        {/* Left Side: Mascot */}
        <div className="w-full lg:w-64 flex flex-col items-center shrink-0 order-2 lg:order-1 lg:sticky lg:top-24 mt-8 lg:mt-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={mascotMessage}
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-[var(--surface)] p-4 rounded-2xl shadow-lg border-2 border-primary/20 relative mb-4 text-center w-full max-w-[250px]"
            >
              <p className="font-bold text-sm md:text-base text-[var(--foreground)]">{mascotMessage}</p>
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-4 h-4 bg-[var(--surface)] border-b-2 border-r-2 border-primary/20 rotate-45"></div>
            </motion.div>
          </AnimatePresence>
          <motion.div 
            animate={{ y: [0, -10, 0] }} 
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            className="relative w-32 h-32 md:w-40 md:h-40"
          >
            <Image 
              src="/images/wise_owl.jpg" 
              alt="Max the Math Owl" 
              fill
              className="object-cover rounded-full shadow-xl border-4 border-primary/30"
            />
          </motion.div>
          
          {/* Combo Indicator */}
          <AnimatePresence>
            {combo > 1 && (
              <motion.div 
                initial={{ scale: 0, rotate: -10 }} 
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0 }}
                className="mt-6 flex items-center gap-2 bg-gradient-to-r from-orange-400 to-red-500 text-white px-5 py-2.5 rounded-full font-black shadow-lg"
              >
                <Flame size={20} className="animate-pulse" />
                {combo} COMBO!
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Side: Main Quiz Area */}
        <div className="flex-1 w-full max-w-2xl mx-auto order-1 lg:order-2">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6">
          <h1 className="text-4xl font-black mb-2">🧮 Math Quiz</h1>
          <p className="text-[var(--muted)]">Test your math skills with adaptive difficulty!</p>
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
            <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${difficultyColors[difficulty]}`}>
              <Brain size={12} className="inline mr-1" />
              {difficulty.toUpperCase()} MODE
            </span>
            <button
              onClick={() => {
                setIsGenerating(true);
                playSound("click");
                setTimeout(() => {
                  setQuestions(generateAIQuestions(difficulty));
                  setIsAIGenerated(true);
                  setCurrentQ(0);
                  setSelected(null);
                  setShowResult(false);
                  setScore(0);
                  setFinished(false);
                  setAnswers([]);
                  setTimeLeft(30);
                  setIsGenerating(false);
                }, 800);
              }}
              disabled={isGenerating}
              className="px-4 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-sm hover:shadow-md transition-all flex items-center gap-1 disabled:opacity-70"
            >
              {isGenerating ? <RefreshCw size={12} className="animate-spin" /> : <Sparkles size={12} />}
              Generate AI Quiz
            </button>
            {isAIGenerated && (
              <button
                onClick={() => {
                  setIsAIGenerated(false);
                  const topicFiltered = selectedTopic === "all" ? mathQuestions : mathQuestions.filter((q) => q.topic === selectedTopic);
                  setQuestions(selectAdaptiveQuestions(topicFiltered.length >= 10 ? topicFiltered : mathQuestions, difficulty, 10));
                  setCurrentQ(0);
                  setSelected(null);
                  setShowResult(false);
                  setScore(0);
                  setFinished(false);
                  setAnswers([]);
                  setTimeLeft(30);
                  playSound("click");
                }}
                className="px-4 py-1.5 rounded-full text-xs font-bold bg-[var(--surface)] border border-[var(--border-color)] text-[var(--muted)] hover:text-primary transition-all flex items-center gap-1"
              >
                Back to Standard
              </button>
            )}
          </div>
        </motion.div>

        {/* Topic Filter (before quiz starts or when restarting) */}
        {!finished && currentQ === 0 && !showResult && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
            <div className="flex flex-wrap justify-center gap-2">
              {mathCategories.slice(0, 8).map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedTopic(cat.id);
                    const topicFiltered = cat.id === "all"
                      ? mathQuestions
                      : mathQuestions.filter((q) => q.topic === cat.id);
                    setQuestions(
                      selectAdaptiveQuestions(
                        topicFiltered.length >= 5 ? topicFiltered : mathQuestions,
                        difficulty,
                        10
                      )
                    );
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all touch-target ${
                    selectedTopic === cat.id
                      ? "bg-primary text-white"
                      : "bg-[var(--surface)] border border-[var(--border-color)] hover:border-primary"
                  }`}
                >
                  {cat.icon} {cat.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {!finished ? (
          <>
            {/* Progress & Timer */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 h-3 bg-[var(--surface-alt)] rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary to-pink rounded-full"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <div className="flex items-center gap-2 text-sm font-bold shrink-0">
                <span>{currentQ + 1}/{questions.length}</span>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${timeLeft <= 10 ? "bg-danger/10 text-danger animate-pulse" : "bg-primary/10 text-primary"}`}>
                  <Clock size={14} />
                  {timeLeft}s
                </div>
              </div>
            </div>

            {/* Question Card */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQ}
                initial={{ opacity: 0, x: 50 }}
                animate={shake ? { x: [-10, 10, -10, 10, 0], opacity: 1, transition: { duration: 0.4 } } : { opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="bg-[var(--surface)] rounded-3xl border border-[var(--border-color)] p-6 sm:p-8 shadow-lg relative overflow-hidden"
              >
                {/* Difficulty & Topic Badge */}
                <div className="flex items-center gap-2 mb-4">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${difficultyColors[q.difficulty]}`}>
                    {q.difficulty.toUpperCase()}
                  </span>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${isAIGenerated ? "bg-purple-100 text-purple-600" : "bg-primary/10 text-primary"}`}>
                    {isAIGenerated ? <><Wand2 size={12} className="inline mr-1"/> AI Generated</> : q.topic}
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl font-bold mb-6">{q.question}</h2>

                <div className="space-y-3">
                  {q.options.map((option, i) => {
                    let style =
                      "bg-[var(--surface-alt)] border-[var(--border-color)] hover:border-primary hover:bg-primary/5";
                    if (showResult) {
                      if (option === q.answer)
                        style = "bg-secondary/10 border-secondary text-secondary";
                      else if (option === selected)
                        style = "bg-danger/10 border-danger text-danger";
                      else
                        style = "bg-[var(--surface-alt)] border-[var(--border-color)] opacity-50";
                    } else if (selected === option) {
                      style = "bg-primary/10 border-primary";
                    }

                    return (
                      <motion.button
                        key={i}
                        whileHover={!showResult ? { scale: 1.02 } : {}}
                        whileTap={!showResult ? { scale: 0.98 } : {}}
                        onClick={() => handleSelect(option)}
                        disabled={showResult}
                        className={`w-full text-left px-5 py-4 rounded-2xl border-2 font-semibold text-base transition-all flex items-center justify-between quiz-option ${style}`}
                      >
                        <span>
                          <span className="inline-block w-8 h-8 rounded-full bg-[var(--surface)] text-center leading-8 text-sm font-bold mr-3 border border-[var(--border-color)]">
                            {String.fromCharCode(65 + i)}
                          </span>
                          {option}
                        </span>
                        {showResult && option === q.answer && <CheckCircle size={20} />}
                        {showResult && option === selected && option !== q.answer && <XCircle size={20} />}
                      </motion.button>
                    );
                  })}
                </div>

                {showResult && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 flex justify-end">
                    <button
                      onClick={() => handleNext()}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary-dark transition-colors touch-target"
                    >
                      {currentQ + 1 < questions.length ? (
                        <>Next <ArrowRight size={18} /></>
                      ) : (
                        <>See Results <Trophy size={18} /></>
                      )}
                    </button>
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Score indicator */}
            <div className="mt-4 text-center text-sm text-[var(--muted)]">
              <Zap size={14} className="inline text-accent" /> Score: {score}/{currentQ + (showResult ? 1 : 0)}
            </div>
          </>
        ) : (
          /* Results Screen */
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[var(--surface)] rounded-3xl border border-[var(--border-color)] p-8 sm:p-12 text-center shadow-lg"
          >
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }} className="text-6xl mb-4">
              {score >= 9 ? "🏆" : score >= 7 ? "🌟" : score >= 5 ? "👍" : "💪"}
            </motion.div>
            <h2 className="text-3xl font-black mb-2">
              {score >= 9 ? "Outstanding!" : score >= 7 ? "Great Job!" : score >= 5 ? "Good Effort!" : "Keep Practicing!"}
            </h2>
            <p className="text-5xl font-black gradient-text mb-2">{score}/{questions.length}</p>
            <p className="text-[var(--muted)] mb-2">
              You earned <strong className="text-primary">{score * 10 + (difficulty === "hard" ? 20 : difficulty === "medium" ? 10 : 0)} XP</strong>!
            </p>

            {/* Difficulty change notification */}
            {difficultyMessage && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 mb-4 px-4 py-3 rounded-xl bg-accent/10 text-accent-dark font-bold text-sm flex items-center justify-center gap-2"
              >
                {difficultyMessage.includes("increased") ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                {difficultyMessage}
              </motion.div>
            )}

            {/* Answer review */}
            <div className="mt-6 space-y-2 text-left max-h-60 overflow-y-auto">
              {answers.map((a, i) => (
                <div key={i} className={`flex items-start gap-2 p-3 rounded-xl text-sm ${a.isCorrect ? "bg-secondary/5" : "bg-danger/5"}`}>
                  {a.isCorrect ? (
                    <CheckCircle size={16} className="text-secondary shrink-0 mt-0.5" />
                  ) : (
                    <XCircle size={16} className="text-danger shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className="font-semibold">{a.question}</p>
                    {a.timedOut && <p className="text-xs text-danger">⏰ Time&apos;s up!</p>}
                    {!a.isCorrect && <p className="text-[var(--muted)]">Correct: {a.correct}</p>}
                    <span className="text-xs text-primary font-bold">{a.topic}</span>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={restart}
              className="mt-8 inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-primary to-pink text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all touch-target"
            >
              <RotateCcw size={20} /> Try Again
            </button>
          </motion.div>
        )}
        </div>
      </div>
    </div>
  );
}
