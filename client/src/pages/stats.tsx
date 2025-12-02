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
import { SEO } from "@/components/seo";
import { AdSenseInArticle, AdSenseAuto } from "@/components/adsense";

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
  const badge = badgeDefinitions[id];
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
  return (
    <>
      <SEO
        title="Statistiques - Vos Performances | QuizCraft AI"
        description="Consultez vos statistiques détaillées, vos badges et vos réalisations dans les quiz."
        keywords="statistiques, performances, badges, réalisations, quiz"
      />
      <StatsContent />
    </>
  );
}

function StatsContent() {
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
        <h1 className="font-heading text-3xl font-bold">Vos Statistiques</h1>
        <p className="mt-1 text-muted-foreground">
          Suivez vos performances et réalisations dans les quiz
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
                  <p className="text-sm text-muted-foreground">Niveau Actuel</p>
                  <p className="font-heading text-xl font-bold">
                    Niveau {userStats.level}
                  </p>
                </div>
              </div>
              <div className="flex-1 sm:max-w-xs">
                <div className="mb-2 flex justify-between text-sm">
                  <span className="text-muted-foreground">Progression XP</span>
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
          label="Quiz Terminés"
          value={userStats.totalQuizzes}
          gradient="bg-gradient-to-br from-yellow-500 to-orange-500"
        />
        <StatCard
          icon={CheckCircle}
          label="Questions Répondues"
          value={userStats.totalQuestions}
          subtext={`${userStats.correctAnswers} correctes`}
          gradient="bg-gradient-to-br from-green-500 to-teal-500"
        />
        <StatCard
          icon={Target}
          label="Précision"
          value={`${accuracy}%`}
          gradient="bg-gradient-to-br from-blue-500 to-cyan-500"
        />
        <StatCard
          icon={Flame}
          label="Meilleure Série"
          value={userStats.bestStreak}
          subtext={`Actuelle : ${userStats.currentStreak}`}
          gradient="bg-gradient-to-br from-red-500 to-pink-500"
        />
      </motion.div>

      {/* Advanced Stats */}
      {allResults.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          <StatCard
            icon={Timer}
            label="Temps Moyen par Quiz"
            value={`${Math.floor(averageTimePerQuiz / 60)}:${(averageTimePerQuiz % 60).toString().padStart(2, '0')}`}
            gradient="bg-gradient-to-br from-indigo-500 to-purple-500"
          />
          <StatCard
            icon={Star}
            label="Score Moyen"
            value={averageScore}
            subtext="points par quiz"
            gradient="bg-gradient-to-br from-amber-500 to-yellow-500"
          />
          <StatCard
            icon={CheckCircle}
            label="Scores Parfaits"
            value={perfectScores}
            subtext={`${perfectScoreRate}% de taux`}
            gradient="bg-gradient-to-br from-emerald-500 to-green-500"
          />
          <StatCard
            icon={Activity}
            label="Temps Total"
            value={`${Math.floor(totalTimeSpent / 60)}m`}
            subtext={`${allResults.length} quiz`}
            gradient="bg-gradient-to-br from-cyan-500 to-blue-500"
          />
        </motion.div>
      )}

      <div className="my-6 flex justify-center">
        <AdSenseAuto />
      </div>

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
                Précision dans le Temps
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
                      formatter={(value: number) => [`${value}%`, "Précision"]}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="accuracy" 
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--primary))", r: 4 }}
                      name="Précision"
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
                Historique des Scores
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
                      formatter={(value: number) => [value, "Score"]}
                    />
                    <Bar 
                      dataKey="score" 
                      fill="hsl(var(--primary))"
                      radius={[4, 4, 0, 0]}
                      name="Score"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Additional Charts */}
      {allResults.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="mb-8 grid gap-6 lg:grid-cols-2"
        >
          {xpProgression.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Progression XP
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={xpProgression}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="name" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "0.5rem",
                        }}
                        formatter={(value: number) => [value, "XP Total"]}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="xp" 
                        stroke="hsl(var(--primary))"
                        fill="hsl(var(--primary))"
                        fillOpacity={0.3}
                        name="XP Total"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {timeData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Temps Passé par Quiz
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={timeData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="name" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "0.5rem",
                        }}
                        formatter={(value: number) => {
                          const mins = Math.floor(value / 60);
                          const secs = value % 60;
                          return [`${mins}:${secs.toString().padStart(2, '0')}`, "Temps"];
                        }}
                      />
                      <Bar 
                        dataKey="time" 
                        fill="hsl(var(--primary))"
                        radius={[4, 4, 0, 0]}
                        name="Temps (secondes)"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      )}

      {/* Score Distribution */}
      {allResults.length > 0 && scoreDistribution.some(d => d.value > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Distribution des Scores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={scoreDistribution.filter(d => d.value > 0)}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {scoreDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
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
              Badges & Réalisations
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

      <div className="my-6 flex justify-center">
        <AdSenseInArticle />
      </div>
    </div>
  );
}
