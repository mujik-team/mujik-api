import * as express from "express";
import * as middleware from "./utils/middleware";
import { setupRoutes } from "./controllers/_AppRoutes";
import dotenv from "dotenv";
import { db, initDb } from "./utils/db";
import { setupCleanup } from "./utils/cleanup";
import { UserService } from "./services/UserService";

import { AuthService } from "./services/AuthService";
import { setupCors } from "./utils/cors";

export const app = express.default();
export let userService: UserService;

// Load environment variables from .env.
dotenv.config();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

setupCors(app);

AuthService.init(app);
app.use(middleware.requestLogger);

// Apply all of the routes in controllers/AppRoutes.ts
setupRoutes(app);

app.use(middleware.unkownEndpoint);
app.use(middleware.errorHandler);

// Connect to DB.
initDb().then(() => {
  userService = new UserService(db.collection("user"));
});

// Setup cleanup functions.
setupCleanup();
