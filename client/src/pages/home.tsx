import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Sparkles, Zap, Trophy, Brain, Target, Clock, ChevronRight, Play, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/lib/auth-context";
import { SEO } from "@/components/seo";
import { AdSenseAutorelaxed, AdSenseFluid } from "@/components/adsense";

const features = [
  {
    icon: Sparkles,
    title: "Génération par IA",
    description: "Créez des quiz professionnels en quelques secondes sur n'importe quel sujet grâce à l'IA",
  },
  {
    icon: Brain,
    title: "4 Types de Questions",
    description: "Choix multiples, vrai/faux, texte court et questions de classement",
  },
  {
    icon: Target,
    title: "Niveaux de Difficulté",
    description: "Modes débutant, intermédiaire et expert pour tous les publics",
  },
  {
    icon: Trophy,
    title: "Gamification",
    description: "XP, niveaux, badges et séries pour maintenir l'engagement des apprenants",
  },
  {
    icon: Clock,
    title: "Quiz Chronométrés",
    description: "Minuteurs optionnels avec compte à rebours pour un jeu compétitif",
  },
  {
    icon: Users,
    title: "Partage Facile",
    description: "Partagez vos quiz via des liens uniques avec n'importe qui",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function Home() {
  return (
    <>
      <SEO
        title="QuizCraft AI - Create Interactive Quizzes with AI"
        description="Create engaging, AI-powered quizzes in minutes. Perfect for education, marketing, and recruitment. Features gamification, analytics, and customizable themes."
        keywords="quiz, quiz maker, AI quiz generator, online quiz, interactive quiz, quiz creator, gamification, quiz platform, education, learning"
      />
      <HomeContent />
    </>
  );
}

function HomeContent() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const handleCreateClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (user) {
      setLocation("/create");
    } else {
      setLocation("/login");
    }
  };

  const handleBrowseClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (user) {
      setLocation("/library");
    } else {
      setLocation("/login");
    }
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-500 via-purple-600 to-blue-600 px-4 py-20 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iNCIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        
        {/* Floating decorations */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 0.2, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="absolute left-10 top-20 hidden lg:block"
        >
          <Sparkles className="h-12 w-12 text-white" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 0.2, scale: 1 }}
          transition={{ delay: 0.7, duration: 0.8 }}
          className="absolute right-20 top-32 hidden lg:block"
        >
          <Trophy className="h-10 w-10 text-white" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 0.2, scale: 1 }}
          transition={{ delay: 0.9, duration: 0.8 }}
          className="absolute bottom-20 left-1/4 hidden lg:block"
        >
          <Zap className="h-8 w-8 text-white" />
        </motion.div>

        <div className="relative mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center lg:text-left"
            >
              <h1 className="font-heading text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
                Créez des Quiz Époustouflants avec{" "}
                <span className="bg-gradient-to-r from-yellow-200 to-yellow-400 bg-clip-text text-transparent">
                  la Magie de l'IA
                </span>
              </h1>
              <p className="mt-6 text-lg text-purple-100 sm:text-xl">
                Créez des quiz interactifs et engageants en quelques minutes. Parfait pour l'éducation, 
                le marketing et le recrutement. Alimenté par l'IA pour une génération instantanée de questions.
              </p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start">
                <Button 
                  size="lg" 
                  variant="secondary" 
                  className="w-full gap-2 sm:w-auto" 
                  data-testid="button-hero-create"
                  onClick={handleCreateClick}
                >
                  <Sparkles className="h-5 w-5" />
                  Créer avec l'IA
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="w-full gap-2 border-white/30 bg-white/10 text-white backdrop-blur-sm sm:w-auto"
                  data-testid="button-hero-browse"
                  onClick={handleBrowseClick}
                >
                  <Play className="h-5 w-5" />
                  Parcourir les Quiz
                </Button>
              </div>
            </motion.div>

            {/* Preview Card */}
            <motion.div
              initial={{ opacity: 0, x: 50, rotateY: -10 }}
              animate={{ opacity: 1, x: 0, rotateY: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="hidden lg:block"
            >
              <Card className="relative mx-auto max-w-md overflow-hidden shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10" />
                <CardContent className="p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-700 dark:bg-purple-900/50 dark:text-purple-300">
                      Question 3 sur 10
                    </span>
                    <span className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      0:45
                    </span>
                  </div>
                  <h3 className="mb-6 text-xl font-semibold">
                    Quelle est la capitale de la France ?
                  </h3>
                  <div className="space-y-3">
                    {["Londres", "Paris", "Berlin", "Madrid"].map((option, i) => (
                      <div
                        key={option}
                        className={`flex cursor-pointer items-center gap-3 rounded-lg border-2 p-4 transition-all ${
                          i === 1
                            ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div
                          className={`flex h-6 w-6 items-center justify-center rounded-full text-sm font-medium ${
                            i === 1
                              ? "bg-green-500 text-white"
                              : "bg-muted"
                          }`}
                        >
                          {String.fromCharCode(65 + i)}
                        </div>
                        <span className={i === 1 ? "font-medium" : ""}>
                          {option}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="font-heading text-3xl font-bold sm:text-4xl">
              Tout ce dont vous avez besoin pour créer des quiz incroyables
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Des fonctionnalités puissantes pour vous aider à créer, gérer et partager des quiz engageants
              qui captivent votre audience.
            </p>
          </motion.div>

          <div className="my-8 flex justify-center">
            <AdSenseAutorelaxed />
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
          >
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <motion.div key={feature.title} variants={itemVariants}>
                  <Card className="h-full hover-elevate">
                    <CardContent className="p-6">
                      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-blue-500">
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="mb-2 font-heading text-xl font-semibold">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-muted px-4 py-20 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="mx-auto max-w-4xl text-center"
        >
          <h2 className="font-heading text-3xl font-bold sm:text-4xl">
            Prêt à créer votre premier quiz ?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Rejoignez des milliers d'éducateurs, de marketeurs et de professionnels RH qui utilisent
            QuizCraft pour créer des quiz engageants.
          </p>
          <div className="my-8 flex justify-center">
            <AdSenseFluid />
          </div>
          <Button 
            size="lg" 
            className="mt-8 gap-2" 
            data-testid="button-cta-create"
            onClick={handleCreateClick}
          >
            Commencer Gratuitement
            <ChevronRight className="h-5 w-5" />
          </Button>
        </motion.div>
      </section>
    </div>
  );
}
