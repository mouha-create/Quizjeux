import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Trophy, Medal, Target, TrendingUp, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { SEO } from "@/components/seo";
import { AdSenseInArticle, AdSenseAuto } from "@/components/adsense";
import type { LeaderboardEntry } from "@shared/schema";

function getRankIcon(rank: number) {
  switch (rank) {
    case 1:
      return <Trophy className="h-5 w-5 text-yellow-500" />;
    case 2:
      return <Medal className="h-5 w-5 text-gray-400" />;
    case 3:
      return <Medal className="h-5 w-5 text-amber-600" />;
    default:
      return <span className="flex h-5 w-5 items-center justify-center text-sm font-medium text-muted-foreground">{rank}</span>;
  }
}

function LeaderboardRow({ 
  entry, 
  isCurrentUser 
}: { 
  entry: LeaderboardEntry;
  isCurrentUser: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: entry.rank * 0.05 }}
      className={`flex items-center gap-4 rounded-lg p-4 transition-colors ${
        isCurrentUser 
          ? "bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30" 
          : "hover:bg-muted/50"
      }`}
    >
      <div className="flex h-10 w-10 items-center justify-center">
        {getRankIcon(entry.rank)}
      </div>
      
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p className={`font-medium ${isCurrentUser ? "text-primary" : ""}`}>
            {entry.name}
            {isCurrentUser && (
              <span className="ml-2 text-sm text-muted-foreground">(Vous)</span>
            )}
          </p>
          {entry.type === "group" && (
            <Badge variant="secondary" className="gap-1">
              <Users className="h-3 w-3" />
              Groupe
            </Badge>
          )}
          {entry.type === "group" && entry.groupId && (
            <Link href={`/groups/${entry.groupId}`}>
              <span className="text-xs text-muted-foreground hover:text-primary cursor-pointer">
                Voir →
              </span>
            </Link>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-8 text-right">
        <div>
          <p className="font-heading text-lg font-bold">{entry.score.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">Points</p>
        </div>
        <div>
          <p className="font-heading text-lg font-bold">{entry.quizzes}</p>
          <p className="text-xs text-muted-foreground">Quiz</p>
        </div>
        <div>
          <p className="font-heading text-lg font-bold" translate="no">
            {typeof entry.accuracy === 'number' && !isNaN(entry.accuracy) ? entry.accuracy : 0}%
          </p>
          <p className="text-xs text-muted-foreground" translate="no">Précision</p>
        </div>
      </div>
    </motion.div>
  );
}

function LeaderboardSkeleton() {
  return (
    <div className="space-y-2">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 rounded-lg p-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-5 flex-1" />
          <div className="flex gap-8">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-12" />
            <Skeleton className="h-8 w-14" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Leaderboard() {
  return (
    <>
      <SEO
        title="Classement - Leaderboard | QuizCraft AI"
        description="Consultez le classement des meilleurs joueurs et groupes de quiz."
        keywords="classement, leaderboard, meilleurs joueurs, quiz"
      />
      <LeaderboardContent />
    </>
  );
}

function LeaderboardContent() {
  const { data: leaderboard, isLoading } = useQuery<LeaderboardEntry[]>({
    queryKey: ["/api/leaderboard"],
  });

  const entries = leaderboard || [];
  const currentUser = entries.find((e) => e.name === "You");

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="my-6 flex justify-center">
        <AdSenseAuto />
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 text-center"
      >
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-orange-500">
          <Trophy className="h-8 w-8 text-white" />
        </div>
        <h1 className="font-heading text-3xl font-bold">Classement</h1>
        <p className="mt-1 text-muted-foreground">
          Voyez comment vous vous classez par rapport aux autres maîtres du quiz
        </p>
      </motion.div>

      {/* Current User Position (if not in top 10) */}
      {currentUser && currentUser.rank > 10 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6"
        >
          <Card className="border-primary/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <span className="font-heading text-lg font-bold text-primary">
                      #{currentUser.rank}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">Votre Position</p>
                    <p className="text-sm text-muted-foreground">
                      Continuez à jouer pour monter dans le classement !
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-heading text-xl font-bold">{currentUser.score.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Points Totaux</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Leaderboard Table */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          <CardTitle>Meilleurs Joueurs</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Header Row */}
          <div className="mb-2 flex items-center gap-4 border-b px-4 pb-3 text-sm text-muted-foreground">
            <div className="w-10">Rang</div>
            <div className="flex-1">Joueur</div>
            <div className="grid w-64 grid-cols-3 gap-8 text-right">
              <div>Points</div>
              <div>Quiz</div>
              <div>Précision</div>
            </div>
          </div>

          {isLoading ? (
            <LeaderboardSkeleton />
          ) : entries.length > 0 ? (
            <div className="space-y-1">
              {entries.slice(0, 10).map((entry) => (
                <LeaderboardRow
                  key={entry.rank}
                  entry={entry}
                  isCurrentUser={entry.name === "You"}
                />
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <Target className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 font-medium">Aucun joueur pour le moment</p>
              <p className="text-sm text-muted-foreground">
                Complétez un quiz pour apparaître dans le classement
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="my-6 flex justify-center">
        <AdSenseInArticle />
      </div>
    </div>
    </>
  );
}
