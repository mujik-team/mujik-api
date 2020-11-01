import * as express from "express";
import cors from "cors";
import * as middleware from "./utils/middleware";
import { applyRoutes } from "./controllers/_AppRoutes";
import dotenv from "dotenv";
import { initDb } from "./utils/db";
import { setupCleanup } from "./utils/cleanup";

export const app = express.default();

// Load environment variables from .env.
dotenv.config();

app.use(cors());
app.use(express.json());
app.use(middleware.requestLogger);

// Apply all of the routes in controllers/AppRoutes.ts
applyRoutes(app);

app.use(middleware.unkownEndpoint);
app.use(middleware.errorHandler);

// Connect to DB.
initDb();

// Setup cleanup functions.
setupCleanup();
