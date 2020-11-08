import { Router } from "express";
import cors from "cors";

const allowedOrigins = [process.env.APP_URL || "http://localhost:3000"];

export function setupCors(app: Router) {
  app.use(
    cors({
      origin: (origin, done) => {
        if (!origin) return done(null, true);

        if (allowedOrigins.includes(origin)) {
          return done(null, true);
        }

        return done(null, false);
      },
      credentials: true,
    })
  );
}
