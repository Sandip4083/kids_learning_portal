export const achievements = [
  { id: "first-quiz", name: "Quiz Starter", icon: "🌟", description: "Complete your first quiz", xpRequired: 0, condition: "quizzesCompleted >= 1" },
  { id: "math-whiz", name: "Math Whiz", icon: "🧮", description: "Score 100% on a math quiz", xpRequired: 0, condition: "mathPerfect >= 1" },
  { id: "science-star", name: "Science Star", icon: "🔬", description: "Score 100% on a science quiz", xpRequired: 0, condition: "sciencePerfect >= 1" },
  { id: "bookworm", name: "Bookworm", icon: "📚", description: "Read all 10 stories", xpRequired: 0, condition: "storiesRead >= 10" },
  { id: "game-master", name: "Game Master", icon: "🎮", description: "Play all 8 games", xpRequired: 0, condition: "gamesPlayed >= 8" },
  { id: "streak-3", name: "On Fire!", icon: "🔥", description: "Maintain a 3-day streak", xpRequired: 0, condition: "streak >= 3" },
  { id: "streak-7", name: "Week Warrior", icon: "⚔️", description: "Maintain a 7-day streak", xpRequired: 0, condition: "streak >= 7" },
  { id: "level-5", name: "Rising Star", icon: "⭐", description: "Reach Level 5", xpRequired: 500, condition: "level >= 5" },
  { id: "level-10", name: "Super Learner", icon: "🦸", description: "Reach Level 10", xpRequired: 1000, condition: "level >= 10" },
  { id: "xp-500", name: "XP Hunter", icon: "💎", description: "Earn 500 XP total", xpRequired: 500, condition: "totalXp >= 500" },
  { id: "xp-1000", name: "XP Master", icon: "👑", description: "Earn 1000 XP total", xpRequired: 1000, condition: "totalXp >= 1000" },
  { id: "daily-5", name: "Challenge Champ", icon: "🏆", description: "Complete 5 daily challenges", xpRequired: 0, condition: "dailyChallenges >= 5" },
  { id: "memory-king", name: "Memory King", icon: "🧠", description: "Win Memory Match under 60 seconds", xpRequired: 0, condition: "memoryFast" },
  { id: "word-wizard", name: "Word Wizard", icon: "📖", description: "Complete Hangman without hints", xpRequired: 0, condition: "hangmanNoHints" },
  { id: "perfect-ten", name: "Perfect Ten", icon: "💯", description: "Get 10/10 on any quiz", xpRequired: 0, condition: "perfectScore" },
  { id: "explorer", name: "Explorer", icon: "🗺️", description: "Visit every section of the portal", xpRequired: 0, condition: "sectionsVisited >= 4" },
];

export const levelThresholds = Array.from({ length: 50 }, (_, i) => ({
  level: i + 1,
  xpRequired: (i + 1) * 100,
  title: getLevelTitle(i + 1)
}));

function getLevelTitle(level) {
  if (level <= 5) return "Beginner";
  if (level <= 10) return "Explorer";
  if (level <= 15) return "Learner";
  if (level <= 20) return "Scholar";
  if (level <= 25) return "Expert";
  if (level <= 30) return "Master";
  if (level <= 40) return "Champion";
  return "Legend";
}

export const dailyChallenges = [
  { id: 1, type: "quiz", title: "Math Sprint", description: "Answer 5 math questions correctly", xpReward: 50, icon: "🏃" },
  { id: 2, type: "quiz", title: "Science Explorer", description: "Answer 5 science questions correctly", xpReward: 50, icon: "🔭" },
  { id: 3, type: "game", title: "Game Time", description: "Win any game", xpReward: 30, icon: "🎮" },
  { id: 4, type: "reading", title: "Story Time", description: "Read 2 stories", xpReward: 30, icon: "📖" },
  { id: 5, type: "quiz", title: "Perfect Score", description: "Get 100% on any quiz", xpReward: 75, icon: "💯" },
  { id: 6, type: "game", title: "Memory Master", description: "Complete Memory Match", xpReward: 40, icon: "🧠" },
  { id: 7, type: "mixed", title: "All-Rounder", description: "Complete a quiz AND play a game", xpReward: 60, icon: "🌈" },
];
