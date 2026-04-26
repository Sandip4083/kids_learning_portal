/**
 * AI-like Personalization Engine
 * Analyzes performance to recommend content and adjust difficulty
 */

/** 
 * Determine adaptive difficulty based on recent quiz performance
 * @param {Array} quizHistory - array of { category, score, total, date }
 * @param {string} category - "math" or "science"
 * @returns {"easy"|"medium"|"hard"}
 */
export function getAdaptiveDifficulty(quizHistory, category) {
  const recent = quizHistory
    .filter((q) => q.category === category)
    .slice(-5); // Last 5 quizzes

  if (recent.length < 2) return "easy";

  const avgAccuracy =
    recent.reduce((sum, q) => sum + q.score / q.total, 0) / recent.length;

  if (avgAccuracy >= 0.8) return "hard";
  if (avgAccuracy >= 0.5) return "medium";
  return "easy";
}

/**
 * Select questions based on adaptive difficulty
 * Mixes difficulties: 60% target, 20% easier, 20% harder
 */
export function selectAdaptiveQuestions(allQuestions, difficulty, count = 10) {
  const levels = ["easy", "medium", "hard"];
  const idx = levels.indexOf(difficulty);
  const easier = levels[Math.max(0, idx - 1)];
  const harder = levels[Math.min(2, idx + 1)];

  const targetQ = allQuestions.filter((q) => q.difficulty === difficulty);
  const easierQ = allQuestions.filter((q) => q.difficulty === easier);
  const harderQ = allQuestions.filter((q) => q.difficulty === harder);

  const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

  // 60% target difficulty, 20% easier, 20% harder
  const mainCount = Math.ceil(count * 0.6);
  const easyCount = Math.floor(count * 0.2);
  const hardCount = count - mainCount - easyCount;

  const selected = [
    ...shuffle(targetQ).slice(0, mainCount),
    ...shuffle(easierQ).slice(0, easyCount),
    ...shuffle(harderQ).slice(0, hardCount),
  ];

  // Fill remaining if not enough questions
  if (selected.length < count) {
    const remaining = shuffle(
      allQuestions.filter((q) => !selected.includes(q))
    ).slice(0, count - selected.length);
    selected.push(...remaining);
  }

  return shuffle(selected).slice(0, count);
}

/**
 * After quiz completion: determine if difficulty should change
 * @returns {{ newDifficulty: string, message: string }}
 */
export function adjustDifficulty(currentDifficulty, score, total) {
  const accuracy = score / total;
  const levels = ["easy", "medium", "hard"];
  const idx = levels.indexOf(currentDifficulty);

  if (accuracy >= 0.8 && idx < 2) {
    return {
      newDifficulty: levels[idx + 1],
      changed: true,
      message: `Great job! 🚀 Difficulty increased to ${levels[idx + 1].toUpperCase()}!`,
    };
  }
  if (accuracy < 0.4 && idx > 0) {
    return {
      newDifficulty: levels[idx - 1],
      changed: true,
      message: `No worries! 💪 Let's practice with ${levels[idx - 1].toUpperCase()} questions.`,
    };
  }
  return {
    newDifficulty: currentDifficulty,
    changed: false,
    message: null,
  };
}

/**
 * Generate "Recommended for You" content
 */
export function getRecommendations(gameState) {
  const recommendations = [];
  const { quizHistory, storiesRead, gamesPlayed, topicPerformance, streak } = gameState;

  // Recommend weak topics for practice
  const weakTopics = findWeakTopics(topicPerformance);
  if (weakTopics.length > 0) {
    recommendations.push({
      type: "practice",
      title: `Practice ${weakTopics[0].topic}`,
      subtitle: `Your accuracy is ${weakTopics[0].accuracy}% — let's improve it!`,
      icon: weakTopics[0].category === "math" ? "🧮" : "🔬",
      href: `/${weakTopics[0].category}`,
      priority: 1,
    });
  }

  // Recommend unread stories
  const totalStories = 10;
  if (storiesRead.length < totalStories) {
    recommendations.push({
      type: "story",
      title: "New Story Awaits!",
      subtitle: `You've read ${storiesRead.length}/${totalStories} stories`,
      icon: "📚",
      href: "/stories",
      priority: 2,
    });
  }

  // Recommend unplayed games
  const totalGames = 9; // Updated with Ludo
  if (gamesPlayed.length < totalGames) {
    recommendations.push({
      type: "game",
      title: "Try a New Game!",
      subtitle: `${totalGames - gamesPlayed.length} games you haven't played yet`,
      icon: "🎮",
      href: "/games",
      priority: 3,
    });
  }

  // Recommend quiz if none taken recently
  const lastQuiz = quizHistory[quizHistory.length - 1];
  if (!lastQuiz || daysSince(lastQuiz.date) >= 1) {
    recommendations.push({
      type: "quiz",
      title: "Time for a Quiz!",
      subtitle: "Keep your skills sharp with a quick quiz",
      icon: "🎯",
      href: "/math",
      priority: 2,
    });
  }

  // Streak motivation
  if (streak >= 3) {
    recommendations.push({
      type: "streak",
      title: `${streak}-Day Streak! 🔥`,
      subtitle: "Keep it going! Don't break your streak!",
      icon: "🔥",
      href: "/dashboard",
      priority: 0,
    });
  }

  return recommendations.sort((a, b) => a.priority - b.priority).slice(0, 4);
}

function findWeakTopics(topicPerformance) {
  const weak = [];
  Object.entries(topicPerformance || {}).forEach(([category, topics]) => {
    Object.entries(topics).forEach(([topic, data]) => {
      if (data.total >= 2) {
        const accuracy = Math.round((data.correct / data.total) * 100);
        if (accuracy < 60) {
          weak.push({ category, topic, accuracy });
        }
      }
    });
  });
  return weak.sort((a, b) => a.accuracy - b.accuracy);
}

function daysSince(dateStr) {
  if (!dateStr) return 999;
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
}
