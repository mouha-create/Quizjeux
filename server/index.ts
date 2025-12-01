import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { db } from "./database";
import { sql } from "drizzle-orm";

const app = express();
const httpServer = createServer(app);

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
    // Create session table manually first (avoids table.sql file issue)
    (async () => {
      try {
        await db.execute(sql`
          CREATE TABLE IF NOT EXISTS user_sessions (
            sid VARCHAR(255) PRIMARY KEY,
            sess JSONB NOT NULL,
            expire TIMESTAMP NOT NULL
          )
        `);
        console.log("Session table ready");
      } catch (error: any) {
        // Table might already exist, which is fine
        if (!error.message?.includes("already exists")) {
          console.warn("Could not create session table:", error.message);
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
    resave: true, // Save session even if not modified (important for PostgreSQL store)
    saveUninitialized: true, // Save uninitialized sessions
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
