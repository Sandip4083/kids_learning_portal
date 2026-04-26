"use client";
import Link from "next/link";
import { Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-[var(--border-color)] bg-[var(--surface)]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🎓</span>
              <span className="text-lg font-extrabold gradient-text">Kids&apos; Learning Portal</span>
            </div>
            <p className="text-sm text-[var(--muted)]">
              Making learning fun and interactive for kids everywhere!
            </p>
          </div>

          {/* Learn */}
          <div>
            <h4 className="font-bold text-sm mb-3">Learn</h4>
            <div className="space-y-2">
              <Link href="/math" className="block text-sm text-[var(--muted)] hover:text-primary transition-colors">🧮 Math</Link>
              <Link href="/science" className="block text-sm text-[var(--muted)] hover:text-primary transition-colors">🔬 Science</Link>
              <Link href="/stories" className="block text-sm text-[var(--muted)] hover:text-primary transition-colors">📚 Stories</Link>
            </div>
          </div>

          {/* Play */}
          <div>
            <h4 className="font-bold text-sm mb-3">Play</h4>
            <div className="space-y-2">
              <Link href="/games" className="block text-sm text-[var(--muted)] hover:text-primary transition-colors">🎮 Games</Link>
              <Link href="/dashboard" className="block text-sm text-[var(--muted)] hover:text-primary transition-colors">📊 Dashboard</Link>
              <Link href="/leaderboard" className="block text-sm text-[var(--muted)] hover:text-primary transition-colors">🏆 Leaderboard</Link>
            </div>
          </div>

          {/* Stats */}
          <div>
            <h4 className="font-bold text-sm mb-3">Quick Stats</h4>
            <div className="space-y-2 text-sm text-[var(--muted)]">
              <p>📖 10 Stories</p>
              <p>🎮 8 Games</p>
              <p>📝 25+ Quiz Questions</p>
              <p>🔬 5 Science Topics</p>
            </div>
          </div>
        </div>

        <div className="border-t border-[var(--border-color)] pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-[var(--muted)]">
          <p>© {new Date().getFullYear()} Kids&apos; Learning Portal. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Designed with <Heart size={14} className="text-danger fill-danger" /> by Sandip
          </p>
        </div>
      </div>
    </footer>
  );
}
