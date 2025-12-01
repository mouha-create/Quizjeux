import type { 
  Quiz, InsertQuiz, Question, QuizResult, UserStats, LeaderboardEntry, User 
} from "@shared/schema";
import { badges } from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./database";
import { usersTable, quizzesTable, resultsTable, userStatsTable } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Quiz operations
  getQuizzes(): Promise<Quiz[]>;
  getQuiz(id: string): Promise<Quiz | undefined>;
  createQuiz(quiz: InsertQuiz): Promise<Quiz>;
  updateQuiz(id: string, updates: Partial<Quiz>): Promise<Quiz | undefined>;
  deleteQuiz(id: string): Promise<boolean>;
  duplicateQuiz(id: string): Promise<Quiz | undefined>;
  
  // Quiz results
  getResults(userId: string): Promise<QuizResult[]>;
  getResult(id: string): Promise<QuizResult | undefined>;
  createResult(result: Omit<QuizResult, "id">, userId: string): Promise<QuizResult>;
  
  // User stats
  getStats(userId: string): Promise<UserStats>;
  updateStats(userId: string, updates: Partial<UserStats>): Promise<UserStats>;
  
  // Leaderboard
  getLeaderboard(): Promise<LeaderboardEntry[]>;
  
  // User auth
  getUserByUsername(username: string): Promise<{ user: User; password: string } | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserById(id: string): Promise<User | undefined>;
  createUser(username: string, email: string, hashedPassword: string): Promise<User>;
}

export class DatabaseStorage implements IStorage {
  async getQuizzes(): Promise<Quiz[]> {
    try {
      console.log("Fetching all quizzes from database...");
      const quizList = await db.select().from(quizzesTable);
      console.log(`Found ${quizList.length} quiz(es) in database`);
      return quizList.map(q => ({
        id: q.id,
        title: q.title,
        description: q.description || undefined,
        questions: (q.questions as any) || [],
        theme: (q.theme as any) || "purple",
        difficulty: (q.difficulty as any) || "intermediate",
        timeLimit: q.timeLimit || undefined,
        createdAt: q.createdAt?.toISOString() || new Date().toISOString(),
        updatedAt: q.updatedAt?.toISOString() || new Date().toISOString(),
        plays: q.plays || 0,
        averageScore: q.averageScore || 0,
      }));
    } catch (error: any) {
      console.error("Error getting quizzes:", error);
      console.error("Error details:", error?.message, error?.stack);
      return [];
    }
  }

  async getQuiz(id: string): Promise<Quiz | undefined> {
    try {
      const [quiz] = await db.select().from(quizzesTable).where(eq(quizzesTable.id, id));
      if (!quiz) return undefined;
      return {
        id: quiz.id,
        title: quiz.title,
        description: quiz.description || undefined,
        questions: (quiz.questions as any) || [],
        theme: (quiz.theme as any) || "purple",
        difficulty: (quiz.difficulty as any) || "intermediate",
        timeLimit: quiz.timeLimit || undefined,
        createdAt: quiz.createdAt?.toISOString() || new Date().toISOString(),
        updatedAt: quiz.updatedAt?.toISOString() || new Date().toISOString(),
        plays: quiz.plays || 0,
        averageScore: quiz.averageScore || 0,
      };
    } catch (error) {
      console.error("Error getting quiz:", error);
      return undefined;
    }
  }

  async createQuiz(quiz: InsertQuiz): Promise<Quiz> {
    try {
      const id = randomUUID();
      const now = new Date();
      console.log(`Creating quiz with ID: ${id}, title: ${quiz.title}, questions count: ${quiz.questions.length}`);
      await db.insert(quizzesTable).values({
        id,
        title: quiz.title,
        description: quiz.description,
        questions: quiz.questions as any,
        theme: quiz.theme,
        difficulty: quiz.difficulty,
        timeLimit: quiz.timeLimit,
        createdAt: now,
        updatedAt: now,
      });
      console.log(`Quiz ${id} successfully inserted into database`);
      return {
        id,
        title: quiz.title,
        description: quiz.description,
        questions: quiz.questions,
        theme: quiz.theme,
        difficulty: quiz.difficulty,
        timeLimit: quiz.timeLimit,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        plays: 0,
        averageScore: 0,
      };
    } catch (error: any) {
      console.error("Error creating quiz:", error);
      console.error("Error details:", error?.message, error?.stack);
      throw error;
    }
  }

  async updateQuiz(id: string, updates: Partial<Quiz>): Promise<Quiz | undefined> {
    try {
      const now = new Date();
      await db.update(quizzesTable).set({
        ...updates,
        updatedAt: now,
      }).where(eq(quizzesTable.id, id));
      return this.getQuiz(id);
    } catch (error) {
      console.error("Error updating quiz:", error);
      return undefined;
    }
  }

  async deleteQuiz(id: string): Promise<boolean> {
    try {
      await db.delete(quizzesTable).where(eq(quizzesTable.id, id));
      return true;
    } catch (error) {
      console.error("Error deleting quiz:", error);
      return false;
    }
  }

  async duplicateQuiz(id: string): Promise<Quiz | undefined> {
    try {
      const quiz = await this.getQuiz(id);
      if (!quiz) return undefined;
      const newQuiz: InsertQuiz = {
        title: `${quiz.title} (Copy)`,
        description: quiz.description,
        questions: quiz.questions,
        theme: quiz.theme,
        difficulty: quiz.difficulty,
        timeLimit: quiz.timeLimit,
      };
      return this.createQuiz(newQuiz);
    } catch (error) {
      console.error("Error duplicating quiz:", error);
      return undefined;
    }
  }

  async getResults(userId: string): Promise<QuizResult[]> {
    try {
      const resultList = await db.select().from(resultsTable).where(eq(resultsTable.userId, userId));
      return resultList.map(r => ({
        id: r.id,
        quizId: r.quizId,
        score: r.score,
        totalPoints: r.totalPoints,
        correctAnswers: r.correctAnswers,
        totalQuestions: r.totalQuestions,
        timeSpent: r.timeSpent,
        answers: (r.answers as any) || {},
        completedAt: r.completedAt?.toISOString() || new Date().toISOString(),
        streak: r.streak || 0,
      }));
    } catch (error) {
      console.error("Error getting results:", error);
      return [];
    }
  }

  async getResult(id: string): Promise<QuizResult | undefined> {
    try {
      const [result] = await db.select().from(resultsTable).where(eq(resultsTable.id, id));
      if (!result) return undefined;
      return {
        id: result.id,
        quizId: result.quizId,
        score: result.score,
        totalPoints: result.totalPoints,
        correctAnswers: result.correctAnswers,
        totalQuestions: result.totalQuestions,
        timeSpent: result.timeSpent,
        answers: (result.answers as any) || {},
        completedAt: result.completedAt?.toISOString() || new Date().toISOString(),
        streak: result.streak || 0,
      };
    } catch (error) {
      console.error("Error getting result:", error);
      return undefined;
    }
  }

  async createResult(result: Omit<QuizResult, "id">, userId: string): Promise<QuizResult> {
    try {
      const id = randomUUID();
      await db.insert(resultsTable).values({
        id,
        quizId: result.quizId,
        userId,
        score: result.score,
        totalPoints: result.totalPoints,
        correctAnswers: result.correctAnswers,
        totalQuestions: result.totalQuestions,
        timeSpent: result.timeSpent,
        answers: result.answers as any,
        completedAt: new Date(),
        streak: result.streak,
      });
      return { ...result, id };
    } catch (error) {
      console.error("Error creating result:", error);
      throw error;
    }
  }

  async getStats(userId: string): Promise<UserStats> {
    try {
      const [stats] = await db.select().from(userStatsTable).where(eq(userStatsTable.userId, userId));
      if (!stats) {
        return {
          totalQuizzes: 0,
          totalQuestions: 0,
          correctAnswers: 0,
          totalPoints: 0,
          level: 1,
          xp: 0,
          currentStreak: 0,
          bestStreak: 0,
          badges: [],
          quizHistory: [],
        };
      }
      return {
        totalQuizzes: stats.totalQuizzes || 0,
        totalQuestions: stats.totalQuestions || 0,
        correctAnswers: stats.correctAnswers || 0,
        totalPoints: stats.totalPoints || 0,
        level: stats.level || 1,
        xp: stats.xp || 0,
        currentStreak: stats.currentStreak || 0,
        bestStreak: stats.bestStreak || 0,
        badges: (stats.badges as string[]) || [],
        quizHistory: (stats.quizHistory as string[]) || [],
      };
    } catch (error) {
      console.error("Error getting stats:", error);
      return {
        totalQuizzes: 0,
        totalQuestions: 0,
        correctAnswers: 0,
        totalPoints: 0,
        level: 1,
        xp: 0,
        currentStreak: 0,
        bestStreak: 0,
        badges: [],
        quizHistory: [],
      };
    }
  }

  async updateStats(userId: string, updates: Partial<UserStats>): Promise<UserStats> {
    try {
      await db.insert(userStatsTable).values({
        userId,
        ...updates,
      }).onConflictDoUpdate({
        target: userStatsTable.userId,
        set: updates,
      });
      return this.getStats(userId);
    } catch (error) {
      console.error("Error updating stats:", error);
      return this.getStats(userId);
    }
  }

  async getUserByUsername(username: string): Promise<{ user: User; password: string } | undefined> {
    try {
      const [user] = await db.select().from(usersTable).where(eq(usersTable.username, username));
      if (!user) return undefined;
      return {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          createdAt: user.createdAt?.toISOString() || new Date().toISOString(),
        },
        password: user.password,
      };
    } catch (error) {
      console.error("Error getting user by username:", error);
      return undefined;
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));
      if (!user) return undefined;
      return {
        id: user.id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt?.toISOString() || new Date().toISOString(),
      };
    } catch (error) {
      console.error("Error getting user by email:", error);
      return undefined;
    }
  }

  async getUserById(id: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(usersTable).where(eq(usersTable.id, id));
      if (!user) return undefined;
      return {
        id: user.id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt?.toISOString() || new Date().toISOString(),
      };
    } catch (error) {
      console.error("Error getting user by id:", error);
      return undefined;
    }
  }

  async createUser(username: string, email: string, hashedPassword: string): Promise<User> {
    try {
      const id = randomUUID();
      const now = new Date();
      await db.insert(usersTable).values({
        id,
        username,
        email,
        password: hashedPassword,
        createdAt: now,
      });
      return {
        id,
        username,
        email,
        createdAt: now.toISOString(),
      };
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }

  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    try {
      // Get all user stats ordered by total points
      const allStats = await db.select().from(userStatsTable).orderBy(desc(userStatsTable.totalPoints));
      
      // Get all users to match usernames
      const allUsers = await db.select().from(usersTable);
      const userMap = new Map(allUsers.map(u => [u.id, u.username]));
      
      const leaderboard: LeaderboardEntry[] = allStats
        .map((stats, index) => {
          const username = userMap.get(stats.userId) || "Unknown";
          const accuracy = stats.totalQuestions > 0
            ? Math.round((stats.correctAnswers / stats.totalQuestions) * 100)
            : 0;
          
          return {
            rank: index + 1,
            name: username,
            score: stats.totalPoints || 0,
            quizzes: stats.totalQuizzes || 0,
            accuracy: accuracy,
          };
        })
        .filter(entry => entry.score > 0) // Only include users with points
        .slice(0, 100); // Limit to top 100
      
      console.log(`Leaderboard: ${leaderboard.length} entries`);
      return leaderboard;
    } catch (error) {
      console.error("Error getting leaderboard:", error);
      return [];
    }
  }

  // Calculate which badges should be earned based on stats
  calculateBadges(stats: UserStats, result?: QuizResult): string[] {
    const earnedBadges = new Set<string>(stats.badges || []);
    
    // First Quiz
    if (stats.totalQuizzes >= 1 && !earnedBadges.has("firstQuiz")) {
      earnedBadges.add("firstQuiz");
    }
    
    // Perfect Score (check current result)
    if (result && result.correctAnswers === result.totalQuestions && !earnedBadges.has("perfectScore")) {
      earnedBadges.add("perfectScore");
    }
    
    // Streak badges
    if (stats.bestStreak >= 5 && !earnedBadges.has("streak5")) {
      earnedBadges.add("streak5");
    }
    if (stats.bestStreak >= 10 && !earnedBadges.has("streak10")) {
      earnedBadges.add("streak10");
    }
    
    // Quiz Master
    if (stats.totalQuizzes >= 10 && !earnedBadges.has("quizMaster")) {
      earnedBadges.add("quizMaster");
    }
    
    // Speedster (check current result - under 2 minutes = 120 seconds)
    if (result && result.timeSpent < 120 && !earnedBadges.has("speedster")) {
      earnedBadges.add("speedster");
    }
    
    // Brainiac
    if (stats.correctAnswers >= 100 && !earnedBadges.has("brainiac")) {
      earnedBadges.add("brainiac");
    }
    
    return Array.from(earnedBadges);
  }
}

export const storage = new DatabaseStorage();
