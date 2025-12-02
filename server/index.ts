import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import cors from "cors";
import { db } from "./database";
import { sql } from "drizzle-orm";

const app = express();
const httpServer = createServer(app);

// Trust proxy for Render (MUST be before session middleware)
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

// Configure CORS - MUST be before session middleware
const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (process.env.NODE_ENV === "production") {
      const allowedOrigins = [
        "https://quizjeux.onrender.com",
        "https://www.quizjeux.onrender.com",
      ];
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`CORS: Blocked origin: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    } else {
      // Allow all origins in development
      callback(null, true);
    }
  },
  credentials: true, // CRITICAL: Allow cookies to be sent
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["Set-Cookie"],
};

app.use(cors(corsOptions));

declare module "express-session" {
  interface SessionData {
    userId?: string;
  }
}

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

// Configure session store with PostgreSQL
const PgSession = connectPgSimple(session);
let sessionStore: any;

// Only use PostgreSQL store if DATABASE_URL is available
if (process.env.DATABASE_URL) {
  try {
    // Create session table and migrate database schema
    (async () => {
      try {
        // Create session table
        await db.execute(sql`
          CREATE TABLE IF NOT EXISTS user_sessions (
            sid VARCHAR(255) PRIMARY KEY,
            sess JSONB NOT NULL,
            expire TIMESTAMP NOT NULL
          )
        `);
        console.log("Session table ready");

        // Migrate quizzes table - add new columns if they don't exist
        await db.execute(sql`
          DO $$ 
          BEGIN
            -- Add category column if it doesn't exist
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                          WHERE table_name = 'quizzes' AND column_name = 'category') THEN
              ALTER TABLE quizzes ADD COLUMN category VARCHAR;
            END IF;

            -- Add tags column if it doesn't exist
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                          WHERE table_name = 'quizzes' AND column_name = 'tags') THEN
              ALTER TABLE quizzes ADD COLUMN tags TEXT[] DEFAULT ARRAY[]::TEXT[];
            END IF;

            -- Add is_public column if it doesn't exist
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                          WHERE table_name = 'quizzes' AND column_name = 'is_public') THEN
              ALTER TABLE quizzes ADD COLUMN is_public BOOLEAN DEFAULT true;
            END IF;

            -- Add user_id column if it doesn't exist
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                          WHERE table_name = 'quizzes' AND column_name = 'user_id') THEN
              ALTER TABLE quizzes ADD COLUMN user_id VARCHAR;
            END IF;

            -- Add shared_with_groups column if it doesn't exist
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                          WHERE table_name = 'quizzes' AND column_name = 'shared_with_groups') THEN
              ALTER TABLE quizzes ADD COLUMN shared_with_groups TEXT[] DEFAULT ARRAY[]::TEXT[];
            END IF;
          END $$;
        `);
        console.log("Quizzes table migration complete");

        // Create groups tables
        await db.execute(sql`
          CREATE TABLE IF NOT EXISTS groups (
            id VARCHAR PRIMARY KEY,
            name VARCHAR NOT NULL,
            description TEXT,
            badge VARCHAR,
            creator_id VARCHAR NOT NULL,
            visibility VARCHAR DEFAULT 'public',
            join_type VARCHAR DEFAULT 'open',
            member_count INTEGER DEFAULT 0,
            total_quizzes INTEGER DEFAULT 0,
            average_score INTEGER DEFAULT 0,
            total_points INTEGER DEFAULT 0,
            badges TEXT[] DEFAULT ARRAY[]::TEXT[],
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
          )
        `);

        await db.execute(sql`
          CREATE TABLE IF NOT EXISTS group_members (
            group_id VARCHAR NOT NULL,
            user_id VARCHAR NOT NULL,
            role VARCHAR DEFAULT 'member',
            joined_at TIMESTAMP DEFAULT NOW(),
            contributed_quizzes INTEGER DEFAULT 0,
            contributed_points INTEGER DEFAULT 0,
            PRIMARY KEY (group_id, user_id)
          )
        `);

        await db.execute(sql`
          CREATE TABLE IF NOT EXISTS group_quizzes (
            group_id VARCHAR NOT NULL,
            quiz_id VARCHAR NOT NULL,
            shared_by VARCHAR NOT NULL,
            shared_at TIMESTAMP DEFAULT NOW(),
            PRIMARY KEY (group_id, quiz_id)
          )
        `);
        console.log("Groups tables ready");

        // Create user_favorites table if it doesn't exist
        await db.execute(sql`
          CREATE TABLE IF NOT EXISTS user_favorites (
            user_id VARCHAR NOT NULL,
            quiz_id VARCHAR NOT NULL,
            created_at TIMESTAMP DEFAULT NOW(),
            PRIMARY KEY (user_id, quiz_id)
          )
        `);
        console.log("User favorites table ready");
      } catch (error: any) {
        // Table might already exist, which is fine
        if (!error.message?.includes("already exists") && !error.message?.includes("duplicate")) {
          console.warn("Database migration warning:", error.message);
        }
      }
    })();

    sessionStore = new PgSession({
      conString: process.env.DATABASE_URL, // Use connection string directly
      tableName: "user_sessions", // Table name for sessions
      createTableIfMissing: false, // Don't auto-create (we create it manually)
      schemaName: "public", // Use public schema
      pruneSessionInterval: 60, // Prune expired sessions every 60 seconds
    });
  } catch (error) {
    console.warn("Failed to initialize PostgreSQL session store, using memory store:", error);
    sessionStore = undefined;
  }
}

app.use(
  session({
    ...(sessionStore && { store: sessionStore }), // Use PostgreSQL store if available
    secret: process.env.SESSION_SECRET || "dev-secret-key",
    resave: false, // Don't save session if unmodified (better for PostgreSQL)
    saveUninitialized: true, // Save uninitialized sessions (needed for login)
    rolling: true, // Reset expiration on every request
    cookie: {
      secure: process.env.NODE_ENV === "production", // Secure cookies in production (HTTPS required)
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: process.env.NODE_ENV === "production" ? ("none" as const) : ("lax" as const), // Allow cross-site cookies on Render (requires secure: true)
      domain: undefined, // Let browser set domain automatically
      path: "/", // Ensure cookie is available for all paths
    },
    name: "quizSession", // Custom session name
    proxy: process.env.NODE_ENV === "production", // Trust proxy in production
  }),
);

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Seed example quizzes if database is empty
  if (process.env.NODE_ENV === "production" || process.env.SEED_QUIZZES === "true") {
    const { seedExampleQuizzes } = await import("./seed-quizzes");
    await seedExampleQuizzes();
  }

  await registerRoutes(httpServer, app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || "5000", 10);
  httpServer.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      log(`serving on port ${port}`);
    },
  );
})();
