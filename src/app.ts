import * as express from "express";
import cors from "cors";
import * as middleware from "./utils/middleware";
import { applyRoutes } from "./controllers/_AppRoutes";
import dotenv from "dotenv";
import { db, initDb } from "./utils/db";
import { setupCleanup } from "./utils/cleanup";
import { UserService } from "./services/UserService";

export const app = express.default();
export let userService: UserService;

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
initDb().then(() => {
  userService = new UserService(db.collection("user"));
});

// Setup cleanup functions.
setupCleanup();
