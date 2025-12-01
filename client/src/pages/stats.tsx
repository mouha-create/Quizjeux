import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { 
  Trophy, Target, Brain, Flame, Star, Award, Clock, Zap, 
  Sparkles, TrendingUp, CheckCircle, BarChart3, Activity, Timer
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell,
  Legend
} from "recharts";
import type { UserStats, QuizResult, Quiz } from "@shared/schema";
import { badges as badgeDefinitions } from "@shared/schema";

const iconMap: Record<string, typeof Trophy> = {
  Trophy,
  Star,
  Flame,
  Zap,
  Award,
  Clock,
  Sparkles,
  Brain,
};

function StatCard({ 
  icon: Icon, 
  label, 
  value, 
  subtext,
  gradient 
}: { 
  icon: typeof Trophy;
  label: string;
  value: string | number;
  subtext?: string;
  gradient?: string;
}) {
  return (
    <Card className="hover-elevate">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${gradient || "bg-gradient-to-br from-purple-500 to-blue-500"}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground" translate="no">{label}</p>
            <p className="font-heading text-2xl font-bold" translate="no">{value}</p>
            {subtext && (
              <p className="text-xs text-muted-foreground" translate="no">{subtext}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function BadgeCard({ 
  id, 
  earned 
}: { 
  id: string;
  earned: boolean;
}) {
  const badge = badgeDefinitions[id as keyof typeof badgeDefinitions];
  if (!badge) return null;
  
  const Icon = iconMap[badge.icon] || Trophy;
  
  return (
    <div 
      className={`flex flex-col items-center gap-2 rounded-lg border p-4 text-center transition-all ${
        earned 
          ? "bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30" 
          : "opacity-50 grayscale"
      }`}
    >
      <div className={`flex h-12 w-12 items-center justify-center rounded-full ${
        earned ? "bg-gradient-to-br from-purple-500 to-blue-500" : "bg-muted"
      }`}>
        <Icon className={`h-6 w-6 ${earned ? "text-white" : "text-muted-foreground"}`} />
      </div>
      <div>
        <p className="font-medium">{badge.name}</p>
        <p className="text-xs text-muted-foreground">{badge.description}</p>
      </div>
    </div>
  );
}

function StatsLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="mt-2 h-5 w-72" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-lg" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-6 w-16" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function Stats() {
  const { data: stats, isLoading: statsLoading } = useQuery<UserStats>({
    queryKey: ["/api/stats"],
  });

  const { data: results } = useQuery<QuizResult[]>({
    queryKey: ["/api/results"],
  });

  if (statsLoading) return <StatsLoading />;

  const userStats = stats || {
    totalQuizzes: 0,
    totalQuestions: 0,
    correctAnswers: 0,
    totalPoints: 0,
    level: 1,
    xp: 0,
    currentStreak: 0,
    bestStreak: 0,
    badges: [],
    quizHistory: [],
  };

  const accuracy = userStats.totalQuestions > 0 && typeof userStats.correctAnswers === 'number' && typeof userStats.totalQuestions === 'number'
    ? Math.round((userStats.correctAnswers / userStats.totalQuestions) * 100) 
    : 0;

  const xpForNextLevel = userStats.level * 1000;
  const xpProgress = (userStats.xp / xpForNextLevel) * 100;

  // Generate chart data from results
  const allResults = (results || []).sort((a, b) => 
    new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime()
  );

  // Last 7 quizzes for accuracy over time
  const chartData = allResults.slice(-7).map((result, i) => {
    const acc = result.totalQuestions > 0 && typeof result.correctAnswers === 'number' && typeof result.totalQuestions === 'number'
      ? Math.round((result.correctAnswers / result.totalQuestions) * 100)
      : 0;
    return {
      name: `Quiz ${i + 1}`,
      accuracy: acc,
      score: result.score || 0,
      timeSpent: result.timeSpent || 0,
      date: new Date(result.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    };
  });

  // XP progression over time (last 10 quizzes)
  const xpProgression = allResults.slice(-10).map((result, i) => {
    const xpGained = result.score || 0;
    const cumulativeXp = allResults.slice(0, allResults.indexOf(result) + 1)
      .reduce((sum, r) => sum + (r.score || 0), 0);
    return {
      name: `Q${i + 1}`,
      xp: cumulativeXp,
      xpGained: xpGained,
    };
  });

  // Time spent per quiz
  const timeData = allResults.slice(-7).map((result, i) => {
    const minutes = Math.floor((result.timeSpent || 0) / 60);
    const seconds = (result.timeSpent || 0) % 60;
    return {
      name: `Quiz ${i + 1}`,
      time: result.timeSpent || 0,
      timeFormatted: `${minutes}:${seconds.toString().padStart(2, '0')}`,
    };
  });

  // Score distribution (0-25, 26-50, 51-75, 76-100)
  const scoreDistribution = [
    { name: '0-25%', value: 0, color: '#ef4444' },
    { name: '26-50%', value: 0, color: '#f59e0b' },
    { name: '51-75%', value: 0, color: '#3b82f6' },
    { name: '76-100%', value: 0, color: '#10b981' },
  ];
  
  allResults.forEach(result => {
    const acc = result.totalQuestions > 0
      ? Math.round((result.correctAnswers / result.totalQuestions) * 100)
      : 0;
    if (acc <= 25) scoreDistribution[0].value++;
    else if (acc <= 50) scoreDistribution[1].value++;
    else if (acc <= 75) scoreDistribution[2].value++;
    else scoreDistribution[3].value++;
  });

  // Calculate advanced stats
  const totalTimeSpent = allResults.reduce((sum, r) => sum + (r.timeSpent || 0), 0);
  const averageTimePerQuiz = allResults.length > 0 ? Math.round(totalTimeSpent / allResults.length) : 0;
  const averageScore = allResults.length > 0
    ? Math.round(allResults.reduce((sum, r) => sum + (r.score || 0), 0) / allResults.length)
    : 0;
  const perfectScores = allResults.filter(r => 
    r.correctAnswers === r.totalQuestions
  ).length;
  const perfectScoreRate = allResults.length > 0
    ? Math.round((perfectScores / allResults.length) * 100)
    : 0;

  const allBadgeIds = Object.keys(badgeDefinitions);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="font-heading text-3xl font-bold">Your Stats</h1>
        <p className="mt-1 text-muted-foreground">
          Track your quiz performance and achievements
        </p>
      </motion.div>

      {/* Level Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-500">
                  <span className="font-heading text-2xl font-bold text-white">
                    {userStats.level}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Current Level</p>
                  <p className="font-heading text-xl font-bold">
                    Level {userStats.level}
                  </p>
                </div>
              </div>
              <div className="flex-1 sm:max-w-xs">
                <div className="mb-2 flex justify-between text-sm">
                  <span className="text-muted-foreground">XP Progress</span>
                  <span className="font-medium">
                    {userStats.xp} / {xpForNextLevel}
                  </span>
                </div>
                <Progress value={xpProgress} className="h-3" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <StatCard
          icon={Trophy}
          label="Quizzes Completed"
          value={userStats.totalQuizzes}
          gradient="bg-gradient-to-br from-yellow-500 to-orange-500"
        />
        <StatCard
          icon={CheckCircle}
          label="Questions Answered"
          value={userStats.totalQuestions}
          subtext={`${userStats.correctAnswers} correct`}
          gradient="bg-gradient-to-br from-green-500 to-teal-500"
        />
        <StatCard
          icon={Target}
          label="Accuracy"
          value={`${accuracy}%`}
          gradient="bg-gradient-to-br from-blue-500 to-cyan-500"
        />
        <StatCard
          icon={Flame}
          label="Best Streak"
          value={userStats.bestStreak}
          subtext={`Current: ${userStats.currentStreak}`}
          gradient="bg-gradient-to-br from-red-500 to-pink-500"
        />
      </motion.div>

      {/* Charts */}
      {chartData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8 grid gap-6 lg:grid-cols-2"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Accuracy Over Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="name" className="text-xs" />
                    <YAxis domain={[0, 100]} className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "0.5rem",
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="accuracy" 
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--primary))" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Score History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="name" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "0.5rem",
                      }}
                    />
                    <Bar 
                      dataKey="score" 
                      fill="hsl(var(--primary))"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Badges */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Badges & Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
              {allBadgeIds.map((id) => (
                <BadgeCard
                  key={id}
                  id={id}
                  earned={userStats.badges.includes(id)}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
