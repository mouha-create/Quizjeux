// Badge generation system for Groups/Guildes - supports badges collectifs

export type GroupBadgeCategory = 
  | "members" 
  | "quizzes" 
  | "points" 
  | "score" 
  | "activity"
  | "special";

export type GroupBadgeIcon = 
  | "Trophy" | "Star" | "Flame" | "Zap" | "Award" | "Clock" | "Sparkles" | "Brain"
  | "Target" | "TrendingUp" | "CheckCircle" | "BarChart3" | "Activity" | "Timer"
  | "Medal" | "Crown" | "Gem" | "Shield" | "Sword" | "Book" | "GraduationCap"
  | "Rocket" | "Lightbulb" | "Heart" | "Diamond" | "Coins" | "Gift" | "Users";

export interface GroupBadgeRule {
  id: string;
  category: GroupBadgeCategory;
  name: string;
  description: string;
  icon: GroupBadgeIcon;
  condition: (group: any) => boolean;
  tier?: number;
}

// Badge tiers for groups
export const groupBadgeTiers = {
  members: [1, 5, 10, 15, 20, 25, 30, 40, 50, 75, 100, 150, 200],
  quizzes: [1, 5, 10, 25, 50, 100, 250, 500, 1000],
  points: [1000, 5000, 10000, 25000, 50000, 100000, 250000, 500000, 1000000],
  averageScore: [50, 60, 70, 75, 80, 85, 90, 95, 98, 100],
};

// Icon names for different categories
const groupCategoryIcons: Record<GroupBadgeCategory, GroupBadgeIcon[]> = {
  members: ["Users", "Trophy", "Award", "Crown"],
  quizzes: ["Target", "CheckCircle", "Book", "Star"],
  points: ["Coins", "Gem", "Diamond", "Crown"],
  score: ["Target", "Star", "Medal", "Crown"],
  activity: ["Activity", "TrendingUp", "Zap", "Rocket"],
  special: ["Gift", "Heart", "Sparkles", "Crown"],
};

// Name templates for different tiers
const groupTierNames: Record<string, string[]> = {
  members: ["Petit Groupe", "Groupe Actif", "Grande Guilde", "Guilde Légendaire", "Empire"],
  quizzes: ["Débutants", "Apprentis", "Experts", "Maîtres", "Légendes"],
  points: ["Collecteurs", "Chasseurs", "Gatherers", "Maîtres", "Légendes"],
  score: ["Précis", "Accurate", "Sharpshooters", "Marksmen", "Parfaits"],
};

// Generate group badge rules
export function generateGroupBadgeRules(): GroupBadgeRule[] {
  const rules: GroupBadgeRule[] = [];

  // Member count badges
  groupBadgeTiers.members.forEach((count, index) => {
    rules.push({
      id: `group_members_${count}`,
      category: "members",
      name: groupTierNames.members[Math.min(index, groupTierNames.members.length - 1)] || `${count} Membres`,
      description: `Avoir ${count} membre${count > 1 ? 's' : ''} dans le groupe`,
      icon: groupCategoryIcons.members[index % groupCategoryIcons.members.length],
      condition: (group) => (group.memberCount || 0) >= count,
      tier: index + 1,
    });
  });

  // Total quizzes badges
  groupBadgeTiers.quizzes.forEach((count, index) => {
    rules.push({
      id: `group_quizzes_${count}`,
      category: "quizzes",
      name: groupTierNames.quizzes[Math.min(index, groupTierNames.quizzes.length - 1)] || `${count} Quiz`,
      description: `Partager ${count} quiz${count > 1 ? 's' : ''} dans le groupe`,
      icon: groupCategoryIcons.quizzes[index % groupCategoryIcons.quizzes.length],
      condition: (group) => (group.totalQuizzes || 0) >= count,
      tier: index + 1,
    });
  });

  // Total points badges
  groupBadgeTiers.points.forEach((points, index) => {
    rules.push({
      id: `group_points_${points}`,
      category: "points",
      name: groupTierNames.points[Math.min(index, groupTierNames.points.length - 1)] || `${points} Points`,
      description: `Accumuler ${points.toLocaleString()} points collectifs`,
      icon: groupCategoryIcons.points[index % groupCategoryIcons.points.length],
      condition: (group) => (group.totalPoints || 0) >= points,
      tier: index + 1,
    });
  });

  // Average score badges
  groupBadgeTiers.averageScore.forEach((percent, index) => {
    rules.push({
      id: `group_score_${percent}`,
      category: "score",
      name: groupTierNames.score[Math.min(index, groupTierNames.score.length - 1)] || `${percent}% Moyenne`,
      description: `Maintenir une moyenne de ${percent}%`,
      icon: groupCategoryIcons.score[index % groupCategoryIcons.score.length],
      condition: (group) => (group.averageScore || 0) >= percent,
      tier: index + 1,
    });
  });

  // Special badges
  rules.push(
    {
      id: "group_first",
      category: "special",
      name: "Premier Groupe",
      description: "Créer votre premier groupe",
      icon: "Trophy",
      condition: (group) => true, // Always earned when group is created
    },
    {
      id: "group_elite",
      category: "special",
      name: "Élite",
      description: "Groupe avec moyenne > 90% et 50+ membres",
      icon: "Crown",
      condition: (group) => (group.averageScore || 0) >= 90 && (group.memberCount || 0) >= 50,
    },
    {
      id: "group_legend",
      category: "special",
      name: "Légende",
      description: "Groupe dans le top 10 des points",
      icon: "Crown",
      condition: (group) => false, // Will be calculated based on ranking
    },
    {
      id: "group_invincible",
      category: "special",
      name: "Invincible",
      description: "1000 quiz complétés ensemble",
      icon: "Shield",
      condition: (group) => (group.totalQuizzes || 0) >= 1000,
    },
    {
      id: "group_creators",
      category: "special",
      name: "Créateurs",
      description: "50 quiz créés par les membres",
      icon: "Sparkles",
      condition: (group) => (group.totalQuizzes || 0) >= 50,
    }
  );

  return rules;
}

// Get all group badge definitions
export function getAllGroupBadges() {
  const rules = generateGroupBadgeRules();
  const badges: Record<string, { id: string; name: string; description: string; icon: GroupBadgeIcon }> = {};
  
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

