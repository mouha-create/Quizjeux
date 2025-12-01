import { z } from "zod";

// Question types enum
export const questionTypes = ["multiple", "truefalse", "text", "ranking"] as const;
export type QuestionType = typeof questionTypes[number];

// Difficulty levels
export const difficultyLevels = ["beginner", "intermediate", "expert"] as const;
export type DifficultyLevel = typeof difficultyLevels[number];

// Quiz themes
export const quizThemes = ["purple", "green", "orange", "pink", "blue"] as const;
export type QuizTheme = typeof quizThemes[number];

// Question schema
export const questionSchema = z.object({
  id: z.string(),
  type: z.enum(questionTypes),
  question: z.string().min(1),
  options: z.array(z.string()).optional(),
  correctAnswer: z.union([z.string(), z.array(z.string())]),
  explanation: z.string().optional(),
  points: z.number().default(10),
  timeLimit: z.number().optional(),
});

export type Question = z.infer<typeof questionSchema>;

// Quiz schema
export const quizSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  description: z.string().optional(),
  questions: z.array(questionSchema),
  theme: z.enum(quizThemes).default("purple"),
  difficulty: z.enum(difficultyLevels).default("intermediate"),
  timeLimit: z.number().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  plays: z.number().default(0),
  averageScore: z.number().default(0),
});

export type Quiz = z.infer<typeof quizSchema>;

// Insert quiz schema (for creation)
export const insertQuizSchema = quizSchema.omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true,
  plays: true,
  averageScore: true 
});

export type InsertQuiz = z.infer<typeof insertQuizSchema>;

// Quiz attempt/result schema
export const quizResultSchema = z.object({
  id: z.string(),
  quizId: z.string(),
  score: z.number(),
  totalPoints: z.number(),
  correctAnswers: z.number(),
  totalQuestions: z.number(),
  timeSpent: z.number(),
  answers: z.record(z.string(), z.union([z.string(), z.array(z.string())])),
  completedAt: z.string(),
  streak: z.number().default(0),
});

export type QuizResult = z.infer<typeof quizResultSchema>;

// User stats schema (for gamification)
export const userStatsSchema = z.object({
  totalQuizzes: z.number().default(0),
  totalQuestions: z.number().default(0),
  correctAnswers: z.number().default(0),
  totalPoints: z.number().default(0),
  level: z.number().default(1),
  xp: z.number().default(0),
  currentStreak: z.number().default(0),
  bestStreak: z.number().default(0),
  badges: z.array(z.string()).default([]),
  quizHistory: z.array(z.string()).default([]),
});

export type UserStats = z.infer<typeof userStatsSchema>;

// Badge definitions
export const badges = {
  firstQuiz: { id: "firstQuiz", name: "First Steps", description: "Complete your first quiz", icon: "Trophy" },
  perfectScore: { id: "perfectScore", name: "Perfect!", description: "Get 100% on a quiz", icon: "Star" },
  streak5: { id: "streak5", name: "On Fire", description: "Get 5 correct answers in a row", icon: "Flame" },
  streak10: { id: "streak10", name: "Unstoppable", description: "Get 10 correct answers in a row", icon: "Zap" },
  quizMaster: { id: "quizMaster", name: "Quiz Master", description: "Complete 10 quizzes", icon: "Award" },
  speedster: { id: "speedster", name: "Speedster", description: "Complete a quiz in under 2 minutes", icon: "Clock" },
  creator: { id: "creator", name: "Creator", description: "Create your first quiz", icon: "Sparkles" },
  brainiac: { id: "brainiac", name: "Brainiac", description: "Answer 100 questions correctly", icon: "Brain" },
} as const;

export type BadgeId = keyof typeof badges;

// AI Quiz generation request
export const aiGenerateRequestSchema = z.object({
  topic: z.string().min(1),
  numberOfQuestions: z.number().min(5).max(20).default(10),
  difficulty: z.enum(difficultyLevels).default("intermediate"),
  questionTypes: z.array(z.enum(questionTypes)).default(["multiple", "truefalse"]),
});

export type AIGenerateRequest = z.infer<typeof aiGenerateRequestSchema>;

// Leaderboard entry
export const leaderboardEntrySchema = z.object({
  rank: z.number(),
  name: z.string(),
  score: z.number(),
  quizzes: z.number(),
  accuracy: z.number(),
});

export type LeaderboardEntry = z.infer<typeof leaderboardEntrySchema>;

// User schema
export const userSchema = z.object({
  id: z.string(),
  username: z.string().min(3),
  email: z.string().email(),
  createdAt: z.string(),
});

export type User = z.infer<typeof userSchema>;

// Auth schemas
export const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export type LoginRequest = z.infer<typeof loginSchema>;

export const signupSchema = z.object({
  username: z.string().min(3).max(20),
  email: z.string().email(),
  password: z.string().min(6),
});

export type SignupRequest = z.infer<typeof signupSchema>;

export const authResponseSchema = z.object({
  user: z.object({
    id: z.string(),
    username: z.string(),
    email: z.string(),
  }),
});

export type AuthResponse = z.infer<typeof authResponseSchema>;

// ============ DRIZZLE ORM TABLES ============
import { pgTable, text, integer, timestamp, varchar, jsonb } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const usersTable = pgTable("users", {
  id: varchar("id").primaryKey(),
  username: varchar("username").notNull().unique(),
  email: varchar("email").notNull().unique(),
  password: varchar("password").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const quizzesTable = pgTable("quizzes", {
  id: varchar("id").primaryKey(),
  title: varchar("title").notNull(),
  description: text("description"),
  questions: jsonb("questions").notNull(),
  theme: varchar("theme").default("purple"),
  difficulty: varchar("difficulty").default("intermediate"),
  timeLimit: integer("time_limit"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  plays: integer("plays").default(0),
  averageScore: integer("average_score").default(0),
});

export const resultsTable = pgTable("results", {
  id: varchar("id").primaryKey(),
  quizId: varchar("quiz_id").notNull(),
  userId: varchar("user_id"),
  score: integer("score").notNull(),
  totalPoints: integer("total_points").notNull(),
  correctAnswers: integer("correct_answers").notNull(),
  totalQuestions: integer("total_questions").notNull(),
  timeSpent: integer("time_spent").notNull(),
  answers: jsonb("answers").notNull(),
  completedAt: timestamp("completed_at").defaultNow(),
  streak: integer("streak").default(0),
});

export const userStatsTable = pgTable("user_stats", {
  userId: varchar("user_id").primaryKey(),
  totalQuizzes: integer("total_quizzes").default(0),
  totalQuestions: integer("total_questions").default(0),
  correctAnswers: integer("correct_answers").default(0),
  totalPoints: integer("total_points").default(0),
  level: integer("level").default(1),
  xp: integer("xp").default(0),
  currentStreak: integer("current_streak").default(0),
  bestStreak: integer("best_streak").default(0),
  badges: text("badges").array().default(sql`ARRAY[]::text[]`),
  quizHistory: text("quiz_history").array().default(sql`ARRAY[]::text[]`),
});

// Session table for connect-pg-simple
export const userSessionsTable = pgTable("user_sessions", {
  sid: varchar("sid").primaryKey(),
  sess: jsonb("sess").notNull(),
  expire: timestamp("expire").notNull(),
});
