import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Trophy, Medal, Target, Users, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import type { LeaderboardEntry, Group } from "@shared/schema";

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
}: { 
  entry: LeaderboardEntry;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: entry.rank * 0.05 }}
      className="flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50"
    >
      <div className="flex h-10 w-10 items-center justify-center">
        {getRankIcon(entry.rank)}
      </div>
      
      <div className="flex-1">
        <p className="font-medium">{entry.name}</p>
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
          <p className="font-heading text-lg font-bold">
            {typeof entry.accuracy === 'number' && !isNaN(entry.accuracy) ? entry.accuracy : 0}%
          </p>
          <p className="text-xs text-muted-foreground">Précision</p>
        </div>
      </div>
    </motion.div>
  );
}

export default function GroupLeaderboard() {
  const { id } = useParams<{ id: string }>();

  const { data: group, isLoading: groupLoading } = useQuery<Group>({
    queryKey: ["/api/groups", id],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/groups/${id}`);
      if (!response.ok) throw new Error("Group not found");
      return response.json();
    },
    enabled: !!id,
  });

  const { data: leaderboard, isLoading: leaderboardLoading } = useQuery<LeaderboardEntry[]>({
    queryKey: ["/api/groups", id, "leaderboard"],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/groups/${id}/leaderboard`);
      return response.json();
    },
    enabled: !!id,
  });

  if (groupLoading || leaderboardLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <Skeleton className="mb-8 h-8 w-64" />
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <h2 className="font-heading text-2xl font-semibold">Groupe non trouvé</h2>
            <Link href="/groups">
              <Button className="mt-6">Retour aux Groupes</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const entries = leaderboard || [];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-4 mb-4">
          <Link href={`/groups/${id}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="font-heading text-3xl font-bold">Classement du Groupe</h1>
            <p className="mt-1 text-muted-foreground">{group.name}</p>
          </div>
        </div>
      </motion.div>

      {/* Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Classement des Membres
          </CardTitle>
        </CardHeader>
        <CardContent>
          {entries.length > 0 ? (
            <div className="space-y-2">
              {entries.map((entry) => (
                <LeaderboardRow key={entry.name} entry={entry} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Aucun résultat pour le moment</p>
              <p className="text-sm text-muted-foreground mt-2">
                Les membres doivent compléter des quiz partagés avec le groupe pour apparaître ici
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

