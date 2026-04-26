"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { useSound } from "@/contexts/SoundContext";
import { useGame } from "@/contexts/GameContext";
import { useEffect, useState } from "react";
import { ArrowRight, Sparkles, BookOpen, Trophy, Gamepad2, Star, Users, Shield, Brain, Zap, CheckCircle } from "lucide-react";

const categories = [
  { href: "/math", title: "Math", subtitle: "Numbers, puzzles & adaptive quizzes!", icon: "🧮", gradient: "from-sky to-primary", delay: 0.1 },
  { href: "/science", title: "Science", subtitle: "Explore the world with AI!", icon: "🔬", gradient: "from-secondary to-sky-dark", delay: 0.2 },
  { href: "/stories", title: "Stories", subtitle: "AI-generated tales & morals!", icon: "📚", gradient: "from-accent to-orange", delay: 0.3 },
  { href: "/games", title: "Games", subtitle: "Play vs AI & earn XP!", icon: "🎮", gradient: "from-pink to-danger", delay: 0.4 },
];

const features = [
  { icon: <Brain size={24} />, title: "Smart Learning", desc: "AI adapts difficulty to your skill level", color: "text-primary" },
  { icon: <Zap size={24} />, title: "Gamification", desc: "Earn XP, level up, unlock achievements", color: "text-accent-dark" },
  { icon: <Shield size={24} />, title: "Parent Dashboard", desc: "PIN-protected progress monitoring", color: "text-secondary" },
  { icon: <Trophy size={24} />, title: "Leaderboard", desc: "Compete with learners worldwide", color: "text-pink" },
  { icon: <Star size={24} />, title: "Daily Rewards", desc: "Login daily for XP & spin the wheel", color: "text-orange" },
  { icon: <BookOpen size={24} />, title: "Rich Content", desc: "45+ quizzes, 10 stories, 9 games", color: "text-sky-dark" },
];

const howItWorks = [
  { step: "1", title: "Choose a Topic", desc: "Pick from Math, Science, Stories, or Games", icon: "🎯" },
  { step: "2", title: "Learn & Practice", desc: "AI adapts content to your skill level", icon: "🧠" },
  { step: "3", title: "Earn & Grow", desc: "Collect XP, unlock badges, climb the leaderboard!", icon: "🚀" },
];

const testimonials = [
  { name: "Priya M.", role: "Parent", text: "My daughter loves the adaptive quizzes! She went from struggling with math to getting perfect scores.", avatar: "👩", rating: 5 },
  { name: "Arjun K.", role: "Student, Age 10", text: "The games are so fun! I play Ludo with the computer every day. I've reached Level 15!", avatar: "🧒", rating: 5 },
  { name: "Sneha R.", role: "Parent", text: "The parent dashboard gives me peace of mind. I can track exactly what my child is learning.", avatar: "👩‍💼", rating: 5 },
  { name: "Rohan S.", role: "Student, Age 8", text: "I love generating AI stories! Each one is different. The space stories are my favorite! 🚀", avatar: "👦", rating: 5 },
];

const floatingEmojis = ["⭐", "🌈", "🚀", "🎯", "💡", "🌟", "🎪", "🦋"];

function AnimatedCounter({ target, suffix = "" }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const duration = 2000;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target]);
  return <span className="number-counter">{count.toLocaleString()}{suffix}</span>;
}

export default function HomePage() {
  const { playSound } = useSound();
  const { visitSection, level, xp, streak } = useGame();

  useEffect(() => { visitSection("home"); }, [visitSection]);

  return (
    <div className="relative overflow-hidden">
      {/* Floating decorations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {floatingEmojis.map((emoji, i) => (
          <motion.span
            key={i}
            className="absolute text-2xl opacity-15"
            style={{ left: `${10 + (i * 12) % 90}%`, top: `${5 + (i * 17) % 80}%` }}
            animate={{ y: [0, -15, 0], rotate: [0, 10, -10, 0] }}
            transition={{ duration: 3 + i * 0.5, repeat: Infinity, delay: i * 0.3 }}
          >
            {emoji}
          </motion.span>
        ))}
      </div>

      {/* ======== HERO SECTION ======== */}
      <section className="relative px-4 pt-16 pb-24">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-bold mb-6"
          >
            <Sparkles size={16} />
            AI-Powered Learning Platform for Kids
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-black mb-6 leading-tight"
          >
            Learn, Play &{" "}
            <span className="gradient-text">Grow!</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-lg sm:text-xl text-[var(--muted)] max-w-2xl mx-auto mb-10"
          >
            The smartest learning portal for kids — with adaptive quizzes, AI-generated stories,
            fun games, and a parent dashboard. Start your learning adventure today! 🚀
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap justify-center gap-4"
          >
            <Link
              href="/math"
              onClick={() => playSound("click")}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-primary to-pink text-white font-bold text-lg shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all hover:-translate-y-1 touch-target"
            >
              Start Learning <ArrowRight size={20} />
            </Link>
            <Link
              href="/games"
              onClick={() => playSound("click")}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-[var(--surface)] border-2 border-[var(--border-color)] font-bold text-lg hover:border-primary hover:text-primary transition-all hover:-translate-y-1 touch-target"
            >
              🎮 Play Games
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ======== STATS COUNTER ======== */}
      <section className="px-4 pb-16">
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: <Users size={20} />, label: "Active Learners", value: 10000, suffix: "+" },
            { icon: <BookOpen size={20} />, label: "Quiz Questions", value: 75, suffix: "+" },
            { icon: <Gamepad2 size={20} />, label: "Fun Games", value: 9, suffix: "" },
            { icon: <Trophy size={20} />, label: "Achievements", value: 16, suffix: "" },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border-color)] shadow-sm"
            >
              <div className="flex justify-center mb-2 text-primary">{stat.icon}</div>
              <div className="text-3xl font-black">
                <AnimatedCounter target={stat.value} suffix={stat.suffix} />
              </div>
              <div className="text-xs text-[var(--muted)] font-semibold">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ======== CATEGORY CARDS ======== */}
      <section className="px-4 pb-20">
        <div className="max-w-5xl mx-auto">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-3xl font-black text-center mb-10"
          >
            Choose Your <span className="gradient-text">Adventure</span> ✨
          </motion.h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((cat) => (
              <motion.div
                key={cat.href}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: cat.delay }}
              >
                <Link
                  href={cat.href}
                  onClick={() => playSound("pop")}
                  className={`block group relative rounded-3xl overflow-hidden bg-gradient-to-br ${cat.gradient} p-1`}
                >
                  <div className="bg-[var(--surface)] rounded-[22px] p-6 h-full transition-all group-hover:bg-transparent group-hover:text-white">
                    <motion.span
                      className="text-5xl block mb-4"
                      whileHover={{ scale: 1.2, rotate: [0, -10, 10, 0] }}
                      transition={{ duration: 0.3 }}
                    >
                      {cat.icon}
                    </motion.span>
                    <h3 className="text-xl font-extrabold mb-1">{cat.title}</h3>
                    <p className="text-sm text-[var(--muted)] group-hover:text-white/80">{cat.subtitle}</p>
                    <div className="mt-4 flex items-center gap-1 text-sm font-bold text-primary group-hover:text-white">
                      Explore <ArrowRight size={14} />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ======== HOW IT WORKS ======== */}
      <section className="px-4 pb-20 bg-[var(--surface-alt)]/50">
        <div className="max-w-4xl mx-auto py-16">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-3xl font-black text-center mb-12"
          >
            How It <span className="gradient-text">Works</span> 🎯
          </motion.h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {howItWorks.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="text-center"
              >
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-pink flex items-center justify-center mx-auto mb-4 text-4xl shadow-lg">
                  {item.icon}
                </div>
                <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white text-sm font-black mb-3">
                  {item.step}
                </div>
                <h3 className="text-lg font-extrabold mb-2">{item.title}</h3>
                <p className="text-sm text-[var(--muted)]">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ======== FEATURES GRID ======== */}
      <section className="px-4 pb-20">
        <div className="max-w-5xl mx-auto">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-3xl font-black text-center mb-12"
          >
            Packed with <span className="gradient-text">Premium</span> Features ⚡
          </motion.h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4 }}
                className="bg-[var(--surface)] rounded-2xl border border-[var(--border-color)] p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className={`mb-3 ${feat.color}`}>{feat.icon}</div>
                <h3 className="font-extrabold mb-1">{feat.title}</h3>
                <p className="text-sm text-[var(--muted)]">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ======== TESTIMONIALS ======== */}
      <section className="px-4 pb-20 bg-[var(--surface-alt)]/50">
        <div className="max-w-5xl mx-auto py-16">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-3xl font-black text-center mb-12"
          >
            Loved by <span className="gradient-text">Families</span> 💕
          </motion.h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-[var(--surface)] rounded-2xl border border-[var(--border-color)] p-6 shadow-sm"
              >
                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} size={14} className="text-accent fill-accent" />
                  ))}
                </div>
                <p className="text-sm text-[var(--muted)] mb-4 leading-relaxed">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{t.avatar}</span>
                  <div>
                    <p className="text-sm font-bold">{t.name}</p>
                    <p className="text-xs text-[var(--muted)]">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ======== CTA SECTION ======== */}
      <section className="px-4 pb-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto bg-gradient-to-r from-primary via-pink to-accent rounded-3xl p-8 sm:p-12 text-center text-white relative overflow-hidden"
        >
          <div className="absolute inset-0 opacity-10">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-white rounded-full"
                style={{ left: `${(i * 17) % 100}%`, top: `${(i * 23) % 100}%` }}
                animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 2 + (i % 3), repeat: Infinity, delay: (i % 2) }}
              />
            ))}
          </div>
          <h3 className="text-3xl sm:text-4xl font-black mb-4 relative z-10">
            🎯 Ready to Start Learning?
          </h3>
          <p className="text-white/80 text-lg mb-6 relative z-10">
            Join thousands of kids who are having fun while learning. It&apos;s free!
          </p>
          <div className="flex flex-wrap justify-center gap-4 relative z-10">
            <Link
              href="/dashboard"
              onClick={() => playSound("click")}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white text-primary font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 touch-target"
            >
              Get Started <ArrowRight size={20} />
            </Link>
            <Link
              href="/parent"
              onClick={() => playSound("click")}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white/20 text-white font-bold text-lg hover:bg-white/30 transition-all hover:-translate-y-1 touch-target"
            >
              <Shield size={20} /> Parent Mode
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
