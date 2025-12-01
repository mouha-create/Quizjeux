import { pgTable, text, integer, timestamp, varchar, jsonb } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: varchar("username").notNull().unique(),
  email: varchar("email").notNull().unique(),
  password: varchar("password").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Quizzes table
export const quizzes = pgTable("quizzes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
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

// Quiz results table
export const results = pgTable("results", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  quizId: varchar("quiz_id").notNull(),
  userId: varchar("user_id").notNull(),
  score: integer("score").notNull(),
  totalPoints: integer("total_points").notNull(),
  correctAnswers: integer("correct_answers").notNull(),
  totalQuestions: integer("total_questions").notNull(),
  timeSpent: integer("time_spent").notNull(),
  answers: jsonb("answers").notNull(),
  completedAt: timestamp("completed_at").defaultNow(),
  streak: integer("streak").default(0),
});

// User stats table
export const userStats = pgTable("user_stats", {
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
