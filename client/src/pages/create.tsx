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
import { SEO } from "@/components/seo";
import { AdSenseInArticle, AdSenseAuto } from "@/components/adsense";
import type { Question, QuestionType, QuizTheme, DifficultyLevel, InsertQuiz, QuizCategory, Group } from "@shared/schema";
import { quizThemes, questionTypes, difficultyLevels, quizCategories } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { Checkbox } from "@/components/ui/checkbox";
import { Users } from "lucide-react";

const steps = ["Détails", "Questions", "Paramètres"];

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
    multiple: "Choix Multiple",
    truefalse: "Vrai/Faux",
    text: "Texte Court",
    ranking: "Classement",
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
    <div>
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
            <Label>Type de Question</Label>
            <QuestionTypeSelector
              value={question.type}
              onChange={(type) => {
                updateField("type", type);
                if (type === "truefalse") {
                  updateField("options", ["Vrai", "Faux"]);
                } else if (type === "multiple" && (!question.options || question.options.length === 0)) {
                  updateField("options", ["", "", "", ""]);
                } else if (type === "text" || type === "ranking") {
                  updateField("options", undefined);
                }
              }}
            />
          </div>

          <div>
            <Label htmlFor={`question-${index}`}>Texte de la Question</Label>
            <Textarea
              id={`question-${index}`}
              value={question.question}
              onChange={(e) => updateField("question", e.target.value)}
              placeholder="Entrez votre question..."
              className="mt-1.5"
              data-testid={`input-question-text-${index}`}
            />
          </div>

          {(question.type === "multiple" || question.type === "truefalse") && (
            <div>
              <Label>Options de Réponse</Label>
              <div className="mt-1.5 space-y-2">
                {(question.options || []).map((option, i) => (
                  <div key={`option-${index}-${i}`} className="flex items-center gap-2">
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
                  Ajouter une Option
                </Button>
              )}
            </div>
          )}

          {question.type === "text" && (
            <div>
              <Label htmlFor={`correct-${index}`}>Bonne Réponse</Label>
              <Input
                id={`correct-${index}`}
                value={question.correctAnswer as string}
                onChange={(e) => updateField("correctAnswer", e.target.value)}
                placeholder="Entrez la bonne réponse..."
                className="mt-1.5"
                data-testid={`input-correct-answer-${index}`}
              />
            </div>
          )}

          {question.type === "ranking" && (
            <div>
              <Label>Éléments à Classer (dans le bon ordre)</Label>
              <div className="mt-1.5 space-y-2">
                {(Array.isArray(question.correctAnswer) ? question.correctAnswer : []).map((item, i) => (
                  <div key={`ranking-item-${index}-${i}`} className="flex items-center gap-2">
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
                  Ajouter un Élément
                </Button>
              </div>
            </div>
          )}

          <div>
            <Label htmlFor={`explanation-${index}`}>Explication (Optionnel)</Label>
            <Textarea
              id={`explanation-${index}`}
              value={question.explanation || ""}
              onChange={(e) => updateField("explanation", e.target.value)}
              placeholder="Expliquez pourquoi c'est la bonne réponse..."
              className="mt-1.5"
              data-testid={`input-explanation-${index}`}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function Create() {
  return (
    <>
      <SEO
        title="Créer un Quiz - QuizCraft AI"
        description="Créez des quiz engageants en quelques minutes avec l'aide de l'IA."
        keywords="créer quiz, quiz maker, générateur de quiz, quiz IA"
      />
      <CreateContent />
    </>
  );
}

function CreateContent() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [theme, setTheme] = useState<QuizTheme>("purple");
  const [difficulty, setDifficulty] = useState<DifficultyLevel>("intermediate");
  const [category, setCategory] = useState<QuizCategory | undefined>(undefined);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [sharedWithGroups, setSharedWithGroups] = useState<string[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [timeLimit, setTimeLimit] = useState<number | undefined>(undefined);
  const [enableTimer, setEnableTimer] = useState(false);
  
  // AI generation
  const [aiTopic, setAiTopic] = useState("");
  const [aiQuestionCount, setAiQuestionCount] = useState(10);
  const [aiTypes, setAiTypes] = useState<QuestionType[]>(["multiple", "truefalse"]);

  // Get user's groups
  const { data: myGroups = [] } = useQuery<Group[]>({
    queryKey: ["/api/my-groups"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/my-groups");
      if (!response.ok) return [];
      return response.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (quiz: InsertQuiz) => {
      try {
        const response = await apiRequest("POST", "/api/quizzes", quiz);
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: "Failed to create quiz" }));
          throw new Error(errorData.error || "Failed to create quiz");
        }
        return await response.json();
      } catch (error: any) {
        console.error("Error in createMutation.mutationFn:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quizzes"] });
      toast({
        title: "Quiz créé !",
        description: "Votre quiz a été enregistré avec succès.",
      });
      // Use setTimeout to ensure toast is shown before navigation
      setTimeout(() => {
        navigate("/library");
      }, 100);
    },
    onError: (error: any) => {
      console.error("Error creating quiz:", error);
      const errorMessage = error?.message || "Failed to create quiz. Please try again.";
      setError(errorMessage);
      toast({
        title: "Erreur",
        description: errorMessage,
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
      if (data && data.questions && Array.isArray(data.questions)) {
        setQuestions(data.questions);
        toast({
        title: "Questions générées !",
        description: `${data.questions.length} questions créées par l'IA.`,
        });
        setStep(1);
      } else {
        throw new Error("Invalid response format from server");
      }
    },
    onError: (error: any) => {
      console.error("Error generating questions:", error);
      const errorMessage = error?.message || "Could not generate questions. Please try again or create manually.";
      toast({
        title: "Échec de la génération",
        description: errorMessage,
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

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast({
        title: "Titre requis",
        description: "Veuillez entrer un titre pour votre quiz.",
        variant: "destructive",
      });
      setStep(0);
      return;
    }

    if (questions.length === 0) {
      toast({
        title: "Questions requises",
        description: "Veuillez ajouter au moins une question à votre quiz.",
        variant: "destructive",
      });
      setStep(1);
      return;
    }

    // Validate questions before submission
    const invalidQuestions = questions.filter(q => {
      if (!q.question.trim()) return true;
      if (q.type === "multiple" || q.type === "truefalse") {
        if (!q.correctAnswer || !q.options || q.options.length === 0) return true;
      }
      if (q.type === "text" && !q.correctAnswer) return true;
      return false;
    });

    if (invalidQuestions.length > 0) {
      toast({
        title: "Questions invalides",
        description: "Veuillez compléter toutes les questions avant d'enregistrer.",
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
      category,
      tags,
      isPublic,
      sharedWithGroups: sharedWithGroups.length > 0 ? sharedWithGroups : undefined,
      timeLimit: enableTimer ? timeLimit : undefined,
    };

    try {
      createMutation.mutate(quiz);
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      toast({
        title: "Erreur",
        description: "Une erreur inattendue s'est produite. Veuillez réessayer.",
        variant: "destructive",
      });
    }
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

  // Error boundary - show error message if there's a critical error
  if (error && (error.includes("column") || error.includes("database"))) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Erreur de Base de Données</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Le schéma de la base de données est en cours de mise à jour. Veuillez actualiser la page dans quelques instants.
            </p>
            <Button onClick={() => window.location.reload()}>
              Actualiser la Page
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
        <h1 className="font-heading text-3xl font-bold">Créer un Nouveau Quiz</h1>
        <p className="mt-1 text-muted-foreground">
          Créez un quiz engageant en quelques minutes avec l'aide de l'IA
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
                  Générer avec l'IA
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="ai-topic">Sujet ou Contenu</Label>
                  <Textarea
                    id="ai-topic"
                    value={aiTopic}
                    onChange={(e) => setAiTopic(e.target.value)}
                    placeholder="Entrez un sujet (ex: 'Histoire de la Seconde Guerre mondiale') ou collez du contenu pour générer des questions..."
                    className="mt-1.5"
                    data-testid="input-ai-topic"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label>Nombre de Questions</Label>
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
                    <Label>Difficulté</Label>
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
                  <Label>Types de Questions à Inclure</Label>
                  <div className="mt-1.5 flex flex-wrap gap-2">
                    {(["multiple", "truefalse"] as QuestionType[]).map((type) => (
                      <Badge
                        key={type}
                        variant={aiTypes.includes(type) ? "default" : "secondary"}
                        className="cursor-pointer"
                        onClick={() => toggleAiType(type)}
                      >
                        {type === "multiple" ? "Choix Multiple" : "Vrai/Faux"}
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
                      Génération...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Générer les Questions
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Manual Details */}
            <Card>
              <CardHeader>
                <CardTitle>Détails du Quiz</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Titre *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Entrez le titre du quiz..."
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
                    placeholder="Décrivez le sujet de ce quiz..."
                    className="mt-1.5"
                    data-testid="input-description"
                  />
                </div>
                <div>
                  <Label className="mb-2 flex items-center gap-2">
                    <Palette className="h-4 w-4" />
                    Thème
                  </Label>
                  <ThemeSelector value={theme} onChange={setTheme} />
                </div>
                <div>
                  <Label htmlFor="category">Catégorie</Label>
                  <Select
                    value={category || "none"}
                    onValueChange={(v) => setCategory(v === "none" ? undefined : (v as QuizCategory))}
                  >
                    <SelectTrigger className="mt-1.5" id="category">
                      <SelectValue placeholder="Sélectionnez une catégorie (optionnel)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Aucune</SelectItem>
                      {quizCategories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="tags">Tags</Label>
                  <div className="mt-1.5 space-y-2">
                    <div className="flex gap-2">
                      <Input
                        id="tags"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && tagInput.trim()) {
                            e.preventDefault();
                            if (!tags.includes(tagInput.trim())) {
                              setTags([...tags, tagInput.trim()]);
                            }
                            setTagInput("");
                          }
                        }}
                        placeholder="Tapez un tag et appuyez sur Entrée..."
                        className="flex-1"
                      />
                    </div>
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {tags.map((tag, i) => (
                          <Badge
                            key={i}
                            variant="secondary"
                            className="gap-1"
                          >
                            {tag}
                            <button
                              onClick={() => setTags(tags.filter((_, idx) => idx !== i))}
                              className="ml-1 hover:text-destructive"
                            >
                              ×
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="isPublic">Quiz Public</Label>
                    <p className="text-sm text-muted-foreground">
                      Rendre ce quiz visible par tous
                    </p>
                  </div>
                  <Switch
                    id="isPublic"
                    checked={isPublic}
                    onCheckedChange={setIsPublic}
                  />
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
            {questions.map((question, index) => (
              <QuestionEditor
                key={question.id}
                question={question}
                index={index}
                onUpdate={(q) => updateQuestion(index, q)}
                onDelete={() => deleteQuestion(index)}
              />
            ))}

            <Button
              variant="outline"
              onClick={addQuestion}
              className="w-full gap-2"
              data-testid="button-add-question"
            >
              <Plus className="h-4 w-4" />
              Ajouter une Question
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
                <CardTitle>Paramètres du Quiz</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Activer le Minuteur</p>
                      <p className="text-sm text-muted-foreground">
                        Définir une limite de temps pour tout le quiz
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
                    <Label>Limite de Temps (minutes)</Label>
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

                {/* Share with Groups */}
                {myGroups && myGroups.length > 0 && (
                  <div>
                    <Label className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Partager avec des Groupes
                    </Label>
                    <p className="mt-1 mb-3 text-sm text-muted-foreground">
                      Sélectionnez les groupes avec lesquels partager ce quiz
                    </p>
                    <div className="space-y-2 rounded-lg border p-4">
                      {myGroups.map((group) => (
                        <div key={group.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`group-${group.id}`}
                            checked={sharedWithGroups.includes(group.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSharedWithGroups([...sharedWithGroups, group.id]);
                              } else {
                                setSharedWithGroups(sharedWithGroups.filter(id => id !== group.id));
                              }
                            }}
                          />
                          <label
                            htmlFor={`group-${group.id}`}
                            className="flex flex-1 cursor-pointer items-center justify-between text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            <div className="flex items-center gap-2">
                              {group.badge && <span>{group.badge}</span>}
                              <span>{group.name}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {group.memberCount} membres
                            </span>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="rounded-lg border bg-muted/50 p-4">
                  <h4 className="font-medium">Résumé du Quiz</h4>
                  <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                    <p>Titre : {title || "Sans titre"}</p>
                    <p>Questions : {questions.length}</p>
                    <p>Thème : {theme.charAt(0).toUpperCase() + theme.slice(1)}</p>
                    <p>Difficulté : {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}</p>
                    {enableTimer && <p>Limite de temps : {timeLimit ? timeLimit / 60 : 5} minutes</p>}
                    {sharedWithGroups.length > 0 && (
                      <p>Partagé avec : {sharedWithGroups.length} groupe(s)</p>
                    )}
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
          Précédent
        </Button>

        {step < steps.length - 1 ? (
          <Button
            onClick={() => setStep(step + 1)}
            className="gap-2"
            data-testid="button-next-step"
          >
            Suivant
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
                Enregistrement...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Enregistrer le Quiz
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
