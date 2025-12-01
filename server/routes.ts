import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateQuestions as generateQuestionsAnthropic } from "./anthropic";
import { generateQuestions as generateQuestionsOpenAI } from "./openai";
import { insertQuizSchema, aiGenerateRequestSchema, loginSchema, signupSchema } from "@shared/schema";
import type { Question, QuizResult } from "@shared/schema";
import { hashPassword, verifyPassword } from "./auth";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Auth routes
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const validationResult = signupSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ error: "Invalid signup data" });
      }

      const { username, email, password } = validationResult.data;

      const existing = await storage.getUserByUsername(username);
      if (existing) {
        return res.status(409).json({ error: "Username already taken" });
      }

      const existingEmail = await storage.getUserByEmail(email);
      if (existingEmail) {
        return res.status(409).json({ error: "Email already registered" });
      }

      const hashedPassword = await hashPassword(password);
      const user = await storage.createUser(username, email, hashedPassword);

      req.session.userId = user.id;
      // Save session explicitly
      req.session.save((err) => {
        if (err) {
          console.error("Error saving session:", err);
          return res.status(500).json({ error: "Signup failed" });
        }
        res.status(201).json({ user: { id: user.id, username: user.username, email: user.email } });
      });
    } catch (error) {
      res.status(500).json({ error: "Signup failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const validationResult = loginSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ error: "Invalid login data" });
      }

      const { username, password } = validationResult.data;
      const userEntry = await storage.getUserByUsername(username);

      if (!userEntry || !(await verifyPassword(password, userEntry.password))) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      req.session.userId = userEntry.user.id;
      // Save session explicitly
      req.session.save((err) => {
        if (err) {
          console.error("Error saving session:", err);
          return res.status(500).json({ error: "Login failed" });
        }
        console.log("Session saved, userId:", req.session.userId, "sessionID:", req.sessionID);
        res.json({ user: { id: userEntry.user.id, username: userEntry.user.username, email: userEntry.user.email } });
      });
    } catch (error) {
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Logout failed" });
      }
      res.json({ success: true });
    });
  });

  app.get("/api/auth/me", async (req, res) => {
    try {
      console.log("GET /api/auth/me - sessionID:", req.sessionID, "userId:", req.session?.userId);
      if (!req.session?.userId) {
        console.log("No userId in session");
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      // Get user from database
      const user = await storage.getUserById(req.session.userId);
      if (!user) {
        // Session exists but user not found - clear session
        req.session.destroy(() => {});
        return res.status(401).json({ error: "User not found" });
      }
      
      res.json({ user });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  // Redirect common typos to /api/quizzes
  const handleGetQuizzes = async (req: any, res: any) => {
    try {
      const quizzes = await storage.getQuizzes();
      res.json(quizzes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch quizzes" });
    }
  };

  app.get("/api/quizes", handleGetQuizzes); // 1 'z'
  app.get("/api/quizizes", handleGetQuizzes); // 2 'z'
  app.get("/api/quizizzes", handleGetQuizzes); // 3 'z'

  // Get all quizzes
  app.get("/api/quizzes", handleGetQuizzes);

  // Get single quiz
  app.get("/api/quizzes/:id", async (req, res) => {
    try {
      const quiz = await storage.getQuiz(req.params.id);
      if (!quiz) {
        return res.status(404).json({ error: "Quiz not found" });
      }
      res.json(quiz);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch quiz" });
    }
  });

  // Create quiz
  app.post("/api/quizzes", async (req, res) => {
    try {
      const validationResult = insertQuizSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: "Invalid quiz data", 
          details: validationResult.error.errors 
        });
      }
      
      const quiz = await storage.createQuiz(validationResult.data);
      res.status(201).json(quiz);
    } catch (error) {
      res.status(500).json({ error: "Failed to create quiz" });
    }
  });

  // Update quiz
  app.patch("/api/quizzes/:id", async (req, res) => {
    try {
      const quiz = await storage.updateQuiz(req.params.id, req.body);
      if (!quiz) {
        return res.status(404).json({ error: "Quiz not found" });
      }
      res.json(quiz);
    } catch (error) {
      res.status(500).json({ error: "Failed to update quiz" });
    }
  });

  // Delete quiz
  app.delete("/api/quizzes/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteQuiz(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Quiz not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete quiz" });
    }
  });

  // Duplicate quiz
  app.post("/api/quizzes/:id/duplicate", async (req, res) => {
    try {
      const quiz = await storage.duplicateQuiz(req.params.id);
      if (!quiz) {
        return res.status(404).json({ error: "Quiz not found" });
      }
      res.status(201).json(quiz);
    } catch (error) {
      res.status(500).json({ error: "Failed to duplicate quiz" });
    }
  });

  // Generate questions with AI
  app.post("/api/quizzes/generate", async (req, res) => {
    try {
      const validationResult = aiGenerateRequestSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: "Invalid generation request", 
          details: validationResult.error.errors 
        });
      }

      let questions: Question[] | null = null;
      let lastError: Error | null = null;

      // Try Anthropic first
      try {
        if (process.env.ANTHROPIC_API_KEY) {
          questions = await generateQuestionsAnthropic(validationResult.data);
        }
      } catch (anthropicError: any) {
        console.error("Anthropic generation error:", anthropicError);
        lastError = anthropicError instanceof Error ? anthropicError : new Error(String(anthropicError));
        
        // Check if it's a billing/credit error
        const errorMessage = anthropicError?.error?.message || anthropicError?.message || "";
        if (errorMessage.includes("crédit") || errorMessage.includes("credit") || errorMessage.includes("billing")) {
          console.log("Anthropic billing error, trying OpenAI fallback...");
        }
      }

      // Fallback to OpenAI if Anthropic failed or not configured
      if (!questions) {
        try {
          if (process.env.OPENAI_API_KEY) {
            questions = await generateQuestionsOpenAI(validationResult.data);
          } else {
            throw new Error("No AI provider configured. Please add ANTHROPIC_API_KEY or OPENAI_API_KEY.");
          }
        } catch (openaiError: any) {
          console.error("OpenAI generation error:", openaiError);
          lastError = openaiError instanceof Error ? openaiError : new Error(String(openaiError));
        }
      }

      if (questions) {
        return res.json({ questions });
      }

      // If both failed, return a user-friendly error
      const userMessage = lastError?.message?.includes("crédit") || lastError?.message?.includes("credit")
        ? "Le service de génération IA n'est pas disponible actuellement. Veuillez créer vos questions manuellement."
        : "Impossible de générer des questions. Veuillez réessayer ou créer vos questions manuellement.";
      
      res.status(500).json({ 
        error: userMessage
      });
    } catch (error: any) {
      console.error("Unexpected AI generation error:", error);
      res.status(500).json({ 
        error: "Une erreur est survenue lors de la génération. Veuillez réessayer ou créer vos questions manuellement."
      });
    }
  });

  // Submit quiz answers
  app.post("/api/quizzes/submit", async (req, res) => {
    try {
      const { quizId, answers, timeSpent } = req.body;
      
      const quiz = await storage.getQuiz(quizId);
      if (!quiz) {
        return res.status(404).json({ error: "Quiz not found" });
      }

      // Calculate score
      let correctAnswers = 0;
      let totalPoints = 0;
      let currentStreak = 0;
      let maxStreak = 0;

      for (const question of quiz.questions) {
        const userAnswer = answers[question.id];
        const isCorrect = Array.isArray(question.correctAnswer)
          ? JSON.stringify(userAnswer) === JSON.stringify(question.correctAnswer)
          : userAnswer === question.correctAnswer ||
            (typeof userAnswer === "string" && 
             typeof question.correctAnswer === "string" &&
             userAnswer.toLowerCase() === question.correctAnswer.toLowerCase());

        if (isCorrect) {
          correctAnswers++;
          totalPoints += question.points;
          currentStreak++;
          if (currentStreak > maxStreak) {
            maxStreak = currentStreak;
          }
        } else {
          currentStreak = 0;
        }
      }

      const result: Omit<QuizResult, "id"> = {
        quizId,
        score: totalPoints,
        totalPoints: quiz.questions.reduce((sum, q) => sum + q.points, 0),
        correctAnswers,
        totalQuestions: quiz.questions.length,
        timeSpent,
        answers,
        completedAt: new Date().toISOString(),
        streak: maxStreak,
      };

      const savedResult = await storage.createResult(result);
      res.json(savedResult);
    } catch (error) {
      console.error("Submit error:", error);
      res.status(500).json({ error: "Failed to submit quiz" });
    }
  });

  // Get quiz results
  app.get("/api/results", async (req, res) => {
    try {
      const results = await storage.getResults();
      res.json(results);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch results" });
    }
  });

  // Get user stats
  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  // Get leaderboard
  app.get("/api/leaderboard", async (req, res) => {
    try {
      const leaderboard = await storage.getLeaderboard();
      res.json(leaderboard);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch leaderboard" });
    }
  });

  return httpServer;
}
