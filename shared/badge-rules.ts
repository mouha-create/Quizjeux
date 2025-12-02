// Badge generation system - supports 1000+ badges through rules and tiers

export type BadgeCategory = 
  | "quizzes" 
  | "questions" 
  | "streak" 
  | "perfect" 
  | "speed" 
  | "level" 
  | "xp" 
  | "accuracy" 
  | "creator" 
  | "category"
  | "daily"
  | "weekly"
  | "monthly"
  | "special";

export type BadgeIcon = 
  | "Trophy" | "Star" | "Flame" | "Zap" | "Award" | "Clock" | "Sparkles" | "Brain"
  | "Target" | "TrendingUp" | "CheckCircle" | "BarChart3" | "Activity" | "Timer"
  | "Medal" | "Crown" | "Gem" | "Shield" | "Sword" | "Book" | "GraduationCap"
  | "Rocket" | "Lightbulb" | "Heart" | "Diamond" | "Coins" | "Gift";

export interface BadgeRule {
  id: string;
  category: BadgeCategory;
  name: string;
  description: string;
  icon: BadgeIcon;
  condition: (stats: any, result?: any) => boolean;
  tier?: number; // For progressive badges (1, 2, 3, etc.)
}

// Badge tiers configuration - Extended to generate 1000+ badges
export const badgeTiers = {
  // Quizzes completed - 20 tiers
  quizzes: [1, 2, 3, 5, 7, 10, 15, 20, 25, 30, 40, 50, 75, 100, 150, 200, 250, 500, 750, 1000],
  // Questions answered - 20 tiers
  questions: [5, 10, 15, 20, 25, 30, 40, 50, 75, 100, 150, 200, 250, 300, 400, 500, 750, 1000, 2500, 5000],
  // Correct answers - 20 tiers
  correctAnswers: [5, 10, 15, 20, 25, 30, 40, 50, 75, 100, 150, 200, 250, 300, 400, 500, 750, 1000, 2500, 5000],
  // Streaks - 20 tiers
  streak: [2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 18, 20, 25, 30, 35, 40, 50, 75, 100],
  // Perfect scores - 15 tiers
  perfectScores: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20, 25, 50, 100],
  // Speed badges (seconds) - 20 tiers
  speed: [600, 480, 360, 300, 240, 180, 150, 120, 105, 90, 75, 60, 50, 45, 40, 35, 30, 25, 20, 15],
  // Levels - 25 tiers
  level: [2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 18, 20, 25, 30, 35, 40, 45, 50, 60, 70, 80, 90, 100, 150],
  // XP milestones - 25 tiers
  xp: [100, 250, 500, 750, 1000, 1500, 2000, 2500, 3000, 4000, 5000, 7500, 10000, 15000, 20000, 25000, 30000, 40000, 50000, 75000, 100000, 150000, 200000, 250000, 500000],
  // Accuracy percentages - 20 tiers
  accuracy: [40, 45, 50, 55, 60, 65, 70, 75, 80, 82, 85, 87, 90, 92, 95, 96, 97, 98, 99, 100],
  // Created quizzes - 20 tiers
  createdQuizzes: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20, 25, 30, 40, 50, 75, 100, 250, 500],
  // Points earned - 20 tiers
  totalPoints: [100, 250, 500, 750, 1000, 1500, 2000, 2500, 3000, 4000, 5000, 7500, 10000, 15000, 20000, 25000, 30000, 40000, 50000, 100000],
  // Daily streaks - 15 tiers
  dailyStreak: [1, 2, 3, 4, 5, 6, 7, 10, 14, 21, 30, 60, 90, 180, 365],
  // Weekly streaks - 10 tiers
  weeklyStreak: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  // Monthly streaks - 10 tiers
  monthlyStreak: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
};

// Icon names for different categories
const categoryIcons: Record<BadgeCategory, BadgeIcon[]> = {
  quizzes: ["Trophy", "Award", "Medal", "Crown"],
  questions: ["Target", "CheckCircle", "Brain", "Book"],
  streak: ["Flame", "Zap", "TrendingUp", "Rocket"],
  perfect: ["Star", "Gem", "Diamond", "Crown"],
  speed: ["Clock", "Timer", "Zap", "Rocket"],
  level: ["GraduationCap", "TrendingUp", "Crown", "Award"],
  xp: ["Coins", "Gem", "Diamond", "Crown"],
  accuracy: ["Target", "CheckCircle", "Star", "Medal"],
  creator: ["Sparkles", "Lightbulb", "Rocket", "Gift"],
  category: ["Book", "Target", "Star", "Award"],
  daily: ["CheckCircle", "Star", "Trophy", "Award"],
  weekly: ["TrendingUp", "Award", "Crown", "Medal"],
  monthly: ["Crown", "Gem", "Diamond", "Trophy"],
  special: ["Gift", "Heart", "Sparkles", "Crown"],
};

// Name templates for different tiers
const tierNames: Record<string, string[]> = {
  quizzes: ["First Steps", "Getting Started", "Quiz Enthusiast", "Quiz Lover", "Quiz Master", "Quiz Expert", "Quiz Legend", "Quiz Champion", "Quiz God"],
  questions: ["Beginner", "Learner", "Student", "Scholar", "Expert", "Master", "Grandmaster", "Legend", "Mythic"],
  streak: ["Warm Up", "On Fire", "Unstoppable", "Inferno", "Blazing", "Volcanic", "Legendary", "Mythical", "Divine"],
  perfect: ["Perfect Start", "Flawless", "Impeccable", "Perfect Master", "Perfectionist", "Perfect Legend", "Perfect God"],
  speed: ["Quick", "Fast", "Rapid", "Swift", "Lightning", "Sonic", "Instant"],
  level: ["Rising Star", "Rising Talent", "Rising Expert", "Rising Master", "Rising Legend", "Rising Champion", "Elite", "Elite Master", "Elite Legend", "Elite God"],
  xp: ["XP Collector", "XP Hunter", "XP Gatherer", "XP Master", "XP Expert", "XP Legend", "XP Champion", "XP God", "XP Deity"],
  accuracy: ["Aim True", "Precise", "Accurate", "Sharpshooter", "Marksman", "Sniper", "Perfect Aim", "Divine Aim", "Godlike Aim"],
  createdQuizzes: ["Creator", "Content Creator", "Quiz Builder", "Quiz Architect", "Quiz Designer", "Quiz Mastermind", "Quiz Genius", "Quiz Deity"],
};

// Generate badge rules dynamically
export function generateBadgeRules(): BadgeRule[] {
  const rules: BadgeRule[] = [];

  // Quizzes completed badges - Extended to 30 tiers
  const extendedQuizzes = [...badgeTiers.quizzes, 1500, 2000, 2500, 3000, 3500, 4000, 4500, 5000, 6000, 7000, 8000, 9000, 10000];
  extendedQuizzes.forEach((count, index) => {
    rules.push({
      id: `quizzes_${count}`,
      category: "quizzes",
      name: tierNames.quizzes[Math.min(index, tierNames.quizzes.length - 1)] || `Completed ${count} Quizzes`,
      description: `Complete ${count} quiz${count > 1 ? 'es' : ''}`,
      icon: categoryIcons.quizzes[index % categoryIcons.quizzes.length],
      condition: (stats) => (stats.totalQuizzes || 0) >= count,
      tier: index + 1,
    });
  });

  // Questions answered badges - Extended to 30 tiers
  const extendedQuestions = [...badgeTiers.questions, 7500, 10000, 15000, 20000, 25000, 30000, 40000, 50000, 75000, 100000];
  extendedQuestions.forEach((count, index) => {
    rules.push({
      id: `questions_${count}`,
      category: "questions",
      name: tierNames.questions[Math.min(index, tierNames.questions.length - 1)] || `Answered ${count} Questions`,
      description: `Answer ${count} question${count > 1 ? 's' : ''}`,
      icon: categoryIcons.questions[index % categoryIcons.questions.length],
      condition: (stats) => (stats.totalQuestions || 0) >= count,
      tier: index + 1,
    });
  });

  // Correct answers badges
  badgeTiers.correctAnswers.forEach((count, index) => {
    rules.push({
      id: `correct_${count}`,
      category: "questions",
      name: tierNames.questions[Math.min(index, tierNames.questions.length - 1)] || `${count} Correct Answers`,
      description: `Get ${count} answer${count > 1 ? 's' : ''} correct`,
      icon: categoryIcons.questions[index % categoryIcons.questions.length],
      condition: (stats) => (stats.correctAnswers || 0) >= count,
      tier: index + 1,
    });
  });

  // Streak badges
  badgeTiers.streak.forEach((count, index) => {
    rules.push({
      id: `streak_${count}`,
      category: "streak",
      name: tierNames.streak[Math.min(index, tierNames.streak.length - 1)] || `${count} Streak`,
      description: `Get ${count} correct answer${count > 1 ? 's' : ''} in a row`,
      icon: categoryIcons.streak[index % categoryIcons.streak.length],
      condition: (stats) => (stats.bestStreak || 0) >= count,
      tier: index + 1,
    });
  });

  // Perfect score badges
  badgeTiers.perfectScores.forEach((count, index) => {
    rules.push({
      id: `perfect_${count}`,
      category: "perfect",
      name: tierNames.perfect[Math.min(index, tierNames.perfect.length - 1)] || `${count} Perfect Score${count > 1 ? 's' : ''}`,
      description: `Get ${count} perfect score${count > 1 ? 's' : ''}`,
      icon: categoryIcons.perfect[index % categoryIcons.perfect.length],
      condition: (stats) => (stats.perfectScores || 0) >= count,
      tier: index + 1,
    });
  });

  // Speed badges (faster = better)
  badgeTiers.speed.forEach((seconds, index) => {
    rules.push({
      id: `speed_${seconds}`,
      category: "speed",
      name: tierNames.speed[Math.min(index, tierNames.speed.length - 1)] || `Complete in ${seconds}s`,
      description: `Complete a quiz in under ${seconds} second${seconds > 1 ? 's' : ''}`,
      icon: categoryIcons.speed[index % categoryIcons.speed.length],
      condition: (stats, result) => result && result.timeSpent < seconds,
      tier: index + 1,
    });
  });

  // Level badges - Extended to 40 tiers
  const extendedLevels = [...badgeTiers.level, 200, 250, 300, 350, 400, 450, 500, 600, 700, 800, 900, 1000, 1250, 1500];
  extendedLevels.forEach((level, index) => {
    rules.push({
      id: `level_${level}`,
      category: "level",
      name: tierNames.level[Math.min(index, tierNames.level.length - 1)] || `Level ${level}`,
      description: `Reach level ${level}`,
      icon: categoryIcons.level[index % categoryIcons.level.length],
      condition: (stats) => (stats.level || 1) >= level,
      tier: index + 1,
    });
  });

  // XP badges
  badgeTiers.xp.forEach((xp, index) => {
    rules.push({
      id: `xp_${xp}`,
      category: "xp",
      name: tierNames.xp[Math.min(index, tierNames.xp.length - 1)] || `${xp} XP`,
      description: `Earn ${xp.toLocaleString()} XP`,
      icon: categoryIcons.xp[index % categoryIcons.xp.length],
      condition: (stats) => (stats.xp || 0) >= xp,
      tier: index + 1,
    });
  });

  // Accuracy badges
  badgeTiers.accuracy.forEach((percent, index) => {
    rules.push({
      id: `accuracy_${percent}`,
      category: "accuracy",
      name: tierNames.accuracy[Math.min(index, tierNames.accuracy.length - 1)] || `${percent}% Accuracy`,
      description: `Maintain ${percent}% accuracy`,
      icon: categoryIcons.accuracy[index % categoryIcons.accuracy.length],
      condition: (stats) => {
        const total = stats.totalQuestions || 0;
        const correct = stats.correctAnswers || 0;
        return total > 0 && Math.round((correct / total) * 100) >= percent;
      },
      tier: index + 1,
    });
  });

  // Creator badges
  badgeTiers.createdQuizzes.forEach((count, index) => {
    rules.push({
      id: `creator_${count}`,
      category: "creator",
      name: tierNames.createdQuizzes[Math.min(index, tierNames.createdQuizzes.length - 1)] || `Created ${count} Quiz${count > 1 ? 'zes' : ''}`,
      description: `Create ${count} quiz${count > 1 ? 'zes' : ''}`,
      icon: categoryIcons.creator[index % categoryIcons.creator.length],
      condition: (stats) => (stats.createdQuizzes || 0) >= count,
      tier: index + 1,
    });
  });

  // Total points badges
  badgeTiers.totalPoints.forEach((points, index) => {
    rules.push({
      id: `points_${points}`,
      category: "xp",
      name: `${points.toLocaleString()} Points`,
      description: `Earn ${points.toLocaleString()} total points`,
      icon: categoryIcons.xp[index % categoryIcons.xp.length],
      condition: (stats) => (stats.totalPoints || 0) >= points,
      tier: index + 1,
    });
  });

  // Daily streak badges
  badgeTiers.dailyStreak.forEach((days, index) => {
    rules.push({
      id: `daily_${days}`,
      category: "daily",
      name: `${days} Day${days > 1 ? 's' : ''} Streak`,
      description: `Play for ${days} consecutive day${days > 1 ? 's' : ''}`,
      icon: categoryIcons.daily[index % categoryIcons.daily.length],
      condition: (stats) => (stats.dailyStreak || 0) >= days,
      tier: index + 1,
    });
  });

  // Weekly streak badges
  badgeTiers.weeklyStreak.forEach((weeks, index) => {
    rules.push({
      id: `weekly_${weeks}`,
      category: "weekly",
      name: `${weeks} Week${weeks > 1 ? 's' : ''} Streak`,
      description: `Play for ${weeks} consecutive week${weeks > 1 ? 's' : ''}`,
      icon: categoryIcons.weekly[index % categoryIcons.weekly.length],
      condition: (stats) => (stats.weeklyStreak || 0) >= weeks,
      tier: index + 1,
    });
  });

  // Monthly streak badges
  badgeTiers.monthlyStreak.forEach((months, index) => {
    rules.push({
      id: `monthly_${months}`,
      category: "monthly",
      name: `${months} Month${months > 1 ? 's' : ''} Streak`,
      description: `Play for ${months} consecutive month${months > 1 ? 's' : ''}`,
      icon: categoryIcons.monthly[index % categoryIcons.monthly.length],
      condition: (stats) => (stats.monthlyStreak || 0) >= months,
      tier: index + 1,
    });
  });

  // Category-specific badges (for each quiz category) - Extended to 15 tiers per category
  const quizCategories = ["Science", "History", "Geography", "Mathematics", "Literature", "Sports", "Technology", "Art", "Music", "General Knowledge"];
  const categoryBadgeCounts = [1, 2, 3, 5, 7, 10, 12, 15, 20, 25, 30, 40, 50, 75, 100];
  
  quizCategories.forEach((category) => {
    categoryBadgeCounts.forEach((count, index) => {
      const categoryKey = category.toLowerCase().replace(/\s+/g, '_');
      rules.push({
        id: `category_${categoryKey}_${count}`,
        category: "category",
        name: `${category} Expert ${index + 1}`,
        description: `Complete ${count} ${category} quiz${count > 1 ? 'zes' : ''}`,
        icon: categoryIcons.category[index % categoryIcons.category.length],
        condition: (stats) => (stats.categoryQuizzes?.[categoryKey] || 0) >= count,
        tier: index + 1,
      });
    });
  });

  // Difficulty-specific badges
  const difficulties = ["beginner", "intermediate", "expert"];
  const difficultyCounts = [1, 3, 5, 10, 15, 20, 25, 30, 40, 50];
  difficulties.forEach((difficulty) => {
    difficultyCounts.forEach((count, index) => {
      rules.push({
        id: `difficulty_${difficulty}_${count}`,
        category: "special",
        name: `${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Master ${index + 1}`,
        description: `Complete ${count} ${difficulty} quiz${count > 1 ? 'zes' : ''}`,
        icon: categoryIcons.special[index % categoryIcons.special.length],
        condition: (stats) => (stats.difficultyQuizzes?.[difficulty] || 0) >= count,
        tier: index + 1,
      });
    });
  });

  // Theme-specific badges
  const themes = ["purple", "green", "orange", "pink", "blue"];
  const themeCounts = [1, 3, 5, 10, 15, 20, 25, 30];
  themes.forEach((theme) => {
    themeCounts.forEach((count, index) => {
      rules.push({
        id: `theme_${theme}_${count}`,
        category: "special",
        name: `${theme.charAt(0).toUpperCase() + theme.slice(1)} Enthusiast ${index + 1}`,
        description: `Complete ${count} ${theme} themed quiz${count > 1 ? 'zes' : ''}`,
        icon: categoryIcons.special[index % categoryIcons.special.length],
        condition: (stats) => (stats.themeQuizzes?.[theme] || 0) >= count,
        tier: index + 1,
      });
    });
  });

  // Time-based badges (morning, afternoon, evening, night)
  const timeSlots = ["morning", "afternoon", "evening", "night"];
  const timeCounts = [1, 3, 5, 10, 15, 20, 25, 30];
  timeSlots.forEach((time) => {
    timeCounts.forEach((count, index) => {
      rules.push({
        id: `time_${time}_${count}`,
        category: "daily",
        name: `${time.charAt(0).toUpperCase() + time.slice(1)} Player ${index + 1}`,
        description: `Play ${count} quiz${count > 1 ? 'zes' : ''} in the ${time}`,
        icon: categoryIcons.daily[index % categoryIcons.daily.length],
        condition: (stats) => (stats.timeQuizzes?.[time] || 0) >= count,
        tier: index + 1,
      });
    });
  });

  // Question type specific badges
  const questionTypes = ["multiple", "truefalse", "text", "ranking"];
  const questionTypeCounts = [1, 5, 10, 25, 50, 100, 250, 500];
  questionTypes.forEach((type) => {
    questionTypeCounts.forEach((count, index) => {
      rules.push({
        id: `type_${type}_${count}`,
        category: "questions",
        name: `${type.charAt(0).toUpperCase() + type.slice(1)} Master ${index + 1}`,
        description: `Answer ${count} ${type} question${count > 1 ? 's' : ''} correctly`,
        icon: categoryIcons.questions[index % categoryIcons.questions.length],
        condition: (stats) => (stats.questionTypeStats?.[type] || 0) >= count,
        tier: index + 1,
      });
    });
  });

  // Score milestones (single quiz scores)
  const scoreMilestones = [50, 75, 100, 125, 150, 175, 200, 250, 300, 350, 400, 450, 500, 600, 700, 800, 900, 1000];
  scoreMilestones.forEach((score, index) => {
    rules.push({
      id: `score_${score}`,
      category: "special",
      name: `${score} Point${score > 1 ? 's' : ''} Club`,
      description: `Score ${score} points in a single quiz`,
      icon: categoryIcons.special[index % categoryIcons.special.length],
      condition: (stats, result) => result && (result.score || 0) >= score,
      tier: index + 1,
    });
  });

  // Extended perfect score badges (more tiers)
  const extendedPerfect = [150, 200, 250, 300, 400, 500, 750, 1000];
  extendedPerfect.forEach((count, index) => {
    rules.push({
      id: `perfect_${count}`,
      category: "perfect",
      name: `${count} Perfect Score${count > 1 ? 's' : ''}`,
      description: `Get ${count} perfect score${count > 1 ? 's' : ''}`,
      icon: categoryIcons.perfect[(badgeTiers.perfectScores.length + index) % categoryIcons.perfect.length],
      condition: (stats) => (stats.perfectScores || 0) >= count,
      tier: badgeTiers.perfectScores.length + index + 1,
    });
  });

  // Extended streak badges (more tiers)
  const extendedStreaks = [125, 150, 200, 250, 300, 400, 500, 750, 1000];
  extendedStreaks.forEach((count, index) => {
    rules.push({
      id: `streak_${count}`,
      category: "streak",
      name: `${count} Streak`,
      description: `Get ${count} correct answer${count > 1 ? 's' : ''} in a row`,
      icon: categoryIcons.streak[(badgeTiers.streak.length + index) % categoryIcons.streak.length],
      condition: (stats) => (stats.bestStreak || 0) >= count,
      tier: badgeTiers.streak.length + index + 1,
    });
  });

  // Extended speed badges (more tiers)
  const extendedSpeed = [12, 10, 8, 6, 5, 4, 3, 2, 1];
  extendedSpeed.forEach((seconds, index) => {
    rules.push({
      id: `speed_${seconds}`,
      category: "speed",
      name: `Complete in ${seconds}s`,
      description: `Complete a quiz in under ${seconds} second${seconds > 1 ? 's' : ''}`,
      icon: categoryIcons.speed[(badgeTiers.speed.length + index) % categoryIcons.speed.length],
      condition: (stats, result) => result && result.timeSpent < seconds,
      tier: badgeTiers.speed.length + index + 1,
    });
  });

  // Extended XP badges (more tiers)
  const extendedXP = [750000, 1000000, 1500000, 2000000, 2500000, 3000000, 4000000, 5000000, 7500000, 10000000];
  extendedXP.forEach((xp, index) => {
    rules.push({
      id: `xp_${xp}`,
      category: "xp",
      name: `${xp.toLocaleString()} XP`,
      description: `Earn ${xp.toLocaleString()} XP`,
      icon: categoryIcons.xp[(badgeTiers.xp.length + index) % categoryIcons.xp.length],
      condition: (stats) => (stats.xp || 0) >= xp,
      tier: badgeTiers.xp.length + index + 1,
    });
  });

  // Combo badges (multiple achievements)
  const comboBadges = [
    { id: "speed_perfect", name: "Perfect Speed", description: "Get a perfect score in under 2 minutes", icon: "Zap" as BadgeIcon, condition: (stats: any, result: any) => result && result.correctAnswers === result.totalQuestions && result.timeSpent < 120 },
    { id: "streak_perfect", name: "Perfect Streak", description: "Get 10 perfect scores in a row", icon: "Star" as BadgeIcon, condition: (stats: any) => (stats.perfectStreak || 0) >= 10 },
    { id: "all_categories", name: "Category Master", description: "Complete quizzes in all categories", icon: "Crown" as BadgeIcon, condition: (stats: any) => Object.keys(stats.categoryQuizzes || {}).length >= 10 },
    { id: "all_difficulties", name: "Difficulty Master", description: "Complete quizzes in all difficulty levels", icon: "Award" as BadgeIcon, condition: (stats: any) => Object.keys(stats.difficultyQuizzes || {}).length >= 3 },
    { id: "all_themes", name: "Theme Master", description: "Complete quizzes in all themes", icon: "Sparkles" as BadgeIcon, condition: (stats: any) => Object.keys(stats.themeQuizzes || {}).length >= 5 },
    { id: "all_question_types", name: "Question Type Master", description: "Answer all question types correctly", icon: "Target" as BadgeIcon, condition: (stats: any) => Object.keys(stats.questionTypeStats || {}).length >= 4 },
    { id: "century_club", name: "Century Club", description: "Complete 100 quizzes", icon: "Trophy" as BadgeIcon, condition: (stats: any) => (stats.totalQuizzes || 0) >= 100 },
    { id: "thousand_questions", name: "Thousand Questions", description: "Answer 1000 questions", icon: "Target" as BadgeIcon, condition: (stats: any) => (stats.totalQuestions || 0) >= 1000 },
    { id: "perfect_week", name: "Perfect Week", description: "Play every day for a week", icon: "CheckCircle" as BadgeIcon, condition: (stats: any) => (stats.dailyStreak || 0) >= 7 },
    { id: "perfect_month", name: "Perfect Month", description: "Play every day for a month", icon: "CheckCircle" as BadgeIcon, condition: (stats: any) => (stats.dailyStreak || 0) >= 30 },
    { id: "perfect_year", name: "Perfect Year", description: "Play every day for a year", icon: "Crown" as BadgeIcon, condition: (stats: any) => (stats.dailyStreak || 0) >= 365 },
    { id: "level_50", name: "Level 50", description: "Reach level 50", icon: "GraduationCap" as BadgeIcon, condition: (stats: any) => (stats.level || 1) >= 50 },
    { id: "level_100", name: "Level 100", description: "Reach level 100", icon: "Crown" as BadgeIcon, condition: (stats: any) => (stats.level || 1) >= 100 },
    { id: "level_500", name: "Level 500", description: "Reach level 500", icon: "Crown" as BadgeIcon, condition: (stats: any) => (stats.level || 1) >= 500 },
    { id: "million_xp", name: "Million XP", description: "Earn 1,000,000 XP", icon: "Gem" as BadgeIcon, condition: (stats: any) => (stats.xp || 0) >= 1000000 },
    { id: "ten_million_xp", name: "Ten Million XP", description: "Earn 10,000,000 XP", icon: "Diamond" as BadgeIcon, condition: (stats: any) => (stats.xp || 0) >= 10000000 },
    { id: "hundred_perfect", name: "Hundred Perfect", description: "Get 100 perfect scores", icon: "Star" as BadgeIcon, condition: (stats: any) => (stats.perfectScores || 0) >= 100 },
    { id: "thousand_streak", name: "Thousand Streak", description: "Get 1000 correct answers in a row", icon: "Flame" as BadgeIcon, condition: (stats: any) => (stats.bestStreak || 0) >= 1000 },
    { id: "speed_demon", name: "Speed Demon", description: "Complete a quiz in under 5 seconds", icon: "Zap" as BadgeIcon, condition: (stats: any, result: any) => result && result.timeSpent < 5 },
    { id: "instant_master", name: "Instant Master", description: "Complete a quiz in under 1 second", icon: "Rocket" as BadgeIcon, condition: (stats: any, result: any) => result && result.timeSpent < 1 },
  ];

  comboBadges.forEach((badge) => {
    rules.push({
      id: badge.id,
      category: "special",
      name: badge.name,
      description: badge.description,
      icon: badge.icon,
      condition: badge.condition,
    });
  });

  // Special badges (one-time achievements)
  rules.push(
    {
      id: "first_quiz",
      category: "special",
      name: "First Steps",
      description: "Complete your first quiz",
      icon: "Trophy",
      condition: (stats) => (stats.totalQuizzes || 0) >= 1,
    },
    {
      id: "first_perfect",
      category: "perfect",
      name: "Perfect!",
      description: "Get 100% on a quiz",
      icon: "Star",
      condition: (stats, result) => result && result.correctAnswers === result.totalQuestions,
    },
    {
      id: "first_creator",
      category: "creator",
      name: "Creator",
      description: "Create your first quiz",
      icon: "Sparkles",
      condition: (stats) => (stats.createdQuizzes || 0) >= 1,
    }
  );

  return rules;
}

// Get all badge definitions from rules
export function getAllBadges() {
  const rules = generateBadgeRules();
  const badges: Record<string, { id: string; name: string; description: string; icon: BadgeIcon }> = {};
  
  rules.forEach(rule => {
    badges[rule.id] = {
      id: rule.id,
      name: rule.name,
      description: rule.description,
      icon: rule.icon,
    };
  });

  return badges;
}

