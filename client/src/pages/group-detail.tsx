import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { 
  Users, Trophy, Target, Star, TrendingUp, Award, 
  UserPlus, LogOut, Share2, Play, Plus, Crown, Shield,
  BarChart3, Activity, Zap, Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";
import { useAuth } from "@/lib/auth-context";
import type { Group, Quiz } from "@shared/schema";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, BarChart, Bar
} from "recharts";

function GroupLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Skeleton className="mb-8 h-32 w-full" />
      <div className="grid gap-4 md:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function GroupDetail() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: group, isLoading: groupLoading } = useQuery<Group>({
    queryKey: ["/api/groups", id],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/groups/${id}`);
      if (!response.ok) throw new Error("Group not found");
      return response.json();
    },
  });

  const { data: members, isLoading: membersLoading } = useQuery({
    queryKey: ["/api/groups", id, "members"],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/groups/${id}/members`);
      return response.json();
    },
    enabled: !!id,
  });

  const { data: quizzes, isLoading: quizzesLoading } = useQuery<Quiz[]>({
    queryKey: ["/api/groups", id, "quizzes"],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/groups/${id}/quizzes`);
      return response.json();
    },
    enabled: !!id,
  });

  const { data: myGroups, refetch: refetchMyGroups } = useQuery({
    queryKey: ["/api/my-groups"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/my-groups");
      return response.json();
    },
  });

  const isMember = myGroups?.some((g: Group) => g.id === id) || false;
  const isCreator = group?.creatorId === user?.id;
  const member = members?.find((m: any) => m.userId === user?.id);

  const joinMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/groups/${id}/join`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to join group");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Groupe rejoint !",
        description: `Vous avez rejoint "${group?.name}"`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/groups", id] });
      queryClient.invalidateQueries({ queryKey: ["/api/my-groups"] });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de rejoindre le groupe.",
        variant: "destructive",
      });
    },
  });

  const leaveMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/groups/${id}/leave`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to leave group");
      }
      return response.json();
    },
    onSuccess: async () => {
      toast({
        title: "Groupe quitté",
        description: `Vous avez quitté "${group?.name}"`,
      });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["/api/groups", id] }),
        queryClient.invalidateQueries({ queryKey: ["/api/my-groups"] }),
        queryClient.invalidateQueries({ queryKey: ["/api/groups", id, "members"] }),
        refetchMyGroups(),
      ]);
      navigate("/groups");
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de quitter le groupe.",
        variant: "destructive",
      });
    },
  });

  if (groupLoading) return <GroupLoading />;
  if (!group) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <h2 className="font-heading text-2xl font-semibold">Groupe non trouvé</h2>
            <p className="mt-2 text-muted-foreground">Ce groupe n'existe pas ou a été supprimé.</p>
            <Link href="/groups">
              <Button className="mt-6">Retour aux Groupes</Button>
            </Link>
          </CardContent>
        </Card>
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
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-500">
              {group.badge ? (
                <span className="text-4xl">{group.badge}</span>
              ) : (
                <Users className="h-10 w-10 text-white" />
              )}
            </div>
            <div>
              <h1 className="font-heading text-3xl font-bold">{group.name}</h1>
              {group.description && (
                <p className="mt-1 text-muted-foreground">{group.description}</p>
              )}
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge variant="secondary">
                  {group.visibility === "public" ? "Public" : "Privé"}
                </Badge>
                <Badge variant="secondary">
                  {group.joinType === "open" ? "Ouvert" : "Sur invitation"}
                </Badge>
                {isCreator && (
                  <Badge className="bg-purple-500">
                    <Crown className="mr-1 h-3 w-3" />
                    Créateur
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {!isMember ? (
              <Button
                onClick={() => joinMutation.mutate()}
                disabled={joinMutation.isPending || group.joinType === "invite_only"}
                className="gap-2"
              >
                <UserPlus className="h-4 w-4" />
                {joinMutation.isPending ? "Rejoindre..." : "Rejoindre"}
              </Button>
            ) : (
              !isCreator && (
                <Button
                  variant="outline"
                  onClick={() => leaveMutation.mutate()}
                  disabled={leaveMutation.isPending}
                  className="gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  {leaveMutation.isPending ? "Quitter..." : "Quitter"}
                </Button>
              )
            )}
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-blue-500">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Membres</p>
                <p className="font-heading text-2xl font-bold">{group.memberCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-emerald-500">
                <Target className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Quiz Partagés</p>
                <p className="font-heading text-2xl font-bold">{group.totalQuizzes}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500">
                <Star className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Moyenne</p>
                <p className="font-heading text-2xl font-bold">{group.averageScore}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500">
                <Trophy className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Points Totaux</p>
                <p className="font-heading text-2xl font-bold">{group.totalPoints.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Badges */}
      {group.badges && group.badges.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Badges du Groupe
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {group.badges.map((badgeId) => (
                  <Badge key={badgeId} variant="secondary" className="gap-1">
                    <Award className="h-3 w-3" />
                    {badgeId}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Members */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Membres ({members?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {membersLoading ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : members && members.length > 0 ? (
                <div className="space-y-2">
                  {members.map((member: any) => (
                    <div
                      key={member.userId}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-500">
                          <span className="font-semibold text-white">
                            {member.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{member.username}</p>
                          <p className="text-xs text-muted-foreground">
                            {member.role === "creator" && "Créateur"}
                            {member.role === "admin" && "Admin"}
                            {member.role === "member" && "Membre"}
                          </p>
                        </div>
                      </div>
                      <div className="text-right text-sm">
                        <p className="font-medium">{member.contributedQuizzes} quiz</p>
                        <p className="text-xs text-muted-foreground">
                          {member.contributedPoints} pts
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground">Aucun membre</p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Quizzes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Quiz Partagés ({quizzes?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {quizzesLoading ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : quizzes && quizzes.length > 0 ? (
                <div className="space-y-2">
                  {quizzes.map((quiz) => (
                    <Link key={quiz.id} href={`/play/${quiz.id}`}>
                      <div className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted">
                        <div className="flex-1">
                          <p className="font-medium">{quiz.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {quiz.plays} parties • {quiz.averageScore}% moyenne
                          </p>
                        </div>
                        <Play className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-muted-foreground">Aucun quiz partagé</p>
                  {isMember && (
                    <Link href="/create">
                      <Button variant="outline" className="mt-4 gap-2">
                        <Plus className="h-4 w-4" />
                        Créer un Quiz
                      </Button>
                    </Link>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

