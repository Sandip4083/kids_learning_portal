"use client";
/* eslint-disable react-hooks/set-state-in-effect */
import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { levelThresholds } from "@/data/achievements";
import { loadFromStorage, saveToStorage } from "@/lib/storage";

const GameContext = createContext();

const defaultState = {
  xp: 0,
  level: 1,
  streak: 0,
  lastActive: null,
  quizzesCompleted: 0,
  mathPerfect: 0,
  sciencePerfect: 0,
  storiesRead: [],
  gamesPlayed: [],
  achievements: [],
  dailyChallenges: 0,
  sectionsVisited: [],
  bookmarks: [],
  quizHistory: [],
  // NEW: Enhanced tracking
  topicPerformance: {
    math: {},
    science: {},
  },
  timeSpent: {
    math: 0,
    science: 0,
    stories: 0,
    games: 0,
  },
  streakCalendar: [], // ["2026-04-20", ...]
  currentDifficulty: {
    math: "easy",
    science: "easy",
  },
  loginDates: [],
  totalSessions: 0,
};

export function GameProvider({ children }) {
  const [state, setState] = useState(defaultState);
  const [loaded, setLoaded] = useState(false);
  const timerRef = useRef(null);
  const activeSectionRef = useRef(null);

  useEffect(() => {
    const saved = loadFromStorage("game", null);
    if (saved) {
      setState({
        ...defaultState,
        ...saved,
        topicPerformance: { ...defaultState.topicPerformance, ...(saved.topicPerformance || {}) },
        timeSpent: { ...defaultState.timeSpent, ...(saved.timeSpent || {}) },
        currentDifficulty: { ...defaultState.currentDifficulty, ...(saved.currentDifficulty || {}) },
        streakCalendar: saved.streakCalendar || [],
        loginDates: saved.loginDates || [],
      });
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      saveToStorage("game", state);
    }
  }, [state, loaded]);

  // Streak and login tracking
  useEffect(() => {
    if (!loaded) return;
    const today = new Date().toDateString();
    const todayISO = new Date().toISOString().split("T")[0];

    if (state.lastActive !== today) {
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      setState((s) => ({
        ...s,
        lastActive: today,
        streak: s.lastActive === yesterday ? s.streak + 1 : 1,
        streakCalendar: s.streakCalendar.includes(todayISO)
          ? s.streakCalendar
          : [...s.streakCalendar.slice(-83), todayISO], // Keep last 84 days
        loginDates: s.loginDates.includes(todayISO)
          ? s.loginDates
          : [...s.loginDates.slice(-29), todayISO],
        totalSessions: (s.totalSessions || 0) + 1,
      }));
    }
  }, [loaded]); // eslint-disable-line react-hooks/exhaustive-deps

  // Time tracking timer
  const startTimeTracking = useCallback((section) => {
    if (timerRef.current) clearInterval(timerRef.current);
    activeSectionRef.current = section;
    timerRef.current = setInterval(() => {
      setState((s) => ({
        ...s,
        timeSpent: {
          ...s.timeSpent,
          [section]: (s.timeSpent[section] || 0) + 1,
        },
      }));
    }, 1000);
  }, []);

  const stopTimeTracking = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    activeSectionRef.current = null;
  }, []);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const addXp = useCallback((amount) => {
    setState((s) => {
      const newXp = s.xp + amount;
      const newLevel = levelThresholds.findIndex((l) => l.xpRequired > newXp);
      return {
        ...s,
        xp: newXp,
        level: newLevel === -1 ? 50 : newLevel,
      };
    });
  }, []);

  const completeQuiz = useCallback((category, score, total, topicDetails = null) => {
    setState((s) => {
      const isPerfect = score === total;
      const newTopicPerf = { ...s.topicPerformance };

      // Update per-topic performance
      if (topicDetails && Array.isArray(topicDetails)) {
        topicDetails.forEach(({ topic, correct }) => {
          if (!newTopicPerf[category]) newTopicPerf[category] = {};
          if (!newTopicPerf[category][topic]) {
            newTopicPerf[category][topic] = { correct: 0, total: 0 };
          }
          newTopicPerf[category][topic].total += 1;
          if (correct) newTopicPerf[category][topic].correct += 1;
        });
      }

      return {
        ...s,
        quizzesCompleted: s.quizzesCompleted + 1,
        mathPerfect: category === "math" && isPerfect ? s.mathPerfect + 1 : s.mathPerfect,
        sciencePerfect: category === "science" && isPerfect ? s.sciencePerfect + 1 : s.sciencePerfect,
        quizHistory: [
          ...s.quizHistory,
          { category, score, total, date: new Date().toISOString() },
        ],
        topicPerformance: newTopicPerf,
      };
    });
  }, []);

  const updateDifficulty = useCallback((category, difficulty) => {
    setState((s) => ({
      ...s,
      currentDifficulty: {
        ...s.currentDifficulty,
        [category]: difficulty,
      },
    }));
  }, []);

  const readStory = useCallback((storyId) => {
    setState((s) => ({
      ...s,
      storiesRead: s.storiesRead.includes(storyId)
        ? s.storiesRead
        : [...s.storiesRead, storyId],
    }));
  }, []);

  const playGame = useCallback((gameId) => {
    setState((s) => ({
      ...s,
      gamesPlayed: s.gamesPlayed.includes(gameId)
        ? s.gamesPlayed
        : [...s.gamesPlayed, gameId],
    }));
  }, []);

  const visitSection = useCallback(
    (section) => {
      setState((s) => ({
        ...s,
        sectionsVisited: s.sectionsVisited.includes(section)
          ? s.sectionsVisited
          : [...s.sectionsVisited, section],
      }));
      // Start time tracking for applicable sections
      if (["math", "science", "stories", "games"].includes(section)) {
        startTimeTracking(section);
      }
    },
    [startTimeTracking]
  );

  const toggleBookmark = useCallback((itemId) => {
    setState((s) => ({
      ...s,
      bookmarks: s.bookmarks.includes(itemId)
        ? s.bookmarks.filter((id) => id !== itemId)
        : [...s.bookmarks, itemId],
    }));
  }, []);

  const unlockAchievement = useCallback((achievementId) => {
    setState((s) => ({
      ...s,
      achievements: s.achievements.includes(achievementId)
        ? s.achievements
        : [...s.achievements, achievementId],
    }));
  }, []);

  const completeDailyChallenge = useCallback(() => {
    setState((s) => ({ ...s, dailyChallenges: s.dailyChallenges + 1 }));
  }, []);

  return (
    <GameContext.Provider
      value={{
        ...state,
        loaded,
        addXp,
        completeQuiz,
        updateDifficulty,
        readStory,
        playGame,
        visitSection,
        toggleBookmark,
        unlockAchievement,
        completeDailyChallenge,
        startTimeTracking,
        stopTimeTracking,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export const useGame = () => useContext(GameContext);
