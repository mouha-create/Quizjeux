import express, { type Express, Request, Response, NextFunction } from "express";
import fs from "fs";
import path from "path";

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  // Serve static files
  app.use(express.static(distPath, { index: false }));

  // SPA fallback: serve index.html for all non-API routes
  // This must be after all API routes and static file serving
  // Use app.use instead of app.get to catch all HTTP methods
  app.use("*", (req: Request, res: Response, next: NextFunction) => {
    // Skip API routes
    if (req.path.startsWith("/api")) {
      return next();
    }
    
    // Skip requests for static assets (they should be handled by express.static)
    if (req.path.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|map)$/)) {
      return next();
    }
    
    // Only handle GET requests for SPA routing
    if (req.method !== "GET") {
      return next();
    }
    
    // Serve index.html for all other routes (SPA routing)
    const indexPath = path.resolve(distPath, "index.html");
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      next();
    }
  });
}
