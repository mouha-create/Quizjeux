import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, Trash2, GripVertical, ChevronLeft, ChevronRight,
  CheckCircle, Save, Loader2, Clock, Palette
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { quizThemeColors } from "@/lib/quiz-themes";
import type { Quiz, Question, QuestionType, QuizTheme, DifficultyLevel } from "@shared/schema";
import { quizThemes, questionTypes, difficultyLevels } from "@shared/schema";

const steps = ["Details", "Questions", "Settings"];

function ThemeSelector({ 
  value, 
  onChange 
}: { 
  value: QuizTheme;
  onChange: (theme: QuizTheme) => void;
}) {
  return (
    <div className="flex gap-3">
      {quizThemes.map((theme) => {
        const colors = quizThemeColors[theme];
        const isSelected = value === theme;
        return (
          <button
            key={theme}
            type="button"
            onClick={() => onChange(theme)}
            className={`relative h-10 w-10 rounded-full transition-transform ${colors.bg} ${
              isSelected ? "scale-110 ring-2 ring-offset-2 ring-offset-background" : "hover:scale-105"
            }`}
            style={{ ringColor: isSelected ? "hsl(var(--primary))" : undefined }}
          >
            {isSelected && (
              <CheckCircle className="absolute inset-0 m-auto h-5 w-5 text-white" />
            )}
          </button>
        );
      })}
    </div>
  );
}

function QuestionTypeSelector({ 
  value, 
  onChange 
}: { 
  value: QuestionType;
  onChange: (type: QuestionType) => void;
}) {
  const typeLabels: Record<QuestionType, string> = {
    multiple: "Multiple Choice",
    truefalse: "True/False",
    text: "Short Text",
    ranking: "Ranking",
  };

  return (
    <div className="flex flex-wrap gap-2">
      {questionTypes.map((type) => (
        <Badge
          key={type}
          variant={value === type ? "default" : "secondary"}
          className="cursor-pointer"
          onClick={() => onChange(type)}
        >
          {typeLabels[type]}
        </Badge>
      ))}
    </div>
  );
}

function QuestionEditor({
  question,
  index,
  onUpdate,
  onDelete,
}: {
  question: Question;
  index: number;
  onUpdate: (question: Question) => void;
  onDelete: () => void;
}) {
  const updateField = <K extends keyof Question>(field: K, value: Question[K]) => {
    onUpdate({ ...question, [field]: value });
  };

  const updateOption = (optionIndex: number, value: string) => {
    const newOptions = [...(question.options || [])];
    newOptions[optionIndex] = value;
    updateField("options", newOptions);
  };

  const addOption = () => {
    const newOptions = [...(question.options || []), ""];
    updateField("options", newOptions);
  };

  const removeOption = (optionIndex: number) => {
    const newOptions = (question.options || []).filter((_, i) => i !== optionIndex);
    updateField("options", newOptions);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card className="relative">
        <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-4">
          <GripVertical className="h-5 w-5 cursor-grab text-muted-foreground" />
          <Badge variant="secondary">Question {index + 1}</Badge>
          <div className="flex-1" />
          <Button
            variant="ghost"
            size="icon"
            onClick={onDelete}
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Question Type</Label>
            <QuestionTypeSelector
              value={question.type}
              onChange={(type) => {
                updateField("type", type);
                if (type === "truefalse") {
                  updateField("options", ["True", "False"]);
                } else if (type === "multiple" && (!question.options || question.options.length === 0)) {
                  updateField("options", ["", "", "", ""]);
                }
              }}
            />
          </div>

          <div>
            <Label>Question Text</Label>
            <Textarea
              value={question.question}
              onChange={(e) => updateField("question", e.target.value)}
              placeholder="Enter your question..."
              className="mt-1.5"
            />
          </div>

          {(question.type === "multiple" || question.type === "truefalse") && (
            <div>
              <Label>Answer Options</Label>
              <div className="mt-1.5 space-y-2">
                {(question.options || []).map((option, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => updateField("correctAnswer", option)}
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                        question.correctAnswer === option
                          ? "border-green-500 bg-green-500 text-white"
                          : "border-muted-foreground/30 hover:border-green-500"
                      }`}
                    >
                      {String.fromCharCode(65 + i)}
                    </button>
                    <Input
                      value={option}
                      onChange={(e) => updateOption(i, e.target.value)}
                      placeholder={`Option ${String.fromCharCode(65 + i)}`}
                      disabled={question.type === "truefalse"}
                    />
                    {question.type === "multiple" && (question.options?.length || 0) > 2 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeOption(i)}
                        className="h-8 w-8 shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              {question.type === "multiple" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addOption}
                  className="mt-2 gap-1"
                >
                  <Plus className="h-4 w-4" />
                  Add Option
                </Button>
              )}
            </div>
          )}

          {question.type === "text" && (
            <div>
              <Label>Correct Answer</Label>
              <Input
                value={question.correctAnswer as string}
                onChange={(e) => updateField("correctAnswer", e.target.value)}
                placeholder="Enter the correct answer..."
                className="mt-1.5"
              />
            </div>
          )}

          <div>
            <Label>Explanation (Optional)</Label>
            <Textarea
              value={question.explanation || ""}
              onChange={(e) => updateField("explanation", e.target.value)}
              placeholder="Explain why this is the correct answer..."
              className="mt-1.5"
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function EditLoading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Skeleton className="mb-8 h-10 w-64" />
      <div className="space-y-4">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    </div>
  );
}

export default function Edit() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  
  const { data: quiz, isLoading } = useQuery<Quiz>({
    queryKey: ["/api/quizzes", id],
  });

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [theme, setTheme] = useState<QuizTheme>("purple");
  const [difficulty, setDifficulty] = useState<DifficultyLevel>("intermediate");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [timeLimit, setTimeLimit] = useState<number | undefined>(undefined);
  const [enableTimer, setEnableTimer] = useState(false);

  // Load quiz data
  useEffect(() => {
    if (quiz) {
      setTitle(quiz.title);
      setDescription(quiz.description || "");
      setTheme(quiz.theme);
      setDifficulty(quiz.difficulty);
      setQuestions(quiz.questions);
      setTimeLimit(quiz.timeLimit);
      setEnableTimer(!!quiz.timeLimit);
    }
  }, [quiz]);

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<Quiz>) => {
      return await apiRequest("PATCH", `/api/quizzes/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quizzes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/quizzes", id] });
      toast({
        title: "Quiz updated!",
        description: "Your changes have been saved.",
      });
      navigate("/library");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update quiz. Please try again.",
        variant: "destructive",
      });
    },
  });

  const addQuestion = () => {
    const newQuestion: Question = {
      id: crypto.randomUUID(),
      type: "multiple",
      question: "",
      options: ["", "", "", ""],
      correctAnswer: "",
      points: 10,
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (index: number, question: Question) => {
    const newQuestions = [...questions];
    newQuestions[index] = question;
    setQuestions(newQuestions);
  };

  const deleteQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for your quiz.",
        variant: "destructive",
      });
      setStep(0);
      return;
    }

    updateMutation.mutate({
      title,
      description,
      questions,
      theme,
      difficulty,
      timeLimit: enableTimer ? timeLimit : undefined,
    });
  };

  if (isLoading) return <EditLoading />;

  if (!quiz) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
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

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="font-heading text-3xl font-bold">Edit Quiz</h1>
        <p className="mt-1 text-muted-foreground">
          Update your quiz questions and settings
        </p>
      </motion.div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-center gap-2">
          {steps.map((stepName, i) => (
            <div key={stepName} className="flex items-center">
              <button
                onClick={() => setStep(i)}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  step === i
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-current/10 text-xs">
                  {i + 1}
                </span>
                {stepName}
              </button>
              {i < steps.length - 1 && (
                <ChevronRight className="mx-2 h-4 w-4 text-muted-foreground" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div
            key="details"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Quiz Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter quiz title..."
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe what this quiz is about..."
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label className="mb-2 flex items-center gap-2">
                    <Palette className="h-4 w-4" />
                    Theme
                  </Label>
                  <ThemeSelector value={theme} onChange={setTheme} />
                </div>
                <div>
                  <Label>Difficulty</Label>
                  <Select
                    value={difficulty}
                    onValueChange={(v) => setDifficulty(v as DifficultyLevel)}
                  >
                    <SelectTrigger className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {difficultyLevels.map((level) => (
                        <SelectItem key={level} value={level}>
                          {level.charAt(0).toUpperCase() + level.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div
            key="questions"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <AnimatePresence>
              {questions.map((question, index) => (
                <QuestionEditor
                  key={question.id}
                  question={question}
                  index={index}
                  onUpdate={(q) => updateQuestion(index, q)}
                  onDelete={() => deleteQuestion(index)}
                />
              ))}
            </AnimatePresence>

            <Button
              variant="outline"
              onClick={addQuestion}
              className="w-full gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Question
            </Button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="settings"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Quiz Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Enable Timer</p>
                      <p className="text-sm text-muted-foreground">
                        Set a time limit for the entire quiz
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={enableTimer}
                    onCheckedChange={setEnableTimer}
                  />
                </div>

                {enableTimer && (
                  <div>
                    <Label>Time Limit (minutes)</Label>
                    <Select
                      value={(timeLimit ? timeLimit / 60 : 5).toString()}
                      onValueChange={(v) => setTimeLimit(parseInt(v) * 60)}
                    >
                      <SelectTrigger className="mt-1.5 w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[2, 5, 10, 15, 20, 30, 45, 60].map((m) => (
                          <SelectItem key={m} value={m.toString()}>
                            {m} minutes
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="rounded-lg border bg-muted/50 p-4">
                  <h4 className="font-medium">Quiz Summary</h4>
                  <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                    <p>Title: {title || "Untitled"}</p>
                    <p>Questions: {questions.length}</p>
                    <p>Theme: {theme.charAt(0).toUpperCase() + theme.slice(1)}</p>
                    <p>Difficulty: {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}</p>
                    {enableTimer && <p>Time Limit: {timeLimit ? timeLimit / 60 : 5} minutes</p>}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Buttons */}
      <div className="mt-8 flex justify-between">
        <Button
          variant="outline"
          onClick={() => setStep(Math.max(0, step - 1))}
          disabled={step === 0}
          className="gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>

        {step < steps.length - 1 ? (
          <Button
            onClick={() => setStep(step + 1)}
            className="gap-2"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={updateMutation.isPending}
            className="gap-2"
          >
            {updateMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
