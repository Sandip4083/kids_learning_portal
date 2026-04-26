"use client";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { useTheme } from "@/contexts/ThemeContext";
import { useSound } from "@/contexts/SoundContext";
import { useGame } from "@/contexts/GameContext";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Moon, Sun, Volume2, VolumeX, Menu, X, Trophy, Flame, Settings, Shield } from "lucide-react";

const navLinks = [
  { href: "/math", label: "Math", icon: "🧮" },
  { href: "/science", label: "Science", icon: "🔬" },
  { href: "/stories", label: "Stories", icon: "📚" },
  { href: "/games", label: "Games", icon: "🎮" },
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/leaderboard", label: "Leaderboard", icon: "🏆" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { enabled: soundOn, toggle: toggleSound, playSound } = useSound();
  const { level, xp, streak } = useGame();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleNavClick = () => {
    playSound("pop");
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-[var(--surface)]/80 border-b border-[var(--border-color)] shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0" onClick={() => playSound("pop")}>
          <motion.span
            className="text-2xl"
            animate={{ rotate: [0, -10, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 2, repeatDelay: 3 }}
          >
            🎓
          </motion.span>
          <span className="text-xl font-extrabold gradient-text hidden sm:block">
            Kids&apos; Learning Portal
          </span>
          <span className="text-xl font-extrabold gradient-text sm:hidden">KLP</span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => playSound("pop")}
              className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center ${
                pathname.startsWith(link.href)
                  ? "text-secondary bg-secondary/10"
                  : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-alt)]"
              }`}
            >
              <span className="mr-1">{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-1.5">
          {/* Streak */}
          {streak > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-full bg-orange/10 text-orange text-sm font-bold"
            >
              <Flame size={14} /> {streak}
            </motion.div>
          )}

          {/* Level badge */}
          <Link href="/dashboard" className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary text-sm font-bold">
            <Trophy size={14} /> Lv.{level}
          </Link>

          {/* Parent Mode */}
          <Link
            href="/parent"
            onClick={() => playSound("click")}
            className="p-2 rounded-xl hover:bg-[var(--surface-alt)] transition-colors"
            aria-label="Parent Mode"
            title="Parent Mode"
          >
            <Shield size={18} />
          </Link>

          {/* Settings */}
          <Link
            href="/settings"
            onClick={() => playSound("click")}
            className="p-2 rounded-xl hover:bg-[var(--surface-alt)] transition-colors"
            aria-label="Settings"
          >
            <Settings size={18} />
          </Link>

          {/* Search */}
          <button
            onClick={() => { setSearchOpen(!searchOpen); playSound("click"); }}
            className="p-2 rounded-xl hover:bg-[var(--surface-alt)] transition-colors"
            aria-label="Search"
          >
            <Search size={18} />
          </button>

          {/* Sound toggle */}
          <button
            onClick={() => { toggleSound(); playSound("click"); }}
            className="p-2 rounded-xl hover:bg-[var(--surface-alt)] transition-colors"
            aria-label="Toggle sound"
          >
            {soundOn ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>

          {/* Theme toggle */}
          <button
            onClick={() => { toggleTheme(); playSound("click"); }}
            className="p-2 rounded-xl hover:bg-[var(--surface-alt)] transition-colors"
            aria-label="Toggle theme"
          >
            <motion.div
              key={theme}
              initial={{ rotate: -90, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
            </motion.div>
          </button>

          {/* Mobile menu */}
          <button
            onClick={() => { setMobileOpen(!mobileOpen); playSound("click"); }}
            className="p-2 rounded-xl hover:bg-[var(--surface-alt)] transition-colors lg:hidden"
            aria-label="Menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Search bar dropdown */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-[var(--border-color)] overflow-hidden"
          >
            <div className="max-w-2xl mx-auto px-4 py-3">
              <div className="flex items-center bg-[var(--surface-alt)] rounded-xl px-4 py-2 gap-2">
                <Search size={18} className="text-[var(--muted)]" />
                <input
                  type="text"
                  placeholder="Search lessons, stories, games..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-sm"
                  autoFocus
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile menu dropdown */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-[var(--border-color)] overflow-hidden lg:hidden"
          >
            <div className="px-4 py-4 space-y-1">
              {[...navLinks, { href: "/parent", label: "Parent Mode", icon: "🔒" }, { href: "/settings", label: "Settings", icon: "⚙️" }].map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    href={link.href}
                    onClick={handleNavClick}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-semibold transition-colors touch-target ${
                      pathname.startsWith(link.href)
                        ? "text-secondary bg-secondary/10"
                        : "hover:bg-[var(--surface-alt)]"
                    }`}
                  >
                    <span className="text-xl">{link.icon}</span>
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <div className="flex items-center gap-3 px-4 pt-3 border-t border-[var(--border-color)] mt-2">
                <div className="flex items-center gap-1 text-sm text-primary font-bold">
                  <Trophy size={14} /> Level {level}
                </div>
                {streak > 0 && (
                  <div className="flex items-center gap-1 text-sm text-orange font-bold">
                    <Flame size={14} /> {streak} day streak
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
