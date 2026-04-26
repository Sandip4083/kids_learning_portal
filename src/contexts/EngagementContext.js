"use client";
/* eslint-disable react-hooks/set-state-in-effect */
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { loadFromStorage, saveToStorage } from "@/lib/storage";

const EngagementContext = createContext();

const defaultState = {
  dailyRewardClaimed: null, // date string
  dailyRewardStreak: 0,
  spinWheelLastSpin: null, // date string
  lastSpinReward: null,
  achievementQueue: [], // popups to show
  comebackReminder: null,
};

const DAILY_REWARDS = [
  { day: 1, xp: 10, label: "Day 1", icon: "🎁" },
  { day: 2, xp: 20, label: "Day 2", icon: "🎁" },
  { day: 3, xp: 30, label: "Day 3", icon: "🎁" },
  { day: 4, xp: 40, label: "Day 4", icon: "🎁" },
  { day: 5, xp: 50, label: "Day 5", icon: "⭐" },
  { day: 6, xp: 75, label: "Day 6", icon: "⭐" },
  { day: 7, xp: 100, label: "Day 7 BONUS!", icon: "🏆" },
];

const SPIN_REWARDS = [
  { label: "+5 XP", xp: 5, color: "#6C5CE7" },
  { label: "+10 XP", xp: 10, color: "#00B894" },
  { label: "+15 XP", xp: 15, color: "#FDCB6E" },
  { label: "+25 XP", xp: 25, color: "#E84393" },
  { label: "+50 XP", xp: 50, color: "#74B9FF" },
  { label: "🎯 2x Next", xp: 0, color: "#e17055", special: "double" },
  { label: "+30 XP", xp: 30, color: "#D63031" },
  { label: "+20 XP", xp: 20, color: "#00cec9" },
];

export function EngagementProvider({ children }) {
  const [state, setState] = useState(defaultState);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const saved = loadFromStorage("engagement", defaultState);
    setState({ ...defaultState, ...saved, achievementQueue: [] });
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      saveToStorage("engagement", { ...state, achievementQueue: [] });
    }
  }, [state, loaded]);

  const canClaimDailyReward = useCallback(() => {
    const today = new Date().toDateString();
    return state.dailyRewardClaimed !== today;
  }, [state.dailyRewardClaimed]);

  const claimDailyReward = useCallback(() => {
    const today = new Date().toDateString();
    if (state.dailyRewardClaimed === today) return null;

    const yesterday = new Date(Date.now() - 86400000).toDateString();
    const isConsecutive = state.dailyRewardClaimed === yesterday;
    const newStreak = isConsecutive ? Math.min(state.dailyRewardStreak + 1, 7) : 1;
    const reward = DAILY_REWARDS[(newStreak - 1) % DAILY_REWARDS.length];

    setState((s) => ({
      ...s,
      dailyRewardClaimed: today,
      dailyRewardStreak: newStreak,
    }));

    return reward;
  }, [state.dailyRewardClaimed, state.dailyRewardStreak]);

  const canSpin = useCallback(() => {
    const today = new Date().toDateString();
    return state.spinWheelLastSpin !== today;
  }, [state.spinWheelLastSpin]);

  const spin = useCallback(() => {
    const today = new Date().toDateString();
    if (state.spinWheelLastSpin === today) return null;

    const reward = SPIN_REWARDS[Math.floor(Math.random() * SPIN_REWARDS.length)];
    setState((s) => ({
      ...s,
      spinWheelLastSpin: today,
      lastSpinReward: reward,
    }));

    return reward;
  }, [state.spinWheelLastSpin]);

  const queueAchievement = useCallback((achievement) => {
    setState((s) => ({
      ...s,
      achievementQueue: [...s.achievementQueue, achievement],
    }));
  }, []);

  const dequeueAchievement = useCallback(() => {
    setState((s) => ({
      ...s,
      achievementQueue: s.achievementQueue.slice(1),
    }));
  }, []);

  return (
    <EngagementContext.Provider
      value={{
        ...state,
        loaded,
        canClaimDailyReward,
        claimDailyReward,
        canSpin,
        spin,
        queueAchievement,
        dequeueAchievement,
        DAILY_REWARDS,
        SPIN_REWARDS,
      }}
    >
      {children}
    </EngagementContext.Provider>
  );
}

export const useEngagement = () => useContext(EngagementContext);
