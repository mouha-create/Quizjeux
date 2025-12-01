import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, Plus, Trash2, GripVertical, ChevronLeft, ChevronRight,
  CheckCircle, Save, Wand2, Loader2, Clock, Palette
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
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
import type { Question, QuestionType, QuizTheme, DifficultyLevel, InsertQuiz } from "@shared/schema";
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
            data-testid={`button-theme-${theme}`}
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
          data-testid={`badge-type-${type}`}
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
    if (question.correctAnswer === question.options?.[optionIndex]) {
      updateField("correctAnswer", "");
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card className="relative" data-testid={`card-question-${index}`}>
        <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-4">
          <GripVertical className="h-5 w-5 cursor-grab text-muted-foreground" />
          <Badge variant="secondary">Question {index + 1}</Badge>
          <div className="flex-1" />
          <Button
            variant="ghost"
            size="icon"
            onClick={onDelete}
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            data-testid={`button-delete-question-${index}`}
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
                } else if (type === "text" || type === "ranking") {
                  updateField("options", undefined);
                }
              }}
            />
          </div>

          <div>
            <Label htmlFor={`question-${index}`}>Question Text</Label>
            <Textarea
              id={`question-${index}`}
              value={question.question}
              onChange={(e) => updateField("question", e.target.value)}
              placeholder="Enter your question..."
              className="mt-1.5"
              data-testid={`input-question-text-${index}`}
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
                      data-testid={`button-correct-${index}-${i}`}
                    >
                      {String.fromCharCode(65 + i)}
                    </button>
                    <Input
                      value={option}
                      onChange={(e) => updateOption(i, e.target.value)}
                      placeholder={`Option ${String.fromCharCode(65 + i)}`}
                      disabled={question.type === "truefalse"}
                      data-testid={`input-option-${index}-${i}`}
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
                  data-testid={`button-add-option-${index}`}
                >
                  <Plus className="h-4 w-4" />
                  Add Option
                </Button>
              )}
            </div>
          )}

          {question.type === "text" && (
            <div>
              <Label htmlFor={`correct-${index}`}>Correct Answer</Label>
              <Input
                id={`correct-${index}`}
                value={question.correctAnswer as string}
                onChange={(e) => updateField("correctAnswer", e.target.value)}
                placeholder="Enter the correct answer..."
                className="mt-1.5"
                data-testid={`input-correct-answer-${index}`}
              />
            </div>
          )}

          {question.type === "ranking" && (
            <div>
              <Label>Items to Rank (in correct order)</Label>
              <div className="mt-1.5 space-y-2">
                {(Array.isArray(question.correctAnswer) ? question.correctAnswer : []).map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded bg-muted text-sm font-medium">
                      {i + 1}
                    </span>
                    <Input
                      value={item}
                      onChange={(e) => {
                        const newItems = [...(question.correctAnswer as string[])];
                        newItems[i] = e.target.value;
                        updateField("correctAnswer", newItems);
                      }}
                      placeholder={`Item ${i + 1}`}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        const newItems = (question.correctAnswer as string[]).filter((_, idx) => idx !== i);
                        updateField("correctAnswer", newItems);
                      }}
                      className="h-8 w-8 shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const currentItems = Array.isArray(question.correctAnswer) ? question.correctAnswer : [];
                    updateField("correctAnswer", [...currentItems, ""]);
                  }}
                  className="gap-1"
                >
                  <Plus className="h-4 w-4" />
                  Add Item
                </Button>
              </div>
            </div>
          )}

          <div>
            <Label htmlFor={`explanation-${index}`}>Explanation (Optional)</Label>
            <Textarea
              id={`explanation-${index}`}
              value={question.explanation || ""}
              onChange={(e) => updateField("explanation", e.target.value)}
              placeholder="Explain why this is the correct answer..."
              className="mt-1.5"
              data-testid={`input-explanation-${index}`}
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function Create() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  
  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [theme, setTheme] = useState<QuizTheme>("purple");
  const [difficulty, setDifficulty] = useState<DifficultyLevel>("intermediate");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [timeLimit, setTimeLimit] = useState<number | undefined>(undefined);
  const [enableTimer, setEnableTimer] = useState(false);
  
  // AI generation
  const [aiTopic, setAiTopic] = useState("");
  const [aiQuestionCount, setAiQuestionCount] = useState(10);
  const [aiTypes, setAiTypes] = useState<QuestionType[]>(["multiple", "truefalse"]);

  const createMutation = useMutation({
    mutationFn: async (quiz: InsertQuiz) => {
      return await apiRequest("POST", "/api/quizzes", quiz);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quizzes"] });
      toast({
        title: "Quiz created!",
        description: "Your quiz has been saved successfully.",
      });
      navigate("/library");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create quiz. Please try again.",
        variant: "destructive",
      });
    },
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/quizzes/generate", {
        topic: aiTopic,
        numberOfQuestions: aiQuestionCount,
        difficulty,
        questionTypes: aiTypes,
      });
      const data = await response.json();
      return data as { questions: Question[] };
    },
    onSuccess: (data) => {
      setQuestions(data.questions);
      toast({
        title: "Questions generated!",
        description: `Created ${data.questions.length} questions from AI.`,
      });
      setStep(1);
    },
    onError: () => {
      toast({
        title: "Generation failed",
        description: "Could not generate questions. Please try again or create manually.",
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

    if (questions.length === 0) {
      toast({
        title: "Questions required",
        description: "Please add at least one question to your quiz.",
        variant: "destructive",
      });
      setStep(1);
      return;
    }

    const quiz: InsertQuiz = {
      title,
      description,
      questions,
      theme,
      difficulty,
      timeLimit: enableTimer ? timeLimit : undefined,
    };

    createMutation.mutate(quiz);
  };

  const toggleAiType = (type: QuestionType) => {
    if (aiTypes.includes(type)) {
      if (aiTypes.length > 1) {
        setAiTypes(aiTypes.filter((t) => t !== type));
      }
    } else {
      setAiTypes([...aiTypes, type]);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="font-heading text-3xl font-bold">Create New Quiz</h1>
        <p className="mt-1 text-muted-foreground">
          Build an engaging quiz in minutes with AI assistance
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
                    : step > i
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-muted text-muted-foreground"
                }`}
                data-testid={`button-step-${i}`}
              >
                {step > i ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-current/10 text-xs">
                    {i + 1}
                  </span>
                )}
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
            className="space-y-6"
          >
            {/* AI Generation Card */}
            <Card className="border-primary/30 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wand2 className="h-5 w-5 text-primary" />
                  Generate with AI
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="ai-topic">Topic or Content</Label>
                  <Textarea
                    id="ai-topic"
                    value={aiTopic}
                    onChange={(e) => setAiTopic(e.target.value)}
                    placeholder="Enter a topic (e.g., 'World War II history') or paste content to generate questions from..."
                    className="mt-1.5"
                    data-testid="input-ai-topic"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label>Number of Questions</Label>
                    <Select
                      value={aiQuestionCount.toString()}
                      onValueChange={(v) => setAiQuestionCount(parseInt(v))}
                    >
                      <SelectTrigger className="mt-1.5" data-testid="select-question-count">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[5, 10, 15, 20].map((n) => (
                          <SelectItem key={n} value={n.toString()}>
                            {n} questions
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Difficulty</Label>
                    <Select
                      value={difficulty}
                      onValueChange={(v) => setDifficulty(v as DifficultyLevel)}
                    >
                      <SelectTrigger className="mt-1.5" data-testid="select-difficulty">
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
                </div>
                <div>
                  <Label>Question Types to Include</Label>
                  <div className="mt-1.5 flex flex-wrap gap-2">
                    {(["multiple", "truefalse"] as QuestionType[]).map((type) => (
                      <Badge
                        key={type}
                        variant={aiTypes.includes(type) ? "default" : "secondary"}
                        className="cursor-pointer"
                        onClick={() => toggleAiType(type)}
                      >
                        {type === "multiple" ? "Multiple Choice" : "True/False"}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Button
                  onClick={() => generateMutation.mutate()}
                  disabled={!aiTopic.trim() || generateMutation.isPending}
                  className="w-full gap-2"
                  data-testid="button-generate-ai"
                >
                  {generateMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Generate Questions
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Manual Details */}
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
                    data-testid="input-title"
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
                    data-testid="input-description"
                  />
                </div>
                <div>
                  <Label className="mb-2 flex items-center gap-2">
                    <Palette className="h-4 w-4" />
                    Theme
                  </Label>
                  <ThemeSelector value={theme} onChange={setTheme} />
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
              data-testid="button-add-question"
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
                    data-testid="switch-timer"
                  />
                </div>

                {enableTimer && (
                  <div>
                    <Label>Time Limit (minutes)</Label>
                    <Select
                      value={(timeLimit ? timeLimit / 60 : 5).toString()}
                      onValueChange={(v) => setTimeLimit(parseInt(v) * 60)}
                    >
                      <SelectTrigger className="mt-1.5 w-48" data-testid="select-time-limit">
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
          data-testid="button-prev-step"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>

        {step < steps.length - 1 ? (
          <Button
            onClick={() => setStep(step + 1)}
            className="gap-2"
            data-testid="button-next-step"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={createMutation.isPending}
            className="gap-2"
            data-testid="button-save-quiz"
          >
            {createMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Quiz
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
