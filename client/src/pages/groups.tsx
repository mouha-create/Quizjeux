import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { 
  Plus, Users, Trophy, Medal, TrendingUp, Award, Crown, 
  Search, Filter, ArrowRight, Shield, Star, Zap, Target
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { SEO } from "@/components/seo";
import { useState } from "react";
import type { Group } from "@shared/schema";

function GroupCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function getRankIcon(rank: number) {
  switch (rank) {
    case 1:
      return <Trophy className="h-6 w-6 text-yellow-500" />;
    case 2:
      return <Medal className="h-6 w-6 text-gray-400" />;
    case 3:
      return <Medal className="h-6 w-6 text-amber-600" />;
    default:
      return <span className="flex h-6 w-6 items-center justify-center text-sm font-medium text-muted-foreground">{rank}</span>;
  }
}

function GroupCard({ 
  group, 
  rank 
}: { 
  group: Group; 
  rank: number;
}) {
  return (
    <Link href={`/groups/${group.id}`}>
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Card className="cursor-pointer transition-all hover:shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-500">
                {group.badge ? (
                  <span className="text-2xl">{group.badge}</span>
                ) : (
                  <Users className="h-8 w-8 text-white" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {getRankIcon(rank)}
                      <h3 className="font-heading text-lg font-semibold">{group.name}</h3>
                    </div>
                    {group.description && (
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                        {group.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-1 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{group.memberCount}</span>
                    <span className="text-muted-foreground">membres</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <Target className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{group.totalQuizzes}</span>
                    <span className="text-muted-foreground">quiz</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{group.averageScore}%</span>
                    <span className="text-muted-foreground">moyenne</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <Trophy className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{group.totalPoints.toLocaleString()}</span>
                    <span className="text-muted-foreground">points</span>
                  </div>
                </div>
                {group.badges && group.badges.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {group.badges.slice(0, 3).map((badgeId) => (
                      <Badge key={badgeId} variant="secondary" className="gap-1">
                        <Award className="h-3 w-3" />
                        {badgeId}
                      </Badge>
                    ))}
                    {group.badges.length > 3 && (
                      <Badge variant="outline">+{group.badges.length - 3}</Badge>
                    )}
                  </div>
                )}
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </Link>
  );
}

export default function Groups() {
  return (
    <>
      <SEO
        title="Groups & Guilds - Join Quiz Communities | QuizCraft AI"
        description="Join or create quiz groups and guilds. Compete with friends, share quizzes, and climb the group leaderboard. Build your quiz community today."
        keywords="quiz groups, quiz guilds, quiz communities, group leaderboard, quiz sharing, quiz teams"
      />
      <GroupsContent />
    </>
  );
}

function GroupsContent() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: groups, isLoading } = useQuery<Group[]>({
    queryKey: ["/api/groups"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/groups");
      return response.json();
    },
  });

  // Sort groups by total points (leaderboard)
  const sortedGroups = groups
    ? [...groups].sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0))
    : [];

  // Filter by search
  const filteredGroups = sortedGroups.filter((group) =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <GroupCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold">Groupes & Guildes</h1>
            <p className="mt-1 text-muted-foreground">
              Rejoignez des groupes, partagez des quiz et montez dans le classement
            </p>
          </div>
          <Link href="/groups/create">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Créer un Groupe
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher un groupe..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </motion.div>

      {/* Top 3 Groups */}
      {filteredGroups.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="mb-4 font-heading text-xl font-semibold">Top 3 Groupes</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {filteredGroups.slice(0, 3).map((group, index) => (
              <motion.div
                key={group.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                <Link href={`/groups/${group.id}`}>
                  <Card className="cursor-pointer border-2 transition-all hover:shadow-lg"
                    style={{
                      borderColor: index === 0 ? "#fbbf24" : index === 1 ? "#9ca3af" : "#d97706"
                    }}
                  >
                    <CardContent className="p-6">
                      <div className="flex flex-col items-center text-center">
                        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-500">
                          {getRankIcon(index + 1)}
                        </div>
                        <h3 className="font-heading text-lg font-semibold">{group.name}</h3>
                        <p className="mt-2 text-2xl font-bold text-purple-600">
                          {group.totalPoints.toLocaleString()} pts
                        </p>
                        <div className="mt-4 flex gap-4 text-sm text-muted-foreground">
                          <span>{group.memberCount} membres</span>
                          <span>•</span>
                          <span>{group.totalQuizzes} quiz</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* All Groups */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="mb-4 font-heading text-xl font-semibold">Classement Complet</h2>
        {filteredGroups.length > 0 ? (
          <div className="space-y-4">
            {filteredGroups.map((group, index) => (
              <GroupCard key={group.id} group={group} rank={index + 1} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-heading text-xl font-semibold">Aucun groupe trouvé</h3>
              <p className="mt-2 max-w-sm text-muted-foreground">
                {searchQuery 
                  ? "Essayez une autre recherche ou créez un nouveau groupe."
                  : "Créez le premier groupe pour commencer !"
                }
              </p>
              <Link href="/groups/create">
                <Button className="mt-6 gap-2">
                  <Plus className="h-4 w-4" />
                  Créer un Groupe
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </div>
  );
}

