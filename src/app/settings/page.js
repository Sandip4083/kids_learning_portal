"use client";
import { motion } from "framer-motion";
import { useAccessibility } from "@/contexts/AccessibilityContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useSound } from "@/contexts/SoundContext";
import { clearAllStorage, getStorageStats } from "@/lib/storage";
import { useState } from "react";
import { Eye, Volume2, Moon, Sun, Type, Accessibility, Trash2, HardDrive, Sparkles } from "lucide-react";

export default function SettingsPage() {
  const { dyslexiaFont, textSize, reducedMotion, highContrast, toggleSetting, updateSetting } = useAccessibility();
  const { theme, toggleTheme } = useTheme();
  const { enabled: soundOn, toggle: toggleSound } = useSound();
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const storageStats = typeof window !== "undefined" ? getStorageStats() : { usedKB: 0, keys: 0 };

  const sections = [
    {
      title: "🎨 Appearance",
      icon: <Eye size={20} />,
      settings: [
        {
          label: "Dark Mode",
          description: "Switch between light and dark themes",
          type: "toggle",
          value: theme === "dark",
          onChange: toggleTheme,
          icon: theme === "dark" ? <Sun size={16} /> : <Moon size={16} />,
        },
        {
          label: "High Contrast",
          description: "Increase color contrast for better readability",
          type: "toggle",
          value: highContrast,
          onChange: () => toggleSetting("highContrast"),
        },
      ],
    },
    {
      title: "♿ Accessibility",
      icon: <Accessibility size={20} />,
      settings: [
        {
          label: "Dyslexia-Friendly Font",
          description: "Use OpenDyslexic font for easier reading",
          type: "toggle",
          value: dyslexiaFont,
          onChange: () => toggleSetting("dyslexiaFont"),
          icon: <Type size={16} />,
        },
        {
          label: "Text Size",
          description: "Adjust the text size for comfort",
          type: "select",
          value: textSize,
          options: [
            { label: "Small", value: "small" },
            { label: "Normal", value: "normal" },
            { label: "Large", value: "large" },
            { label: "Extra Large", value: "xlarge" },
          ],
          onChange: (v) => updateSetting("textSize", v),
        },
        {
          label: "Reduced Motion",
          description: "Minimize animations for motion sensitivity",
          type: "toggle",
          value: reducedMotion,
          onChange: () => toggleSetting("reducedMotion"),
          icon: <Sparkles size={16} />,
        },
      ],
    },
    {
      title: "🔊 Sound",
      icon: <Volume2 size={20} />,
      settings: [
        {
          label: "Sound Effects",
          description: "Toggle sound effects throughout the app",
          type: "toggle",
          value: soundOn,
          onChange: toggleSound,
          icon: <Volume2 size={16} />,
        },
      ],
    },
    {
      title: "💾 Data",
      icon: <HardDrive size={20} />,
      settings: [
        {
          label: "Storage Used",
          description: `${storageStats.usedKB} KB across ${storageStats.keys} items`,
          type: "info",
        },
        {
          label: "Clear All Data",
          description: "Reset all progress, settings, and achievements",
          type: "danger",
          onChange: () => setShowClearConfirm(true),
          icon: <Trash2 size={16} />,
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen px-4 py-10">
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <h1 className="text-4xl font-black mb-2">⚙️ Settings</h1>
          <p className="text-[var(--muted)]">Customize your learning experience</p>
        </motion.div>

        <div className="space-y-6">
          {sections.map((section, si) => (
            <motion.div
              key={si}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: si * 0.1 }}
              className="bg-[var(--surface)] rounded-3xl border border-[var(--border-color)] p-6"
            >
              <h2 className="text-lg font-black mb-4">{section.title}</h2>
              <div className="space-y-4">
                {section.settings.map((setting, i) => (
                  <div key={i} className="flex items-center justify-between py-2">
                    <div className="flex-1">
                      <p className="font-bold text-sm">{setting.label}</p>
                      <p className="text-xs text-[var(--muted)]">{setting.description}</p>
                    </div>
                    <div className="ml-4">
                      {setting.type === "toggle" && (
                        <button
                          onClick={setting.onChange}
                          className={`w-12 h-7 rounded-full transition-all relative ${
                            setting.value ? "bg-primary" : "bg-[var(--border-color)]"
                          }`}
                        >
                          <motion.div
                            className="w-5 h-5 bg-white rounded-full absolute top-1 shadow-sm"
                            animate={{ left: setting.value ? "26px" : "4px" }}
                            transition={{ type: "spring", stiffness: 500 }}
                          />
                        </button>
                      )}
                      {setting.type === "select" && (
                        <select
                          value={setting.value}
                          onChange={(e) => setting.onChange(e.target.value)}
                          className="px-3 py-1.5 rounded-xl bg-[var(--surface-alt)] border border-[var(--border-color)] text-sm font-semibold outline-none"
                        >
                          {setting.options.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      )}
                      {setting.type === "danger" && (
                        <button
                          onClick={setting.onChange}
                          className="px-4 py-2 rounded-xl bg-danger/10 text-danger text-sm font-bold hover:bg-danger/20 transition-colors touch-target"
                        >
                          Clear
                        </button>
                      )}
                      {setting.type === "info" && null}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Clear data confirmation modal */}
        {showClearConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-[var(--surface)] rounded-3xl p-6 max-w-sm w-full text-center"
            >
              <span className="text-5xl block mb-4">⚠️</span>
              <h3 className="text-xl font-black mb-2">Clear All Data?</h3>
              <p className="text-sm text-[var(--muted)] mb-6">
                This will permanently delete all your progress, achievements, and settings. This cannot be undone!
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="px-6 py-3 rounded-xl bg-[var(--surface-alt)] font-bold touch-target"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    clearAllStorage();
                    window.location.reload();
                  }}
                  className="px-6 py-3 rounded-xl bg-danger text-white font-bold touch-target"
                >
                  Delete Everything
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
