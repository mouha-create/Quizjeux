import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { 
  Plus, Play, Edit2, Trash2, Share2, Clock, Users, Target, 
  Search, Filter, MoreVertical, Copy, Sparkles, Heart, Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { getThemeClasses } from "@/lib/quiz-themes";
import { SEO } from "@/components/seo";
import type { Quiz, QuizTheme, DifficultyLevel, QuizCategory } from "@shared/schema";
import { quizThemes, difficultyLevels, quizCategories } from "@shared/schema";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

function QuizCardSkeleton() {
  return (
    <Card>
      <CardHeader className="space-y-2">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-14" />
        </div>
      </CardContent>
      <CardFooter>
        <Skeleton className="h-9 w-full" />
      </CardFooter>
    </Card>
  );
}

function ThemeDot({ theme }: { theme: QuizTheme }) {
  const colors = getThemeClasses(theme);
  return (
    <div className={`h-3 w-3 rounded-full ${colors.bg}`} />
  );
}

export default function Library() {
  return (
    <>
      <SEO
        title="Quiz Library - Browse All Quizzes | QuizCraft AI"
        description="Browse and discover thousands of interactive quizzes. Filter by category, difficulty, and theme. Find the perfect quiz for your needs."
        keywords="quiz library, browse quizzes, quiz collection, find quizzes, quiz categories, quiz search"
      />
      <LibraryContent />
    </>
  );
}

function LibraryContent() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTheme, setSelectedTheme] = useState<QuizTheme | "all">("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel | "all">("all");
  const [selectedCategory, setSelectedCategory] = useState<QuizCategory | "all">("all");
  const [deleteQuizId, setDeleteQuizId] = useState<string | null>(null);

  const { data: quizzes, isLoading } = useQuery<Quiz[]>({
    queryKey: ["/api/quizzes"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/quizzes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quizzes"] });
      toast({
        title: "Quiz deleted",
        description: "The quiz has been permanently deleted.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete the quiz. Please try again.",
        variant: "destructive",
      });
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("POST", `/api/quizzes/${id}/duplicate`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quizzes"] });
      toast({
        title: "Quiz duplicated",
        description: "A copy of the quiz has been created.",
      });
    },
  });

  const { data: favorites = [] } = useQuery<string[]>({
    queryKey: ["/api/favorites"],
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: async ({ quizId, isFavorite }: { quizId: string; isFavorite: boolean }) => {
      if (isFavorite) {
        await apiRequest("DELETE", `/api/favorites/${quizId}`);
      } else {
        await apiRequest("POST", `/api/favorites/${quizId}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
      toast({
        title: "Favorite updated",
        description: "Your favorites list has been updated.",
      });
    },
  });

  const handleShare = async (quiz: Quiz) => {
    const shareUrl = `${window.location.origin}/play/${quiz.id}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link copied!",
        description: "Quiz link has been copied to clipboard.",
      });
    } catch {
      toast({
        title: "Share",
        description: shareUrl,
      });
    }
  };

  const filteredQuizzes = quizzes?.filter((quiz) => {
    // Search filter
    const matchesSearch = 
      quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quiz.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quiz.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Theme filter
    const matchesTheme = selectedTheme === "all" || quiz.theme === selectedTheme;
    
    // Difficulty filter
    const matchesDifficulty = selectedDifficulty === "all" || quiz.difficulty === selectedDifficulty;
    
    // Category filter
    const matchesCategory = selectedCategory === "all" || quiz.category === selectedCategory;
    
    return matchesSearch && matchesTheme && matchesDifficulty && matchesCategory;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold">My Quizzes</h1>
          <p className="mt-1 text-muted-foreground">
            Manage and organize all your quizzes
          </p>
        </div>
        <Link href="/create">
          <Button className="gap-2" data-testid="button-create-new">
            <Plus className="h-4 w-4" />
            Create New Quiz
          </Button>
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search quizzes by title or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            data-testid="input-search-quizzes"
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Filters:</span>
          </div>
          <Select value={selectedTheme} onValueChange={(v) => setSelectedTheme(v as QuizTheme | "all")}>
            <SelectTrigger className="w-[140px]" data-testid="select-theme-filter">
              <SelectValue placeholder="All Themes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Themes</SelectItem>
              {quizThemes.map((theme) => (
                <SelectItem key={theme} value={theme}>
                  {theme.charAt(0).toUpperCase() + theme.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedDifficulty} onValueChange={(v) => setSelectedDifficulty(v as DifficultyLevel | "all")}>
            <SelectTrigger className="w-[140px]" data-testid="select-difficulty-filter">
              <SelectValue placeholder="All Difficulties" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Difficulties</SelectItem>
              {difficultyLevels.map((difficulty) => (
                <SelectItem key={difficulty} value={difficulty}>
                  {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as QuizCategory | "all")}>
            <SelectTrigger className="w-[140px]" data-testid="select-category-filter">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {quizCategories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {(selectedTheme !== "all" || selectedDifficulty !== "all" || selectedCategory !== "all" || searchQuery) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedTheme("all");
                setSelectedDifficulty("all");
                setSelectedCategory("all");
                setSearchQuery("");
              }}
              className="text-muted-foreground"
            >
              Clear filters
            </Button>
          )}
        </div>
      </div>

      {/* Quiz Grid */}
      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <QuizCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredQuizzes && filteredQuizzes.length > 0 ? (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {filteredQuizzes.map((quiz) => (
            <motion.div key={quiz.id} variants={itemVariants}>
              <Card className="group h-full hover-elevate" data-testid={`card-quiz-${quiz.id}`}>
                <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0 pb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <ThemeDot theme={quiz.theme} />
                      <h3 className="font-heading text-lg font-semibold line-clamp-1">
                        {quiz.title}
                      </h3>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                      {quiz.description || "No description"}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      onClick={() => {
                        const isFavorite = favorites.includes(quiz.id);
                        toggleFavoriteMutation.mutate({ quizId: quiz.id, isFavorite });
                      }}
                      data-testid={`button-favorite-${quiz.id}`}
                    >
                      <Heart 
                        className={`h-4 w-4 ${favorites.includes(quiz.id) ? "fill-red-500 text-red-500" : ""}`} 
                      />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 shrink-0"
                          data-testid={`button-quiz-menu-${quiz.id}`}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/edit/${quiz.id}`} className="flex items-center gap-2">
                          <Edit2 className="h-4 w-4" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => duplicateMutation.mutate(quiz.id)}
                        className="gap-2"
                      >
                        <Copy className="h-4 w-4" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleShare(quiz)}
                        className="gap-2"
                      >
                        <Share2 className="h-4 w-4" />
                        Share
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setDeleteQuizId(quiz.id)}
                        className="gap-2 text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="pb-3">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="gap-1">
                      <Target className="h-3 w-3" />
                      {quiz.questions.length} questions
                    </Badge>
                    <Badge variant="secondary" className="gap-1">
                      <Users className="h-3 w-3" />
                      {quiz.plays} plays
                    </Badge>
                    {quiz.category && (
                      <Badge variant="outline" className="gap-1">
                        {quiz.category}
                      </Badge>
                    )}
                    {quiz.tags && quiz.tags.length > 0 && quiz.tags.slice(0, 2).map((tag, i) => (
                      <Badge key={i} variant="outline" className="gap-1 text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {quiz.timeLimit && (
                      <Badge variant="secondary" className="gap-1">
                        <Clock className="h-3 w-3" />
                        {Math.floor(quiz.timeLimit / 60)}m
                      </Badge>
                    )}
                    {!quiz.isPublic && (
                      <Badge variant="secondary" className="gap-1">
                        Private
                      </Badge>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="gap-2 pt-0">
                  <Link href={`/play/${quiz.id}`} className="flex-1">
                    <Button className="w-full gap-2" data-testid={`button-play-${quiz.id}`}>
                      <Play className="h-4 w-4" />
                      Play
                    </Button>
                  </Link>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => handleShare(quiz)}
                    data-testid={`button-share-${quiz.id}`}
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed py-16 text-center"
        >
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Sparkles className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-heading text-xl font-semibold">No quizzes yet</h3>
          <p className="mt-2 max-w-sm text-muted-foreground">
            Create your first quiz to get started. Use AI to generate questions
            instantly!
          </p>
          <Link href="/create">
            <Button className="mt-6 gap-2" data-testid="button-empty-create">
              <Plus className="h-4 w-4" />
              Create Your First Quiz
            </Button>
          </Link>
        </motion.div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteQuizId} onOpenChange={() => setDeleteQuizId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Quiz</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this quiz? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteQuizId) {
                  deleteMutation.mutate(deleteQuizId);
                  setDeleteQuizId(null);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
