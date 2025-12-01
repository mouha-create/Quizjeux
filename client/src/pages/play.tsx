import { useState, useEffect, useCallback } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Clock, CheckCircle, XCircle, ChevronRight, RotateCcw, Share2, 
  Trophy, Target, Flame, ArrowUp, ArrowDown, GripVertical
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { getThemeGradient, getThemeClasses } from "@/lib/quiz-themes";
import { triggerConfetti, triggerCelebration } from "@/lib/confetti";
import type { Quiz, Question, QuizResult } from "@shared/schema";

function QuizLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-500 to-blue-500 p-4">
      <Card className="w-full max-w-3xl">
        <CardContent className="p-8">
          <Skeleton className="mb-4 h-4 w-32" />
          <Skeleton className="mb-8 h-8 w-full" />
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AnswerOption({
  option,
  index,
  selected,
  correct,
  showResult,
  onClick,
  disabled,
}: {
  option: string;
  index: number;
  selected: boolean;
  correct: boolean;
  showResult: boolean;
  onClick: () => void;
  disabled: boolean;
}) {
  const letter = String.fromCharCode(65 + index);
  
  let borderColor = "border-border hover:border-primary/50";
  let bgColor = "";
  
  if (showResult) {
    if (correct) {
      borderColor = "border-green-500";
      bgColor = "bg-green-50 dark:bg-green-900/20";
    } else if (selected && !correct) {
      borderColor = "border-red-500";
      bgColor = "bg-red-50 dark:bg-red-900/20";
    }
  } else if (selected) {
    borderColor = "border-primary";
    bgColor = "bg-primary/5";
  }

  return (
    <motion.button
      whileHover={disabled ? {} : { scale: 1.01 }}
      whileTap={disabled ? {} : { scale: 0.99 }}
      onClick={onClick}
      disabled={disabled}
      className={`flex w-full items-center gap-4 rounded-lg border-2 p-4 text-left transition-all ${borderColor} ${bgColor} ${
        disabled ? "cursor-default" : "cursor-pointer"
      }`}
      data-testid={`button-option-${index}`}
    >
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-medium ${
          showResult && correct
            ? "bg-green-500 text-white"
            : showResult && selected && !correct
            ? "bg-red-500 text-white"
            : selected
            ? "bg-primary text-primary-foreground"
            : "bg-muted"
        }`}
      >
        {showResult ? (
          correct ? (
            <CheckCircle className="h-5 w-5" />
          ) : selected ? (
            <XCircle className="h-5 w-5" />
          ) : (
            letter
          )
        ) : (
          letter
        )}
      </div>
      <span className={`flex-1 ${selected ? "font-medium" : ""}`}>{option}</span>
    </motion.button>
  );
}

function RankingQuestion({
  items,
  onSubmit,
  disabled,
}: {
  items: string[];
  onSubmit: (order: string[]) => void;
  disabled: boolean;
}) {
  const [order, setOrder] = useState<string[]>(
    [...items].sort(() => Math.random() - 0.5)
  );

  const moveItem = (index: number, direction: "up" | "down") => {
    const newOrder = [...order];
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex >= 0 && newIndex < order.length) {
      [newOrder[index], newOrder[newIndex]] = [newOrder[newIndex], newOrder[index]];
      setOrder(newOrder);
    }
  };

  return (
    <div className="space-y-2">
      {order.map((item, index) => (
        <motion.div
          key={item}
          layout
          className="flex items-center gap-2 rounded-lg border-2 border-border p-3"
        >
          <GripVertical className="h-5 w-5 text-muted-foreground" />
          <span className="flex h-6 w-6 items-center justify-center rounded bg-muted text-sm font-medium">
            {index + 1}
          </span>
          <span className="flex-1">{item}</span>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => moveItem(index, "up")}
              disabled={index === 0 || disabled}
              className="h-8 w-8"
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => moveItem(index, "down")}
              disabled={index === order.length - 1 || disabled}
              className="h-8 w-8"
            >
              <ArrowDown className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      ))}
      {!disabled && (
        <Button
          onClick={() => onSubmit(order)}
          className="mt-4 w-full"
          data-testid="button-submit-ranking"
        >
          Submit Order
        </Button>
      )}
    </div>
  );
}

export default function Play() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [showResult, setShowResult] = useState(false);
  const [quizComplete, setQuizComplete] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [startTime] = useState(Date.now());
  const [streak, setStreak] = useState(0);
  const [textAnswer, setTextAnswer] = useState("");
  const [result, setResult] = useState<QuizResult | null>(null);

  const { data: quiz, isLoading } = useQuery<Quiz>({
    queryKey: ["/api/quizzes", id],
  });

  const submitMutation = useMutation({
    mutationFn: async (data: { quizId: string; answers: Record<string, string | string[]>; timeSpent: number }) => {
      return await apiRequest("POST", "/api/quizzes/submit", data) as QuizResult;
    },
    onSuccess: (data) => {
      setResult(data);
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/results"] });
      queryClient.invalidateQueries({ queryKey: ["/api/leaderboard"] });
      
      if (data.correctAnswers === data.totalQuestions) {
        triggerCelebration();
      }
    },
  });

  // Timer logic
  useEffect(() => {
    if (!quiz?.timeLimit || quizComplete) return;

    setTimeLeft(quiz.timeLimit);
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null || prev <= 0) {
          clearInterval(interval);
          handleComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [quiz?.timeLimit]);

  const handleComplete = useCallback(() => {
    if (!quiz) return;
    
    // Ensure all answers are collected, including current text answer if applicable
    const currentQ = quiz.questions[currentQuestion];
    const finalAnswers = { ...answers };
    
    // If current question is text type and has an answer, include it
    if (currentQ?.type === "text" && textAnswer.trim()) {
      finalAnswers[currentQ.id] = textAnswer.trim();
    }
    
    // Check if all questions have answers
    const unansweredQuestions = quiz.questions.filter(q => !finalAnswers[q.id] || finalAnswers[q.id] === "");
    if (unansweredQuestions.length > 0) {
      toast({
        title: "Incomplete Quiz",
        description: `Please answer all ${unansweredQuestions.length} remaining question(s).`,
        variant: "destructive",
      });
      return;
    }
    
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    console.log("Submitting quiz with answers:", finalAnswers);
    console.log("Time spent:", timeSpent);
    console.log("Quiz questions:", quiz.questions.map(q => ({ id: q.id, type: q.type, correctAnswer: q.correctAnswer })));
    
    setQuizComplete(true);
    submitMutation.mutate({
      quizId: quiz.id,
      answers: finalAnswers,
      timeSpent,
    });
  }, [quiz, answers, textAnswer, currentQuestion, startTime, submitMutation, toast]);

  if (isLoading) return <QuizLoading />;
  
  if (!quiz || !quiz.questions || quiz.questions.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-8">
            <h2 className="mb-2 font-heading text-xl font-bold">Quiz Not Found</h2>
            <p className="mb-4 text-muted-foreground">
              This quiz doesn't exist or has been deleted.
            </p>
            <Button onClick={() => navigate("/library")}>
              Back to Library
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const question = quiz.questions[currentQuestion];
  
  if (!question) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-8">
            <h2 className="mb-2 font-heading text-xl font-bold">No Questions</h2>
            <p className="mb-4 text-muted-foreground">
              This quiz has no questions to display.
            </p>
            <Button onClick={() => navigate("/library")}>
              Back to Library
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  const themeColors = getThemeClasses(quiz.theme);
  const themeGradient = getThemeGradient(quiz.theme);
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;

  const handleAnswer = (answer: string | string[]) => {
    if (showResult) return;

    const isCorrect = Array.isArray(question.correctAnswer)
      ? JSON.stringify(answer) === JSON.stringify(question.correctAnswer)
      : answer === question.correctAnswer;

    setAnswers({ ...answers, [question.id]: answer });
    setShowResult(true);

    if (isCorrect) {
      setStreak(streak + 1);
      triggerConfetti();
    } else {
      setStreak(0);
    }
  };

  const handleNext = () => {
    setShowResult(false);
    setTextAnswer("");
    
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      handleComplete();
    }
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
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

  const formatTime = (seconds: number | null | undefined) => {
    if (seconds === null || seconds === undefined || isNaN(seconds) || seconds < 0) {
      return "0:00";
    }
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Results Screen
  if (quizComplete && result) {
    console.log("Result data:", result);
    console.log("correctAnswers:", result.correctAnswers, "totalQuestions:", result.totalQuestions);
    
    const accuracy = result.totalQuestions > 0 && 
                     typeof result.correctAnswers === 'number' && 
                     typeof result.totalQuestions === 'number' &&
                     !isNaN(result.correctAnswers) &&
                     !isNaN(result.totalQuestions)
      ? Math.round((result.correctAnswers / result.totalQuestions) * 100)
      : 0;
    
    console.log("Calculated accuracy:", accuracy);
    
    return (
      <div className={`min-h-screen ${themeGradient} p-4`}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mx-auto max-w-2xl pt-8"
        >
          <Card>
            <CardContent className="p-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-orange-500"
              >
                <Trophy className="h-12 w-12 text-white" />
              </motion.div>

              <h1 className="font-heading text-3xl font-bold">Quiz Complete!</h1>
              <p className="mt-2 text-muted-foreground">{quiz.title}</p>

              {/* Score Circle */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mx-auto my-8 flex h-40 w-40 items-center justify-center rounded-full border-8 border-primary"
              >
                <div className="text-center">
                  <span className="font-heading text-5xl font-bold" translate="no">{accuracy}%</span>
                  <p className="text-sm text-muted-foreground" translate="no">Accuracy</p>
                </div>
              </motion.div>

              {/* Stats */}
              <div className="mb-8 grid grid-cols-3 gap-4">
                <div className="rounded-lg bg-muted p-4">
                  <CheckCircle className="mx-auto mb-2 h-6 w-6 text-green-500" />
                  <p className="font-heading text-2xl font-bold">{result.correctAnswers}</p>
                  <p className="text-xs text-muted-foreground">Correct</p>
                </div>
                <div className="rounded-lg bg-muted p-4">
                  <Target className="mx-auto mb-2 h-6 w-6 text-blue-500" />
                  <p className="font-heading text-2xl font-bold">{result.score}</p>
                  <p className="text-xs text-muted-foreground">Points</p>
                </div>
                <div className="rounded-lg bg-muted p-4">
                  <Flame className="mx-auto mb-2 h-6 w-6 text-orange-500" />
                  <p className="font-heading text-2xl font-bold">{result.streak}</p>
                  <p className="text-xs text-muted-foreground">Best Streak</p>
                </div>
              </div>

              {/* Time */}
              <p className="mb-6 text-muted-foreground">
                Completed in {formatTime(result.timeSpent)}
              </p>

              {/* Actions */}
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Button
                  onClick={() => {
                    setCurrentQuestion(0);
                    setAnswers({});
                    setShowResult(false);
                    setQuizComplete(false);
                    setStreak(0);
                    setResult(null);
                  }}
                  className="gap-2"
                  data-testid="button-retake"
                >
                  <RotateCcw className="h-4 w-4" />
                  Retake Quiz
                </Button>
                <Button
                  variant="outline"
                  onClick={handleShare}
                  className="gap-2"
                  data-testid="button-share-result"
                >
                  <Share2 className="h-4 w-4" />
                  Share
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate("/library")}
                  data-testid="button-back-library"
                >
                  Back to Library
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Quiz Playing Screen
  return (
    <div className={`min-h-screen ${themeGradient} p-4`}>
      <div className="mx-auto max-w-3xl pt-4">
        {/* Progress Header */}
        <div className="mb-4 flex items-center justify-between text-white">
          <Badge variant="secondary" className="bg-white/20 text-white">
            Question {currentQuestion + 1} of {quiz.questions.length}
          </Badge>
          {streak > 0 && (
            <Badge className="gap-1 bg-orange-500">
              <Flame className="h-3 w-3" />
              {streak} streak
            </Badge>
          )}
          {timeLeft !== null && (
            <Badge 
              variant="secondary" 
              className={`gap-1 bg-white/20 text-white ${timeLeft < 10 ? "animate-pulse" : ""}`}
            >
              <Clock className="h-3 w-3" />
              {formatTime(timeLeft)}
            </Badge>
          )}
        </div>

        <Progress value={progress} className="mb-6 h-2 bg-white/20" />

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
          >
            <Card>
              <CardContent className="p-8">
                <Badge variant="secondary" className="mb-4">
                  {question.type === "multiple" && "Multiple Choice"}
                  {question.type === "truefalse" && "True or False"}
                  {question.type === "text" && "Short Answer"}
                  {question.type === "ranking" && "Put in Order"}
                </Badge>

                <h2 className="mb-8 font-heading text-xl font-semibold sm:text-2xl">
                  {question.question}
                </h2>

                {/* Answer Options */}
                {(question.type === "multiple" || question.type === "truefalse") && (
                  <div className="space-y-3">
                    {(question.options || []).map((option, i) => (
                      <AnswerOption
                        key={i}
                        option={option}
                        index={i}
                        selected={answers[question.id] === option}
                        correct={option === question.correctAnswer}
                        showResult={showResult}
                        onClick={() => handleAnswer(option)}
                        disabled={showResult}
                      />
                    ))}
                  </div>
                )}

                {/* Text Input */}
                {question.type === "text" && !showResult && (
                  <div className="space-y-4">
                    <Input
                      value={textAnswer}
                      onChange={(e) => setTextAnswer(e.target.value)}
                      placeholder="Type your answer..."
                      className="text-lg"
                      data-testid="input-text-answer"
                    />
                    <Button
                      onClick={() => handleAnswer(textAnswer)}
                      disabled={!textAnswer.trim()}
                      className="w-full"
                    >
                      Submit Answer
                    </Button>
                  </div>
                )}

                {question.type === "text" && showResult && (
                  <div className={`rounded-lg border-2 p-4 ${
                    (answers[question.id] as string)?.toLowerCase() === (question.correctAnswer as string).toLowerCase()
                      ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                      : "border-red-500 bg-red-50 dark:bg-red-900/20"
                  }`}>
                    <p className="font-medium">Your answer: {answers[question.id] as string}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Correct answer: {question.correctAnswer as string}
                    </p>
                  </div>
                )}

                {/* Ranking */}
                {question.type === "ranking" && !showResult && (
                  <RankingQuestion
                    items={question.correctAnswer as string[]}
                    onSubmit={handleAnswer}
                    disabled={showResult}
                  />
                )}

                {/* Explanation */}
                {showResult && question.explanation && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 rounded-lg bg-muted p-4"
                  >
                    <p className="text-sm font-medium">Explanation</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {question.explanation}
                    </p>
                  </motion.div>
                )}

                {/* Next Button */}
                {showResult && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-6 flex justify-end"
                  >
                    <Button
                      onClick={handleNext}
                      className="gap-2"
                      data-testid="button-next-question"
                    >
                      {currentQuestion < quiz.questions.length - 1 ? (
                        <>
                          Next Question
                          <ChevronRight className="h-4 w-4" />
                        </>
                      ) : (
                        <>
                          See Results
                          <Trophy className="h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
