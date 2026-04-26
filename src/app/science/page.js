"use client";
/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useSound } from "@/contexts/SoundContext";
import { useGame } from "@/contexts/GameContext";
import { scienceTopics, scienceQuestions } from "@/data/scienceTopics";
import { selectAdaptiveQuestions, adjustDifficulty } from "@/lib/personalization";
import confetti from "canvas-confetti";
import { ChevronDown, CheckCircle, XCircle, ArrowRight, RotateCcw, Trophy, Volume2, VolumeX, RefreshCw, Brain, TrendingUp, TrendingDown, Clock, Zap, Wand2, Sparkles, Flame } from "lucide-react";

export default function SciencePage() {
  const { playSound } = useSound();
  const { addXp, completeQuiz, visitSection, currentDifficulty, updateDifficulty, stopTimeTracking } = useGame();

  const [expandedTopic, setExpandedTopic] = useState(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [difficultyMessage, setDifficultyMessage] = useState(null);
  const [speakingTopic, setSpeakingTopic] = useState(null);
  const [speakingLang, setSpeakingLang] = useState(null);
  const [translating, setTranslating] = useState(false);
  const [isAIGenerated, setIsAIGenerated] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const activeSpeechRef = useRef(null);

  // Gamification state
  const [combo, setCombo] = useState(0);
  const [mascotMessage, setMascotMessage] = useState("Let's discover science!");
  const [shake, setShake] = useState(false);

  const difficulty = currentDifficulty?.science || "easy";
  const [topicLevel, setTopicLevel] = useState(difficulty);
  const filteredTopics = scienceTopics.filter(t => t.difficulty === topicLevel);

  const [questions, setQuestions] = useState(() =>
    selectAdaptiveQuestions(scienceQuestions, difficulty, 10)
  );

  useEffect(() => {
    visitSection("science");
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
    if (!showQuiz || finished || showResult) return;
    if (timeLeft <= 0) { handleTimeout(); return; }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, finished, showResult, showQuiz, handleTimeout]);

  const translateText = async (text, targetLang = 'hi') => {
    try {
      const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`);
      const data = await res.json();
      return data[0].map(item => item[0]).join('');
    } catch (error) {
      console.error("Translation failed:", error);
      return text;
    }
  };

  const speakText = async (id, text, lang = 'en-US') => {
    if ("speechSynthesis" in window) {
      if (speakingTopic === id && speakingLang === lang) {
        window.speechSynthesis.cancel();
        setSpeakingTopic(null);
        setSpeakingLang(null);
        activeSpeechRef.current = null;
        return;
      }

      window.speechSynthesis.cancel();
      
      const unlock = new SpeechSynthesisUtterance('');
      window.speechSynthesis.speak(unlock);

      setSpeakingTopic(id);
      setSpeakingLang(lang);
      const currentSession = Date.now();
      activeSpeechRef.current = currentSession;
      
      let textToRead = text;
      
      if (lang === 'hi-IN') {
        setTranslating(true);
        try {
            const chunks = textToRead.match(/[^.!?]+[.!?]+/g) || [textToRead];
            let translatedChunks = [];
            for (let i = 0; i < chunks.length; i += 3) {
                if (activeSpeechRef.current !== currentSession) return;
                const chunk = chunks.slice(i, i + 3).join(" ");
                const t = await translateText(chunk, 'hi');
                translatedChunks.push(t);
            }
            textToRead = translatedChunks.join(" ");
        } catch (e) {
            console.error(e);
        }
        setTranslating(false);
      }

      if (activeSpeechRef.current !== currentSession) return;

      const u = new SpeechSynthesisUtterance(textToRead);
      u.lang = lang;
      u.rate = 0.9;
      u.pitch = 1.1;
      
      u.onend = () => {
        if (activeSpeechRef.current === currentSession) {
            setSpeakingTopic(null);
            setSpeakingLang(null);
            activeSpeechRef.current = null;
        }
      };
      u.onerror = () => {
        if (activeSpeechRef.current === currentSession) {
            setSpeakingTopic(null);
            setSpeakingLang(null);
            activeSpeechRef.current = null;
        }
      };

      const voices = window.speechSynthesis.getVoices();
      const targetVoice = voices.find(v => v.lang.startsWith(lang.split('-')[0]));
      if (targetVoice) u.voice = targetVoice;

      window.speechSynthesis.speak(u);
    }
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
      const topicDetails = answers.map((a) => ({ topic: a.topic, correct: a.isCorrect }));
      const comboBonus = combo > 2 ? combo * 5 : 0;
      addXp(score * 10 + (difficulty === "hard" ? 20 : difficulty === "medium" ? 10 : 0) + comboBonus);
      completeQuiz("science", score, questions.length, topicDetails);

      const result = adjustDifficulty(difficulty, score, questions.length);
      if (result.changed) {
        updateDifficulty("science", result.newDifficulty);
        setDifficultyMessage(result.message);
      }

      if (score >= 8) {
        confetti({ particleCount: 150, spread: 80 });
        playSound("levelup");
      }
    }
  }, [currentQ, questions, score, addXp, completeQuiz, playSound, difficulty, updateDifficulty, answers, combo]);

  const generateAIScienceQuestions = (diff) => {
    const q = [];
    
    for (let i = 0; i < 10; i++) {
      const topic = scienceTopics[Math.floor(Math.random() * scienceTopics.length)];
      const type = Math.floor(Math.random() * 3);
      let question, answer, options = [];
      
      if (type === 0 && topic.funFact) {
        if (Math.random() > 0.5) {
          // Show the real fact — answer is True
          question = `True or False: ${topic.funFact}`;
          answer = "True";
        } else {
          // Create a genuinely false statement by attributing one topic's fact to another
          const otherTopic = scienceTopics.find(t => t.id !== topic.id) || scienceTopics[0];
          const fakeFact = topic.funFact.replace(topic.title, otherTopic.title);
          if (fakeFact !== topic.funFact) {
            question = `True or False: ${fakeFact}`;
          } else {
            // Fallback: swap numbers or add "not"
            question = `True or False: It is NOT true that ${topic.funFact.charAt(0).toLowerCase() + topic.funFact.slice(1)}`;
          }
          answer = "False";
        }
        options = ["True", "False"];
      } else if (type === 1) {
        question = `Which of the following best describes ${topic.title}?`;
        answer = topic.description;
        options.push(answer);
        while(options.length < 4) {
          const randomTopic = scienceTopics[Math.floor(Math.random() * scienceTopics.length)];
          if (!options.includes(randomTopic.description)) {
            options.push(randomTopic.description);
          }
        }
      } else {
         const item = topic.items[Math.floor(Math.random() * topic.items.length)];
         if (typeof item === 'object' && item.name && item.detail) {
           question = `In the context of ${topic.title}, what is the purpose of ${item.name}?`;
           answer = item.detail;
           options.push(answer);
           let attempts = 0;
           while(options.length < 4 && attempts < 20) {
             const rt = scienceTopics[Math.floor(Math.random() * scienceTopics.length)];
             if (rt.items && rt.items.length > 0) {
                 const ri = rt.items[Math.floor(Math.random() * rt.items.length)];
                 if (typeof ri === 'object' && ri.detail && !options.includes(ri.detail)) {
                   options.push(ri.detail);
                 }
             }
             attempts++;
           }
           // Fallback if not enough details found
           if (options.length < 4) {
               question = `Which of these is a key part of ${topic.title}?`;
               answer = item.name;
               options = [answer];
               while(options.length < 4) {
                   const rt = scienceTopics[Math.floor(Math.random() * scienceTopics.length)];
                   const ri = rt.items[Math.floor(Math.random() * rt.items.length)];
                   const val = typeof ri === 'string' ? ri : ri.name;
                   if (!options.includes(val)) options.push(val);
               }
           }
         } else {
           question = `Which of these is a key part of ${topic.title}?`;
           answer = typeof item === 'string' ? item : item.name;
           options.push(answer);
           while(options.length < 4) {
             const rt = scienceTopics[Math.floor(Math.random() * scienceTopics.length)];
             const ri = rt.items[Math.floor(Math.random() * rt.items.length)];
             const val = typeof ri === 'string' ? ri : ri.name;
             if (!options.includes(val)) options.push(val);
           }
         }
      }
      
      q.push({
        id: `ai_${i}`,
        topic: "AI Generated",
        difficulty: diff,
        question: question,
        options: options.sort(() => Math.random() - 0.5),
        answer: answer
      });
    }
    return q;
  };

  const restartQuiz = () => {
    let newQ;
    if (isAIGenerated) {
      newQ = generateAIScienceQuestions(currentDifficulty?.science || "easy");
    } else {
      newQ = selectAdaptiveQuestions(scienceQuestions, currentDifficulty?.science || "easy", 10);
    }
    setQuestions(newQ);
    setCurrentQ(0);
    setSelected(null);
    setShowResult(false);
    setScore(0);
    setFinished(false);
    setAnswers([]);
    setShowQuiz(true);
    setTimeLeft(30);
    setDifficultyMessage(null);
    setCombo(0);
    setMascotMessage("Let's discover science!");
  };

  const difficultyColors = {
    easy: "bg-secondary/10 text-secondary",
    medium: "bg-accent/10 text-accent-dark",
    hard: "bg-danger/10 text-danger",
  };

  return (
    <div className="min-h-screen relative overflow-hidden px-4 py-10 bg-gradient-to-b from-[var(--background)] to-sky-50/30 dark:to-sky-900/10">
      {/* Floating Background Science Symbols */}
      <div className="absolute inset-0 pointer-events-none opacity-10 dark:opacity-5 overflow-hidden">
        {['⚛', '🔬', '🔭', '🧬', '🌍', '🧪', '🌱', '🪐'].map((sym, i) => (
          <motion.div
            key={i}
            className="absolute text-6xl font-black text-secondary"
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
        {/* Left Side: Mascot (only show during quiz) */}
        <AnimatePresence>
          {showQuiz && !finished && (
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50, width: 0 }}
              className="w-full lg:w-64 flex flex-col items-center shrink-0 order-2 lg:order-1 lg:sticky lg:top-24 mt-8 lg:mt-0"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={mascotMessage}
                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-[var(--surface)] p-4 rounded-2xl shadow-lg border-2 border-secondary/20 relative mb-4 text-center w-full max-w-[250px]"
                >
                  <p className="font-bold text-sm md:text-base text-[var(--foreground)]">{mascotMessage}</p>
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-4 h-4 bg-[var(--surface)] border-b-2 border-r-2 border-secondary/20 rotate-45"></div>
                </motion.div>
              </AnimatePresence>
              <motion.div 
                animate={{ y: [0, -10, 0] }} 
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                className="relative w-32 h-32 md:w-40 md:h-40"
              >
                <Image 
                  src="/images/wise_owl.jpg" 
                  alt="Prof. Owl" 
                  fill
                  className="object-cover rounded-full shadow-xl border-4 border-secondary/30"
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
            </motion.div>
          )}
        </AnimatePresence>

        {/* Right Side: Main Content */}
        <div className="flex-1 w-full max-w-4xl mx-auto order-1 lg:order-2">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <h1 className="text-4xl font-black mb-2">🔬 Science Corner</h1>
          <p className="text-[var(--muted)]">Explore fascinating topics about our world!</p>
          
          {/* Level Selector */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 mt-6">
            {['easy', 'medium', 'hard'].map((level) => {
              const colors = {
                easy: "text-secondary border-secondary bg-secondary/10",
                medium: "text-accent-dark border-accent-dark bg-accent/10",
                hard: "text-danger border-danger bg-danger/10"
              };
              const isActive = topicLevel === level;
              return (
                <button
                  key={level}
                  onClick={() => {
                    setTopicLevel(level);
                    playSound("click");
                    setExpandedTopic(null);
                  }}
                  className={`px-6 py-2 rounded-full text-sm font-bold transition-all touch-target border-2 ${
                    isActive 
                      ? `${colors[level]} shadow-md scale-105` 
                      : "bg-[var(--surface)] border-[var(--border-color)] text-[var(--muted)] hover:border-primary"
                  }`}
                >
                  {level.toUpperCase()}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Topics */}
        <div className="space-y-4 mb-12 min-h-[200px]">
          <AnimatePresence mode="popLayout">
            {filteredTopics.map((topic, i) => (
              <motion.div
                key={topic.id}
                layout
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -20, transition: { duration: 0.2 } }}
                transition={{ duration: 0.3 }}
                className="bg-[var(--surface)] rounded-3xl border border-[var(--border-color)] overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
              <button
                onClick={() => {
                  setExpandedTopic(expandedTopic === topic.id ? null : topic.id);
                  playSound("pop");
                }}
                className="w-full flex items-center justify-between p-5 sm:p-6 text-left touch-target"
              >
                <div className="flex items-center gap-4">
                  <span className="text-3xl">{topic.icon}</span>
                  <div>
                    <h3 className="text-lg font-bold">{topic.title}</h3>
                    <p className="text-sm text-[var(--muted)] hidden sm:block">{topic.description}</p>
                  </div>
                </div>
                <motion.div animate={{ rotate: expandedTopic === topic.id ? 180 : 0 }}>
                  <ChevronDown size={20} />
                </motion.div>
              </button>
              <AnimatePresence>
                {expandedTopic === topic.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 sm:px-6 pb-6 space-y-4">
                      <div className="relative w-full h-48 sm:h-64 rounded-2xl overflow-hidden">
                        <Image src={topic.image} alt={topic.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 800px" />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {topic.items.map((item, j) => (
                          <span key={j} className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold">
                            {typeof item === "string" ? item : item.name}
                          </span>
                        ))}
                      </div>
                      {topic.items[0]?.detail && (
                        <div className="space-y-2">
                          {topic.items.map((item, j) => (
                            <div key={j} className="flex gap-2 text-sm">
                              <span className="font-bold text-primary shrink-0">{item.name}:</span>
                              <span className="text-[var(--muted)]">{item.detail}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="bg-accent/10 rounded-2xl p-4 flex items-start gap-3">
                        <span className="text-xl shrink-0">💡</span>
                        <div>
                          <p className="text-sm font-bold text-accent-dark mb-1">Fun Fact!</p>
                          <p className="text-sm">{topic.funFact}</p>
                        </div>
                      </div>
                      <div className="flex items-center bg-[var(--surface-alt)] rounded-xl p-1 gap-1 border border-[var(--border-color)] shadow-sm inline-flex">
                        <button
                          onClick={() => speakText(topic.id, `${topic.title}. ${topic.description}. Fun fact: ${topic.funFact}`, 'en-US')}
                          disabled={translating && speakingTopic === topic.id}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors touch-target ${
                            speakingTopic === topic.id && speakingLang === 'en-US' ? "bg-primary text-white" : "hover:bg-primary/10 text-primary"
                          }`}
                        >
                          {speakingTopic === topic.id && speakingLang === 'en-US' ? <VolumeX size={14} /> : <Volume2 size={14} />} EN
                        </button>
                        <button
                          onClick={() => speakText(topic.id, `${topic.title}. ${topic.description}. Fun fact: ${topic.funFact}`, 'hi-IN')}
                          disabled={translating && speakingTopic === topic.id}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors touch-target ${
                            speakingTopic === topic.id && speakingLang === 'hi-IN' ? "bg-orange text-white" : "hover:bg-orange/10 text-orange"
                          }`}
                        >
                          {translating && speakingTopic === topic.id && speakingLang === 'hi-IN' ? (
                            <RefreshCw size={14} className="animate-spin" />
                          ) : speakingTopic === topic.id && speakingLang === 'hi-IN' ? (
                            <VolumeX size={14} />
                          ) : (
                            <Volume2 size={14} />
                          )} HI
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
          </AnimatePresence>
          {filteredTopics.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center p-8 text-[var(--muted)]">
              More topics coming soon!
            </motion.div>
          )}
        </div>

        {/* Quiz */}
        {!showQuiz && !finished ? (
          <div className="text-center">
            <h2 className="text-2xl font-black mb-4">🧪 Science Quiz</h2>
            <p className="text-[var(--muted)] mb-6">Ready to test what you&apos;ve learned?</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => {
                  setShowQuiz(true);
                  setIsAIGenerated(false);
                  setQuestions(selectAdaptiveQuestions(scienceQuestions, difficulty, 10));
                  playSound("click");
                }}
                className="inline-flex items-center justify-center w-full sm:w-auto gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-secondary to-sky-dark text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 touch-target"
              >
                Standard Quiz <ArrowRight size={20} />
              </button>

              <button
                onClick={() => {
                  setIsGenerating(true);
                  playSound("click");
                  setTimeout(() => {
                    setQuestions(generateAIScienceQuestions(difficulty));
                    setIsAIGenerated(true);
                    setShowQuiz(true);
                    setIsGenerating(false);
                  }, 800);
                }}
                disabled={isGenerating}
                className="inline-flex items-center justify-center w-full sm:w-auto gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 touch-target relative overflow-hidden"
              >
                {isGenerating ? (
                   <>Generating AI Quiz <RefreshCw size={20} className="animate-spin" /></>
                ) : (
                   <>Generate with AI <Sparkles size={20} /></>
                )}
                <div className="absolute inset-0 w-full h-full bg-white/20 -skew-x-12 -translate-x-full hover:animate-[shimmer_1.5s_infinite]"></div>
              </button>
            </div>
          </div>
        ) : showQuiz && !finished ? (
          <div className="max-w-2xl mx-auto">
            {/* Progress & Timer */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 h-3 bg-[var(--surface-alt)] rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-secondary to-sky rounded-full"
                  animate={{ width: `${((currentQ + (showResult ? 1 : 0)) / questions.length) * 100}%` }}
                />
              </div>
              <div className="flex items-center gap-2 text-sm font-bold shrink-0">
                <span>{currentQ + 1}/{questions.length}</span>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${timeLeft <= 10 ? "bg-danger/10 text-danger animate-pulse" : "bg-secondary/10 text-secondary"}`}>
                  <Clock size={14} />
                  {timeLeft}s
                </div>
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentQ}
                initial={{ opacity: 0, x: 50 }}
                animate={shake ? { x: [-10, 10, -10, 10, 0], opacity: 1, transition: { duration: 0.4 } } : { opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="bg-[var(--surface)] rounded-3xl border border-[var(--border-color)] p-6 sm:p-8 shadow-lg relative overflow-hidden"
              >
                <div className="flex items-center gap-2 mb-4">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${difficultyColors[questions[currentQ].difficulty]}`}>
                    {questions[currentQ].difficulty.toUpperCase()}
                  </span>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${isAIGenerated ? "bg-purple-100 text-purple-600" : "bg-secondary/10 text-secondary"}`}>
                    {isAIGenerated ? <><Wand2 size={12} className="inline mr-1"/> AI Generated</> : questions[currentQ].topic}
                  </span>
                </div>

                <h3 className="text-xl font-bold mb-6">{questions[currentQ].question}</h3>
                <div className="space-y-3">
                  {questions[currentQ].options.map((option, i) => {
                    let style = "bg-[var(--surface-alt)] border-[var(--border-color)] hover:border-secondary";
                    if (showResult) {
                      if (option === questions[currentQ].answer)
                        style = "bg-secondary/10 border-secondary text-secondary";
                      else if (option === selected)
                        style = "bg-danger/10 border-danger text-danger";
                      else style = "opacity-50 bg-[var(--surface-alt)] border-[var(--border-color)]";
                    }
                    return (
                      <motion.button
                        key={i}
                        whileHover={!showResult ? { scale: 1.02 } : {}}
                        whileTap={!showResult ? { scale: 0.98 } : {}}
                        onClick={() => handleSelect(option)}
                        disabled={showResult}
                        className={`w-full text-left px-5 py-4 rounded-2xl border-2 font-semibold transition-all flex items-center justify-between quiz-option ${style}`}
                      >
                        <span>
                          <span className="inline-block w-8 h-8 rounded-full bg-[var(--surface)] text-center leading-8 text-sm font-bold mr-3 border border-[var(--border-color)]">
                            {String.fromCharCode(65 + i)}
                          </span>
                          {option}
                        </span>
                        {showResult && option === questions[currentQ].answer && <CheckCircle size={20} />}
                        {showResult && option === selected && option !== questions[currentQ].answer && <XCircle size={20} />}
                      </motion.button>
                    );
                  })}
                </div>
                {showResult && (
                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={() => handleNext()}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-secondary text-white font-bold touch-target"
                    >
                      {currentQ + 1 < questions.length ? (
                        <>Next <ArrowRight size={18} /></>
                      ) : (
                        <>Results <Trophy size={18} /></>
                      )}
                    </button>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="mt-4 text-center text-sm text-[var(--muted)]">
              <Zap size={14} className="inline text-accent" /> Score: {score}/{currentQ + (showResult ? 1 : 0)}
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto bg-[var(--surface)] rounded-3xl border border-[var(--border-color)] p-8 text-center shadow-lg"
          >
            <div className="text-6xl mb-4">{score >= 9 ? "🏆" : score >= 7 ? "🌟" : "👍"}</div>
            <p className="text-5xl font-black gradient-text mb-2">{score}/{questions.length}</p>
            <p className="text-[var(--muted)] mb-2">
              You earned <strong className="text-secondary">{score * 10 + (difficulty === "hard" ? 20 : difficulty === "medium" ? 10 : 0)} XP</strong>!
            </p>

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
                  {a.isCorrect ? <CheckCircle size={16} className="text-secondary shrink-0 mt-0.5" /> : <XCircle size={16} className="text-danger shrink-0 mt-0.5" />}
                  <div>
                    <p className="font-semibold">{a.question}</p>
                    {a.timedOut && <p className="text-xs text-danger">⏰ Time&apos;s up!</p>}
                    {!a.isCorrect && <p className="text-[var(--muted)]">Correct: {a.correct}</p>}
                    <span className="text-xs text-secondary font-bold">{a.topic}</span>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={restartQuiz}
              className="mt-8 inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-secondary to-sky text-white font-bold text-lg shadow-lg touch-target"
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
