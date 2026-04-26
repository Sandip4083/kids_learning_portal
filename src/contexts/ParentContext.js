"use client";
/* eslint-disable react-hooks/set-state-in-effect */
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { loadFromStorage, saveToStorage } from "@/lib/storage";

const ParentContext = createContext();

const defaultState = {
  pin: null, // stored as simple hash
  isParentMode: false,
  childName: "Little Learner",
  childAvatar: "🧒",
};

function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return hash.toString(36);
}

export function ParentProvider({ children }) {
  const [state, setState] = useState(defaultState);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const saved = loadFromStorage("parent", defaultState);
    setState({ ...defaultState, ...saved, isParentMode: false });
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      saveToStorage("parent", { ...state, isParentMode: false }); // never persist parent mode
    }
  }, [state, loaded]);

  const setPin = useCallback((pin) => {
    setState((s) => ({ ...s, pin: simpleHash(pin) }));
  }, []);

  const verifyPin = useCallback(
    (pin) => {
      if (!state.pin) return true; // No PIN set yet
      return simpleHash(pin) === state.pin;
    },
    [state.pin]
  );

  const hasPin = state.pin !== null;

  const enterParentMode = useCallback(
    (pin) => {
      if (verifyPin(pin)) {
        setState((s) => ({ ...s, isParentMode: true }));
        return true;
      }
      return false;
    },
    [verifyPin]
  );

  const exitParentMode = useCallback(() => {
    setState((s) => ({ ...s, isParentMode: false }));
  }, []);

  const updateChild = useCallback((name, avatar) => {
    setState((s) => ({
      ...s,
      childName: name || s.childName,
      childAvatar: avatar || s.childAvatar,
    }));
  }, []);

  return (
    <ParentContext.Provider
      value={{
        ...state,
        loaded,
        hasPin,
        setPin,
        verifyPin,
        enterParentMode,
        exitParentMode,
        updateChild,
      }}
    >
      {children}
    </ParentContext.Provider>
  );
}

export const useParent = () => useContext(ParentContext);
