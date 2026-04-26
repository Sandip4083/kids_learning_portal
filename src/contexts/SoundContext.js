"use client";
/* eslint-disable react-hooks/set-state-in-effect */
import { createContext, useContext, useState, useEffect, useCallback } from "react";

const SoundContext = createContext();

export function SoundProvider({ children }) {
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("klp-sound");
    if (saved !== null) setEnabled(saved === "true");
  }, []);

  useEffect(() => {
    localStorage.setItem("klp-sound", enabled.toString());
  }, [enabled]);

  const playSound = useCallback((type) => {
    if (!enabled) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      gain.gain.value = 0.15;

      switch (type) {
        case "click":
          osc.frequency.value = 800;
          osc.type = "sine";
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
          osc.start(); osc.stop(ctx.currentTime + 0.1);
          break;
        case "correct":
          osc.frequency.value = 523;
          osc.type = "sine";
          osc.start();
          osc.frequency.setValueAtTime(659, ctx.currentTime + 0.1);
          osc.frequency.setValueAtTime(784, ctx.currentTime + 0.2);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
          osc.stop(ctx.currentTime + 0.4);
          break;
        case "wrong":
          osc.frequency.value = 300;
          osc.type = "square";
          gain.gain.value = 0.1;
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
          osc.start(); osc.stop(ctx.currentTime + 0.3);
          break;
        case "levelup":
          osc.frequency.value = 440;
          osc.type = "sine";
          gain.gain.value = 0.2;
          osc.start();
          osc.frequency.setValueAtTime(554, ctx.currentTime + 0.1);
          osc.frequency.setValueAtTime(659, ctx.currentTime + 0.2);
          osc.frequency.setValueAtTime(880, ctx.currentTime + 0.3);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
          osc.stop(ctx.currentTime + 0.6);
          break;
        case "pop":
          osc.frequency.value = 600;
          osc.type = "sine";
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
          osc.start(); osc.stop(ctx.currentTime + 0.08);
          break;
        default:
          osc.frequency.value = 500;
          osc.type = "sine";
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
          osc.start(); osc.stop(ctx.currentTime + 0.1);
      }
    } catch (e) { /* silently fail if AudioContext unavailable */ }
  }, [enabled]);

  const toggle = () => setEnabled(e => !e);

  return (
    <SoundContext.Provider value={{ enabled, toggle, playSound }}>
      {children}
    </SoundContext.Provider>
  );
}

export const useSound = () => useContext(SoundContext);
