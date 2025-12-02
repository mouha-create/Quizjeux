import type { 
  Quiz, InsertQuiz, Question, QuizResult, UserStats, LeaderboardEntry, User 
} from "@shared/schema";
import { badges } from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./database";
import { usersTable, quizzesTable, resultsTable, userStatsTable, userFavoritesTable, groupsTable, groupMembersTable, groupQuizzesTable } from "@shared/schema";
import { eq, desc, sql, and, inArray, or } from "drizzle-orm";
import { generateBadgeRules } from "@shared/badge-rules";

export interface IStorage {
  // Quiz operations
  getQuizzes(userId?: string): Promise<Quiz[]>;
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
  
  // Favorites
  addFavorite(userId: string, quizId: string): Promise<void>;
  removeFavorite(userId: string, quizId: string): Promise<void>;
  getFavorites(userId: string): Promise<string[]>;
  
  // Groups
  createGroup(group: any, creatorId: string): Promise<any>;
  getGroup(id: string): Promise<any | undefined>;
  getGroups(userId?: string): Promise<any[]>;
  updateGroup(id: string, updates: Partial<any>): Promise<any | undefined>;
  deleteGroup(id: string, userId: string): Promise<boolean>;
  
  // Group members
  joinGroup(groupId: string, userId: string): Promise<void>;
  leaveGroup(groupId: string, userId: string): Promise<void>;
  getGroupMembers(groupId: string): Promise<any[]>;
  getUserGroups(userId: string): Promise<any[]>;
  
  // Group quizzes
  shareQuizWithGroup(groupId: string, quizId: string, userId: string): Promise<void>;
  getGroupQuizzes(groupId: string): Promise<any[]>;
  unshareQuizFromGroup(groupId: string, quizId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getQuizzes(userId?: string): Promise<Quiz[]> {
    try {
      console.log("Fetching all quizzes from database...");
      // Only get public quizzes or quizzes owned by the user
      let quizList;
      if (userId) {
        quizList = await db.select().from(quizzesTable)
          .where(sql`${quizzesTable.isPublic} = true OR ${quizzesTable.userId} = ${userId}`);
      } else {
        quizList = await db.select().from(quizzesTable)
          .where(eq(quizzesTable.isPublic, true));
      }
      console.log(`Found ${quizList.length} quiz(es) in database`);
      
      // Calculate actual plays count from results for each quiz
      const quizPlaysMap = new Map<string, number>();
      const allResults = await db.select({ quizId: resultsTable.quizId }).from(resultsTable);
      allResults.forEach(r => {
        quizPlaysMap.set(r.quizId, (quizPlaysMap.get(r.quizId) || 0) + 1);
      });
      
      return quizList.map(q => {
        const actualPlays = quizPlaysMap.get(q.id) || 0;
        return {
          id: q.id,
          title: q.title,
          description: q.description || undefined,
          questions: (q.questions as any) || [],
          theme: (q.theme as any) || "purple",
          difficulty: (q.difficulty as any) || "intermediate",
          timeLimit: q.timeLimit || undefined,
          category: (q.category as any) || undefined,
          tags: (q.tags as string[]) || [],
          isPublic: q.isPublic !== false,
          sharedWithGroups: (q.sharedWithGroups as string[]) || [],
          userId: q.userId || undefined,
          createdAt: q.createdAt?.toISOString() || new Date().toISOString(),
          updatedAt: q.updatedAt?.toISOString() || new Date().toISOString(),
          plays: actualPlays,
          averageScore: q.averageScore || 0,
        };
      });
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
        sharedWithGroups: quiz.sharedWithGroups || [],
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
        category: quiz.category,
        tags: quiz.tags || [],
        isPublic: quiz.isPublic !== false,
        sharedWithGroups: quiz.sharedWithGroups || [],
        userId: quiz.userId,
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
        category: quiz.category,
        tags: quiz.tags || [],
        isPublic: quiz.isPublic !== false,
        sharedWithGroups: quiz.sharedWithGroups || [],
        userId: quiz.userId,
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
      const quizResult = {
        id: result.id,
        quizId: result.quizId,
        score: result.score || 0,
        totalPoints: result.totalPoints || 0,
        correctAnswers: result.correctAnswers || 0,
        totalQuestions: result.totalQuestions || 0,
        timeSpent: result.timeSpent || 0,
        answers: (result.answers as any) || {},
        completedAt: result.completedAt?.toISOString() || new Date().toISOString(),
        streak: result.streak || 0,
      };
      console.log(`Retrieved result ${id}:`, quizResult);
      return quizResult;
    } catch (error) {
      console.error("Error getting result:", error);
      return undefined;
    }
  }

  async createResult(result: Omit<QuizResult, "id">, userId: string): Promise<QuizResult> {
    try {
      const id = randomUUID();
      const savedResult = {
        id,
        quizId: result.quizId,
        userId,
        score: result.score || 0,
        totalPoints: result.totalPoints || 0,
        correctAnswers: result.correctAnswers || 0,
        totalQuestions: result.totalQuestions || 0,
        timeSpent: result.timeSpent || 0,
        answers: result.answers as any,
        completedAt: new Date(),
        streak: result.streak || 0,
      };
      
      await db.insert(resultsTable).values(savedResult);
      
      const quizResult: QuizResult = {
        id,
        quizId: result.quizId,
        score: savedResult.score,
        totalPoints: savedResult.totalPoints,
        correctAnswers: savedResult.correctAnswers,
        totalQuestions: savedResult.totalQuestions,
        timeSpent: savedResult.timeSpent,
        answers: result.answers,
        completedAt: savedResult.completedAt.toISOString(),
        streak: savedResult.streak,
      };
      
      console.log(`Created result ${id} for user ${userId}:`, quizResult);
      return quizResult;
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

  async addFavorite(userId: string, quizId: string): Promise<void> {
    try {
      await db.insert(userFavoritesTable).values({
        userId,
        quizId,
        createdAt: new Date(),
      }).onConflictDoNothing();
    } catch (error) {
      console.error("Error adding favorite:", error);
      throw error;
    }
  }

  async removeFavorite(userId: string, quizId: string): Promise<void> {
    try {
      await db.delete(userFavoritesTable)
        .where(and(
          eq(userFavoritesTable.userId, userId),
          eq(userFavoritesTable.quizId, quizId)
        ));
    } catch (error) {
      console.error("Error removing favorite:", error);
      throw error;
    }
  }

  async getFavorites(userId: string): Promise<string[]> {
    try {
      const favorites = await db.select({ quizId: userFavoritesTable.quizId })
        .from(userFavoritesTable)
        .where(eq(userFavoritesTable.userId, userId));
      return favorites.map(f => f.quizId);
    } catch (error) {
      console.error("Error getting favorites:", error);
      return [];
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

  // Calculate which badges should be earned based on stats using the new badge rules system
  calculateBadges(stats: UserStats, result?: QuizResult, allResults?: QuizResult[]): string[] {
    const earnedBadges = new Set<string>(stats.badges || []);
    const badgeRules = generateBadgeRules();
    
    // Count perfect scores from results if provided, otherwise estimate from badges
    let perfectScoresCount = 0;
    if (allResults) {
      perfectScoresCount = allResults.filter(r => r.correctAnswers === r.totalQuestions).length;
      if (result && result.correctAnswers === result.totalQuestions) {
        perfectScoresCount += 1; // Include current result if it's perfect
      }
    } else {
      // Fallback: estimate from existing perfect badges
      perfectScoresCount = stats.badges?.filter(b => b.startsWith("perfect_")).length || 0;
      if (result && result.correctAnswers === result.totalQuestions && !earnedBadges.has("first_perfect")) {
        perfectScoresCount += 1;
      }
    }
    
    // Enhanced stats object for badge calculation
    const enhancedStats: any = {
      ...stats,
      perfectScores: perfectScoresCount,
      createdQuizzes: stats.createdQuizzes || 0,
      categoryQuizzes: stats.categoryQuizzes || {},
      difficultyQuizzes: stats.difficultyQuizzes || {},
      themeQuizzes: stats.themeQuizzes || {},
      timeQuizzes: stats.timeQuizzes || {},
      questionTypeStats: stats.questionTypeStats || {},
      dailyStreak: stats.dailyStreak || 0,
      weeklyStreak: stats.weeklyStreak || 0,
      monthlyStreak: stats.monthlyStreak || 0,
    };
    
    // Check each badge rule
    badgeRules.forEach((rule) => {
      if (!earnedBadges.has(rule.id)) {
        try {
          if (rule.condition(enhancedStats, result)) {
            earnedBadges.add(rule.id);
          }
        } catch (error) {
          console.error(`Error checking badge ${rule.id}:`, error);
        }
      }
    });
    
    return Array.from(earnedBadges);
  }

  // Groups implementation
  async createGroup(groupData: any, creatorId: string): Promise<any> {
    try {
      const id = randomUUID();
      const now = new Date();
      await db.insert(groupsTable).values({
        id,
        name: groupData.name,
        description: groupData.description || null,
        badge: groupData.badge || null,
        creatorId,
        visibility: groupData.visibility || "public",
        joinType: groupData.joinType || "open",
        memberCount: 1,
        createdAt: now,
        updatedAt: now,
      });
      
      // Add creator as member
      await db.insert(groupMembersTable).values({
        groupId: id,
        userId: creatorId,
        role: "creator",
        joinedAt: now,
      });

      return this.getGroup(id);
    } catch (error) {
      console.error("Error creating group:", error);
      throw error;
    }
  }

  async getGroup(id: string): Promise<any | undefined> {
    try {
      const [group] = await db.select().from(groupsTable).where(eq(groupsTable.id, id));
      if (!group) return undefined;
      
      return {
        id: group.id,
        name: group.name,
        description: group.description || undefined,
        badge: group.badge || undefined,
        creatorId: group.creatorId,
        visibility: group.visibility || "public",
        joinType: group.joinType || "open",
        memberCount: group.memberCount || 0,
        totalQuizzes: group.totalQuizzes || 0,
        averageScore: group.averageScore || 0,
        totalPoints: group.totalPoints || 0,
        badges: (group.badges as string[]) || [],
        createdAt: group.createdAt?.toISOString() || new Date().toISOString(),
        updatedAt: group.updatedAt?.toISOString() || new Date().toISOString(),
      };
    } catch (error) {
      console.error("Error getting group:", error);
      return undefined;
    }
  }

  async getGroups(userId?: string): Promise<any[]> {
    try {
      let groups;
      if (userId) {
        // Get groups user is member of + public groups
        const userGroups = await db.select({ groupId: groupMembersTable.groupId })
          .from(groupMembersTable)
          .where(eq(groupMembersTable.userId, userId));
        const userGroupIds = userGroups.map(g => g.groupId);
        
        if (userGroupIds.length > 0) {
          groups = await db.select().from(groupsTable)
            .where(
              or(
                eq(groupsTable.visibility, "public"),
                inArray(groupsTable.id, userGroupIds)
              )
            );
        } else {
          // If user has no groups, only show public groups
          groups = await db.select().from(groupsTable)
            .where(eq(groupsTable.visibility, "public"));
        }
      } else {
        groups = await db.select().from(groupsTable)
          .where(eq(groupsTable.visibility, "public"));
      }
      
      return groups.map(g => ({
        id: g.id,
        name: g.name,
        description: g.description || undefined,
        badge: g.badge || undefined,
        creatorId: g.creatorId,
        visibility: g.visibility || "public",
        joinType: g.joinType || "open",
        memberCount: g.memberCount || 0,
        totalQuizzes: g.totalQuizzes || 0,
        averageScore: g.averageScore || 0,
        totalPoints: g.totalPoints || 0,
        badges: (g.badges as string[]) || [],
        createdAt: g.createdAt?.toISOString() || new Date().toISOString(),
        updatedAt: g.updatedAt?.toISOString() || new Date().toISOString(),
      }));
    } catch (error) {
      console.error("Error getting groups:", error);
      return [];
    }
  }

  async updateGroup(id: string, updates: Partial<any>): Promise<any | undefined> {
    try {
      const now = new Date();
      await db.update(groupsTable).set({
        ...updates,
        updatedAt: now,
      }).where(eq(groupsTable.id, id));
      return this.getGroup(id);
    } catch (error) {
      console.error("Error updating group:", error);
      return undefined;
    }
  }

  async deleteGroup(id: string, userId: string): Promise<boolean> {
    try {
      const group = await this.getGroup(id);
      if (!group || group.creatorId !== userId) {
        return false;
      }
      
      // Delete group members
      await db.delete(groupMembersTable).where(eq(groupMembersTable.groupId, id));
      // Delete group quizzes
      await db.delete(groupQuizzesTable).where(eq(groupQuizzesTable.groupId, id));
      // Delete group
      await db.delete(groupsTable).where(eq(groupsTable.id, id));
      return true;
    } catch (error) {
      console.error("Error deleting group:", error);
      return false;
    }
  }

  async joinGroup(groupId: string, userId: string): Promise<void> {
    try {
      const group = await this.getGroup(groupId);
      if (!group) throw new Error("Group not found");
      
      if (group.joinType === "invite_only") {
        throw new Error("Group is invite only");
      }

      await db.insert(groupMembersTable).values({
        groupId,
        userId,
        role: "member",
        joinedAt: new Date(),
      }).onConflictDoNothing();

      // Update member count
      const memberCount = await db.select().from(groupMembersTable)
        .where(eq(groupMembersTable.groupId, groupId));
      await db.update(groupsTable)
        .set({ memberCount: memberCount.length })
        .where(eq(groupsTable.id, groupId));
    } catch (error) {
      console.error("Error joining group:", error);
      throw error;
    }
  }

  async leaveGroup(groupId: string, userId: string): Promise<void> {
    try {
      const group = await this.getGroup(groupId);
      if (!group) throw new Error("Group not found");
      
      if (group.creatorId === userId) {
        throw new Error("Creator cannot leave group");
      }

      await db.delete(groupMembersTable)
        .where(and(
          eq(groupMembersTable.groupId, groupId),
          eq(groupMembersTable.userId, userId)
        ));

      // Update member count
      const memberCount = await db.select().from(groupMembersTable)
        .where(eq(groupMembersTable.groupId, groupId));
      await db.update(groupsTable)
        .set({ memberCount: memberCount.length })
        .where(eq(groupsTable.id, groupId));
    } catch (error) {
      console.error("Error leaving group:", error);
      throw error;
    }
  }

  async getGroupMembers(groupId: string): Promise<any[]> {
    try {
      const members = await db.select()
        .from(groupMembersTable)
        .where(eq(groupMembersTable.groupId, groupId));
      
      const userIds = members.map(m => m.userId);
      const users = await db.select().from(usersTable)
        .where(sql`${usersTable.id} = ANY(${userIds})`);
      const userMap = new Map(users.map(u => [u.id, u.username]));

      return members.map(m => ({
        groupId: m.groupId,
        userId: m.userId,
        username: userMap.get(m.userId) || "Unknown",
        role: m.role || "member",
        joinedAt: m.joinedAt?.toISOString() || new Date().toISOString(),
        contributedQuizzes: m.contributedQuizzes || 0,
        contributedPoints: m.contributedPoints || 0,
      }));
    } catch (error) {
      console.error("Error getting group members:", error);
      return [];
    }
  }

  async getUserGroups(userId: string): Promise<any[]> {
    try {
      const memberGroups = await db.select({ groupId: groupMembersTable.groupId })
        .from(groupMembersTable)
        .where(eq(groupMembersTable.userId, userId));
      
      const groupIds = memberGroups.map(m => m.groupId);
      if (groupIds.length === 0) return [];

      const groups = await db.select().from(groupsTable)
        .where(sql`${groupsTable.id} = ANY(${groupIds})`);
      
      return groups.map(g => ({
        id: g.id,
        name: g.name,
        description: g.description || undefined,
        badge: g.badge || undefined,
        creatorId: g.creatorId,
        visibility: g.visibility || "public",
        joinType: g.joinType || "open",
        memberCount: g.memberCount || 0,
        totalQuizzes: g.totalQuizzes || 0,
        averageScore: g.averageScore || 0,
        totalPoints: g.totalPoints || 0,
        badges: (g.badges as string[]) || [],
        createdAt: g.createdAt?.toISOString() || new Date().toISOString(),
        updatedAt: g.updatedAt?.toISOString() || new Date().toISOString(),
      }));
    } catch (error) {
      console.error("Error getting user groups:", error);
      return [];
    }
  }

  async shareQuizWithGroup(groupId: string, quizId: string, userId: string): Promise<void> {
    try {
      // Check if user is member of group
      const [member] = await db.select()
        .from(groupMembersTable)
        .where(and(
          eq(groupMembersTable.groupId, groupId),
          eq(groupMembersTable.userId, userId)
        ));
      
      if (!member) {
        throw new Error("User is not a member of this group");
      }

      await db.insert(groupQuizzesTable).values({
        groupId,
        quizId,
        sharedBy: userId,
        sharedAt: new Date(),
      }).onConflictDoNothing();

      // Update group quiz count
      const quizCount = await db.select().from(groupQuizzesTable)
        .where(eq(groupQuizzesTable.groupId, groupId));
      await db.update(groupsTable)
        .set({ totalQuizzes: quizCount.length })
        .where(eq(groupsTable.id, groupId));

      // Update member contribution
      await db.update(groupMembersTable)
        .set({ 
          contributedQuizzes: sql`${groupMembersTable.contributedQuizzes} + 1`
        })
        .where(and(
          eq(groupMembersTable.groupId, groupId),
          eq(groupMembersTable.userId, userId)
        ));
    } catch (error) {
      console.error("Error sharing quiz with group:", error);
      throw error;
    }
  }

  async getGroupQuizzes(groupId: string): Promise<any[]> {
    try {
      const groupQuizzes = await db.select()
        .from(groupQuizzesTable)
        .where(eq(groupQuizzesTable.groupId, groupId));
      
      const quizIds = groupQuizzes.map(gq => gq.quizId);
      if (quizIds.length === 0) return [];

      const quizzes = await db.select().from(quizzesTable)
        .where(sql`${quizzesTable.id} = ANY(${quizIds})`);
      
      return quizzes.map(q => ({
        id: q.id,
        title: q.title,
        description: q.description || undefined,
        questions: (q.questions as any) || [],
        theme: (q.theme as any) || "purple",
        difficulty: (q.difficulty as any) || "intermediate",
        timeLimit: q.timeLimit || undefined,
        category: (q.category as any) || undefined,
        tags: (q.tags as string[]) || [],
        isPublic: q.isPublic !== false,
        userId: q.userId || undefined,
        createdAt: q.createdAt?.toISOString() || new Date().toISOString(),
        updatedAt: q.updatedAt?.toISOString() || new Date().toISOString(),
        plays: q.plays || 0,
        averageScore: q.averageScore || 0,
      }));
    } catch (error) {
      console.error("Error getting group quizzes:", error);
      return [];
    }
  }

  async unshareQuizFromGroup(groupId: string, quizId: string): Promise<void> {
    try {
      await db.delete(groupQuizzesTable)
        .where(and(
          eq(groupQuizzesTable.groupId, groupId),
          eq(groupQuizzesTable.quizId, quizId)
        ));

      // Update group quiz count
      const quizCount = await db.select().from(groupQuizzesTable)
        .where(eq(groupQuizzesTable.groupId, groupId));
      await db.update(groupsTable)
        .set({ totalQuizzes: quizCount.length })
        .where(eq(groupsTable.id, groupId));
    } catch (error) {
      console.error("Error unsharing quiz from group:", error);
      throw error;
    }
  }
}

export const storage = new DatabaseStorage();
