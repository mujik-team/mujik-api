import * as express from "express";
import * as middleware from "./utils/middleware";
import { setupRoutes } from "./controllers/_AppRoutes";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import { db, initDb } from "./utils/db";
import { setupCleanup } from "./utils/cleanup";
import { UserService } from "./services/UserService";
import { MixtapeService } from "./services/MixtapeService";

import { AuthService } from "./services/AuthService";
import { setupCors } from "./utils/cors";
import { TournamentService } from "./services/TournamentService";

export const app = express.default();
export let _UserService: UserService;
export let _MixtapeService: MixtapeService;
export let _TournamentService: TournamentService;

// Load environment variables from .env.
dotenv.config();

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

setupCors(app);

AuthService.init(app);
app.use(middleware.requestLogger);

// Apply all of the routes in controllers/AppRoutes.ts
setupRoutes(app);

app.use(middleware.unkownEndpoint);
app.use(middleware.errorHandler);

// Connect to DB.
initDb().then(() => {
  _UserService = new UserService(db.collection("user"));
  _MixtapeService = new MixtapeService(db.collection("mixtape"));
  _TournamentService = new TournamentService(
    db.collection("tournament"),
    _UserService
  );
});

// Setup cleanup functions.
setupCleanup();
