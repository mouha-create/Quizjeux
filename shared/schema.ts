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

// Quiz categories
export const quizCategories = [
  "Science",
  "History",
  "Geography",
  "Mathematics",
  "Literature",
  "Sports",
  "Technology",
  "Art",
  "Music",
  "General Knowledge",
] as const;

export type QuizCategory = typeof quizCategories[number];

// Quiz schema
export const quizSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  description: z.string().optional(),
  questions: z.array(questionSchema),
  theme: z.enum(quizThemes).default("purple"),
  difficulty: z.enum(difficultyLevels).default("intermediate"),
  timeLimit: z.number().optional(),
  category: z.enum(quizCategories).optional(),
  tags: z.array(z.string()).default([]),
  isPublic: z.boolean().default(true),
  sharedWithGroups: z.array(z.string()).optional(), // IDs des groupes avec lesquels le quiz est partagé
  userId: z.string().optional(),
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

// Badge definitions - Using the new extensible badge system
import { getAllBadges } from "./badge-rules";

// Get all badges from the badge rules system
export const badges = getAllBadges();

export type BadgeId = string;

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

// Group/Guilde schemas
export const groupSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(50),
  description: z.string().optional(),
  badge: z.string().optional(),
  creatorId: z.string(),
  visibility: z.enum(["public", "private"]).default("public"),
  joinType: z.enum(["open", "invite_only"]).default("open"),
  memberCount: z.number().default(0),
  totalQuizzes: z.number().default(0),
  averageScore: z.number().default(0),
  totalPoints: z.number().default(0),
  badges: z.array(z.string()).default([]),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Group = z.infer<typeof groupSchema>;

export const createGroupSchema = z.object({
  name: z.string().min(1).max(50),
  description: z.string().optional(),
  badge: z.string().optional(),
  visibility: z.enum(["public", "private"]).default("public"),
  joinType: z.enum(["open", "invite_only"]).default("open"),
});

export type CreateGroupRequest = z.infer<typeof createGroupSchema>;

export const groupMemberSchema = z.object({
  groupId: z.string(),
  userId: z.string(),
  role: z.enum(["creator", "admin", "member"]).default("member"),
  joinedAt: z.string(),
  contributedQuizzes: z.number().default(0),
  contributedPoints: z.number().default(0),
});

export type GroupMember = z.infer<typeof groupMemberSchema>;

export type AuthResponse = z.infer<typeof authResponseSchema>;

// ============ DRIZZLE ORM TABLES ============
import { pgTable, text, integer, timestamp, varchar, jsonb, boolean } from "drizzle-orm/pg-core";
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
  category: varchar("category"),
  tags: text("tags").array().default(sql`ARRAY[]::text[]`),
  isPublic: boolean("is_public").default(true),
  sharedWithGroups: text("shared_with_groups").array().default(sql`ARRAY[]::text[]`),
  userId: varchar("user_id"),
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

// User favorites table
export const userFavoritesTable = pgTable("user_favorites", {
  userId: varchar("user_id").notNull(),
  quizId: varchar("quiz_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  pk: sql`PRIMARY KEY (${table.userId}, ${table.quizId})`,
}));

// Groups/Guilde system tables
export const groupsTable = pgTable("groups", {
  id: varchar("id").primaryKey(),
  name: varchar("name").notNull(),
  description: text("description"),
  badge: varchar("badge"), // Badge/logo du groupe
  creatorId: varchar("creator_id").notNull(),
  visibility: varchar("visibility").default("public"), // public, private
  joinType: varchar("join_type").default("open"), // open, invite_only
  memberCount: integer("member_count").default(0),
  totalQuizzes: integer("total_quizzes").default(0),
  averageScore: integer("average_score").default(0),
  totalPoints: integer("total_points").default(0),
  badges: text("badges").array().default(sql`ARRAY[]::text[]`),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const groupMembersTable = pgTable("group_members", {
  groupId: varchar("group_id").notNull(),
  userId: varchar("user_id").notNull(),
  role: varchar("role").default("member"), // creator, admin, member
  joinedAt: timestamp("joined_at").defaultNow(),
  contributedQuizzes: integer("contributed_quizzes").default(0),
  contributedPoints: integer("contributed_points").default(0),
}, (table) => ({
  pk: sql`PRIMARY KEY (${table.groupId}, ${table.userId})`,
}));

export const groupQuizzesTable = pgTable("group_quizzes", {
  groupId: varchar("group_id").notNull(),
  quizId: varchar("quiz_id").notNull(),
  sharedBy: varchar("shared_by").notNull(), // userId qui a partagé
  sharedAt: timestamp("shared_at").defaultNow(),
}, (table) => ({
  pk: sql`PRIMARY KEY (${table.groupId}, ${table.quizId})`,
}));

// Session table for connect-pg-simple
export const userSessionsTable = pgTable("user_sessions", {
  sid: varchar("sid").primaryKey(),
  sess: jsonb("sess").notNull(),
  expire: timestamp("expire").notNull(),
});
