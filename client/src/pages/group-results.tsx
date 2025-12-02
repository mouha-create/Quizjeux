import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft, Users, Target, BarChart3, Clock, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import type { Group, Quiz } from "@shared/schema";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

interface GroupMemberResult {
  id: string;
  quizId: string;
  quizTitle: string;
  userId: string;
  username: string;
  score: number;
  totalPoints: number;
  correctAnswers: number;
  totalQuestions: number;
  timeSpent: number;
  completedAt: string;
  accuracy: number;
}

export default function GroupResults() {
  const { id } = useParams<{ id: string }>();
  const [selectedQuizId, setSelectedQuizId] = useState<string>("all");

  const { data: group, isLoading: groupLoading } = useQuery<Group>({
    queryKey: ["/api/groups", id],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/groups/${id}`);
      if (!response.ok) throw new Error("Group not found");
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

  const { data: results, isLoading: resultsLoading } = useQuery<GroupMemberResult[]>({
    queryKey: ["/api/groups", id, "results", selectedQuizId],
    queryFn: async () => {
      const url = selectedQuizId === "all" 
        ? `/api/groups/${id}/results`
        : `/api/groups/${id}/results?quizId=${selectedQuizId}`;
      const response = await apiRequest("GET", url);
      if (!response.ok) throw new Error("Failed to fetch results");
      return response.json();
    },
    enabled: !!id,
  });

  if (groupLoading || quizzesLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
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
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
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

  const entries = results || [];

  // Group results by user
  const resultsByUser = new Map<string, GroupMemberResult[]>();
  entries.forEach(result => {
    const userResults = resultsByUser.get(result.userId) || [];
    userResults.push(result);
    resultsByUser.set(result.userId, userResults);
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
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
            <h1 className="font-heading text-3xl font-bold">Résultats Détaillés</h1>
            <p className="mt-1 text-muted-foreground">{group.name}</p>
          </div>
        </div>
      </motion.div>

      {/* Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium">Filtrer par Quiz:</label>
              <Select value={selectedQuizId} onValueChange={setSelectedQuizId}>
                <SelectTrigger className="w-64">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les Quiz</SelectItem>
                  {quizzes?.map((quiz) => (
                    <SelectItem key={quiz.id} value={quiz.id}>
                      {quiz.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Results */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {resultsLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : entries.length > 0 ? (
          <div className="space-y-4">
            {Array.from(resultsByUser.entries()).map(([userId, userResults]) => {
              const firstResult = userResults[0];
              const totalScore = userResults.reduce((sum, r) => sum + r.score, 0);
              const totalQuizzes = new Set(userResults.map(r => r.quizId)).size;
              const avgAccuracy = Math.round(
                userResults.reduce((sum, r) => sum + r.accuracy, 0) / userResults.length
              );

              return (
                <Card key={userId}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-500">
                          <span className="font-semibold text-white">
                            {firstResult.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <CardTitle>{firstResult.username}</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {totalQuizzes} quiz complété(s) • {totalScore.toLocaleString()} points
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary">
                        {avgAccuracy}% moyenne
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {userResults.map((result) => (
                        <div
                          key={result.id}
                          className="flex items-center justify-between rounded-lg border p-3"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <Link href={`/play/${result.quizId}`}>
                                <p className="font-medium hover:text-primary cursor-pointer">
                                  {result.quizTitle}
                                </p>
                              </Link>
                            </div>
                            <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <CheckCircle className="h-3 w-3" />
                                {result.correctAnswers}/{result.totalQuestions} correctes
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {Math.round(result.timeSpent / 60)} min
                              </span>
                              <span>
                                {new Date(result.completedAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-heading text-lg font-bold">
                              {result.score}/{result.totalPoints}
                            </p>
                            <Badge
                              variant={result.accuracy >= 80 ? "default" : result.accuracy >= 60 ? "secondary" : "destructive"}
                              className="mt-1"
                            >
                              {result.accuracy}%
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Aucun résultat pour le moment</p>
              <p className="text-sm text-muted-foreground mt-2">
                Les membres doivent compléter des quiz pour voir les résultats ici
              </p>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </div>
  );
}

