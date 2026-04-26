/**
 * Analytics Engine
 * Tracks time spent, quiz accuracy, daily/weekly/monthly aggregations
 */

/** Calculate accuracy for a topic from quiz history */
export function getTopicAccuracy(quizHistory, category) {
  const filtered = quizHistory.filter((q) => q.category === category);
  if (filtered.length === 0) return 0;
  const totalCorrect = filtered.reduce((sum, q) => sum + q.score, 0);
  const totalQuestions = filtered.reduce((sum, q) => sum + q.total, 0);
  return totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
}

/** Get accuracy per sub-topic */
export function getSubTopicAccuracy(topicPerformance, category) {
  const topics = topicPerformance?.[category] || {};
  return Object.entries(topics).map(([topic, data]) => ({
    topic,
    correct: data.correct,
    total: data.total,
    accuracy: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
  }));
}

/** Get strong and weak topics */
export function getStrongWeakTopics(topicPerformance) {
  const allTopics = [];
  Object.entries(topicPerformance || {}).forEach(([category, topics]) => {
    Object.entries(topics).forEach(([topic, data]) => {
      if (data.total >= 2) {
        const accuracy = Math.round((data.correct / data.total) * 100);
        allTopics.push({ category, topic, accuracy, total: data.total });
      }
    });
  });

  allTopics.sort((a, b) => b.accuracy - a.accuracy);

  return {
    strong: allTopics.filter((t) => t.accuracy >= 70).slice(0, 5),
    weak: allTopics.filter((t) => t.accuracy < 50).slice(0, 5),
  };
}

/** Get weekly progress data (last 7 days) */
export function getWeeklyProgress(quizHistory) {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];
    const dayLabel = date.toLocaleDateString("en", { weekday: "short" });

    const dayQuizzes = quizHistory.filter((q) => q.date?.startsWith(dateStr));
    const totalXP = dayQuizzes.reduce((sum, q) => sum + q.score * 10, 0);
    const quizCount = dayQuizzes.length;

    days.push({ date: dateStr, label: dayLabel, xp: totalXP, quizzes: quizCount });
  }
  return days;
}

/** Get monthly progress data (last 30 days, grouped by week) */
export function getMonthlyProgress(quizHistory) {
  const weeks = [];
  for (let w = 3; w >= 0; w--) {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - (w + 1) * 7);
    const weekEnd = new Date();
    weekEnd.setDate(weekEnd.getDate() - w * 7);

    const weekQuizzes = quizHistory.filter((q) => {
      const d = new Date(q.date);
      return d >= weekStart && d < weekEnd;
    });

    const totalXP = weekQuizzes.reduce((sum, q) => sum + q.score * 10, 0);
    weeks.push({
      label: `Week ${4 - w}`,
      xp: totalXP,
      quizzes: weekQuizzes.length,
      accuracy:
        weekQuizzes.length > 0
          ? Math.round(
              (weekQuizzes.reduce((s, q) => s + q.score, 0) /
                weekQuizzes.reduce((s, q) => s + q.total, 0)) *
                100
            )
          : 0,
    });
  }
  return weeks;
}

/** Calculate total time spent (formatted) */
export function formatTimeSpent(seconds) {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${m}m`;
}

/** Get streak calendar data (last 12 weeks) */
export function getStreakCalendarData(streakCalendar = []) {
  const weeks = [];
  const today = new Date();

  for (let w = 11; w >= 0; w--) {
    const week = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(today);
      date.setDate(date.getDate() - (w * 7 + (6 - d)));
      const dateStr = date.toISOString().split("T")[0];
      week.push({
        date: dateStr,
        active: streakCalendar.includes(dateStr),
        isToday: dateStr === today.toISOString().split("T")[0],
      });
    }
    weeks.push(week);
  }
  return weeks;
}
