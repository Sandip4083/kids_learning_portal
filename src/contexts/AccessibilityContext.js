"use client";
/* eslint-disable react-hooks/set-state-in-effect */
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { loadFromStorage, saveToStorage } from "@/lib/storage";

const AccessibilityContext = createContext();

const defaultSettings = {
  dyslexiaFont: false,
  textSize: "normal", // "small" | "normal" | "large" | "xlarge"
  reducedMotion: false,
  highContrast: false,
  voiceNavigation: false,
};

export function AccessibilityProvider({ children }) {
  const [settings, setSettings] = useState(defaultSettings);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const saved = loadFromStorage("accessibility", defaultSettings);
    setSettings({ ...defaultSettings, ...saved });
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    saveToStorage("accessibility", settings);

    // Apply to document
    const root = document.documentElement;

    // Dyslexia font
    root.setAttribute("data-dyslexia", settings.dyslexiaFont ? "true" : "false");

    // Text size
    const sizes = { small: "14px", normal: "16px", large: "18px", xlarge: "22px" };
    root.style.setProperty("--base-font-size", sizes[settings.textSize] || "16px");

    // Reduced motion
    root.setAttribute("data-reduced-motion", settings.reducedMotion ? "true" : "false");

    // High contrast
    root.setAttribute("data-high-contrast", settings.highContrast ? "true" : "false");
  }, [settings, loaded]);

  const updateSetting = useCallback((key, value) => {
    setSettings((s) => ({ ...s, [key]: value }));
  }, []);

  const toggleSetting = useCallback((key) => {
    setSettings((s) => ({ ...s, [key]: !s[key] }));
  }, []);

  return (
    <AccessibilityContext.Provider value={{ ...settings, updateSetting, toggleSetting, loaded }}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export const useAccessibility = () => useContext(AccessibilityContext);
