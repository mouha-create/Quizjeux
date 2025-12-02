import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { 
  User, Mail, Calendar, Trophy, Target, Brain, Flame, Star, Award, 
  Clock, Zap, TrendingUp, CheckCircle, Edit2, Play, BarChart3, Sparkles
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, BarChart, Bar 
} from "recharts";
import { useAuth } from "@/lib/auth-context";
import { SEO } from "@/components/seo";
import { AdSenseInArticle, AdSenseAuto } from "@/components/adsense";
import type { UserStats, QuizResult, Quiz } from "@shared/schema";
import { badges as badgeDefinitions } from "@shared/schema";
import { format } from "date-fns";

const iconMap: Record<string, typeof Trophy> = {
  Trophy,
  Star,
  Flame,
  Zap,
  Award,
  Clock,
  Sparkles: Sparkles,
  Brain,
};

function ProfileLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <Skeleton className="h-32 w-full" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-12 w-12 rounded-lg mb-4" />
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-6 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

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

export default function Profile() {
  return (
    <>
      <SEO
        title="Profil - Mon Compte | QuizCraft AI"
        description="Consultez votre profil, vos statistiques et vos réalisations."
        keywords="profil, compte, statistiques, badges"
      />
      <ProfileContent />
    </>
  );
}

function ProfileContent() {
  const { user } = useAuth();
  const { data: stats, isLoading: statsLoading } = useQuery<UserStats>({
    queryKey: ["/api/stats"],
  });

  const { data: results } = useQuery<QuizResult[]>({
    queryKey: ["/api/results"],
  });

  const { data: quizzes } = useQuery<Quiz[]>({
    queryKey: ["/api/quizzes"],
  });

  if (statsLoading) return <ProfileLoading />;

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
  const xpProgress = userStats.xp > 0 && xpForNextLevel > 0
    ? Math.min((userStats.xp / xpForNextLevel) * 100, 100)
    : 0;

  // Generate chart data from results
  const chartData = (results || []).slice(-7).map((result, i) => {
    const acc = result.totalQuestions > 0 && typeof result.correctAnswers === 'number' && typeof result.totalQuestions === 'number'
      ? Math.round((result.correctAnswers / result.totalQuestions) * 100)
      : 0;
    return {
      name: `Quiz ${i + 1}`,
      accuracy: acc,
      score: result.score || 0,
    };
  });

  // Get recent quiz history with quiz details
  const recentResults = (results || []).slice(0, 10).map(result => {
    const quiz = quizzes?.find(q => q.id === result.quizId);
    return { ...result, quiz };
  });

  const allBadgeIds = Object.keys(badgeDefinitions);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="my-6 flex justify-center">
        <AdSenseAuto />
      </div>

      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <Card className="border-primary/30 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20">
          <CardContent className="p-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-6">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-500 text-4xl font-bold text-white">
                  {user?.username?.charAt(0).toUpperCase() || "U"}
                </div>
                <div>
                  <h1 className="font-heading text-3xl font-bold">{user?.username || "User"}</h1>
                  <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span>{user?.email || "No email"}</span>
                    </div>
                    {user?.createdAt && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>Membre depuis {format(new Date(user.createdAt), "MMMM yyyy")}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <Link href="/library">
                  <Button variant="outline" className="gap-2">
                    <Edit2 className="h-4 w-4" />
                    Mes Quiz
                  </Button>
                </Link>
                <Link href="/stats">
                  <Button variant="outline" className="gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Statistiques Détaillées
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Level Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Progression de Niveau
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-heading text-2xl font-bold">Level {userStats.level}</p>
                  <p className="text-sm text-muted-foreground">
                    {userStats.xp.toLocaleString()} / {xpForNextLevel.toLocaleString()} XP
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-heading text-2xl font-bold text-primary">
                    {Math.round(xpProgress)}%
                  </p>
                  <p className="text-sm text-muted-foreground">vers le Niveau {userStats.level + 1}</p>
                </div>
              </div>
              <Progress value={xpProgress} className="h-3" />
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

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-8"
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Historique Récent des Quiz
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentResults.length > 0 ? (
              <div className="space-y-3">
                {recentResults.map((result) => {
                  const acc = result.totalQuestions > 0 && typeof result.correctAnswers === 'number' && typeof result.totalQuestions === 'number'
                    ? Math.round((result.correctAnswers / result.totalQuestions) * 100)
                    : 0;
                  return (
                    <div
                      key={result.id}
                      className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-500">
                            <Play className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="font-medium">{result.quiz?.title || "Quiz Inconnu"}</p>
                            <p className="text-sm text-muted-foreground">
                              {result.completedAt && format(new Date(result.completedAt), "MMM dd, yyyy 'at' HH:mm")}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 text-right">
                        <div>
                          <p className="font-heading text-lg font-bold" translate="no">{acc}%</p>
                          <p className="text-xs text-muted-foreground">Précision</p>
                        </div>
                        <div>
                          <p className="font-heading text-lg font-bold" translate="no">{result.score}</p>
                          <p className="text-xs text-muted-foreground">Score</p>
                        </div>
                        {result.quiz && (
                          <Link href={`/play/${result.quiz.id}`}>
                            <Button variant="outline" size="sm" className="gap-2">
                              <Play className="h-4 w-4" />
                              Rejouer
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 text-center">
                <Play className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-4 font-medium">Aucun historique de quiz pour le moment</p>
                <p className="text-sm text-muted-foreground">
                  Commencez à jouer aux quiz pour voir votre historique ici
                </p>
                <Link href="/library">
                  <Button className="mt-6 gap-2">
                    <Play className="h-4 w-4" />
                    Parcourir les Quiz
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Performance Chart */}
      {chartData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <Card>
            <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Performance dans le Temps
            </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="accuracy" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    name="Accuracy %"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Badges */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Badges & Réalisations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {allBadgeIds.map((badgeId) => (
                <BadgeCard
                  key={badgeId}
                  id={badgeId}
                  earned={userStats.badges.includes(badgeId)}
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

