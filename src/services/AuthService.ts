import { Router } from "express";
import passport from "passport";
import { _UserService } from "../app";

import session from "express-session";

import Local from "passport-local";
import { User } from "../model/UserModel";
import { Request, Response, NextFunction } from "express";
import { ResultError } from "../utils/ResultGenerator";

export class AuthService {
  static init(app: Router) {
    app.use(
      session({
        name: "mujik",
        secret: process.env.SESSION_SECRET || "testsession",
      })
    );
    app.use(passport.initialize());
    app.use(passport.session());

    passport.use(
      new Local.Strategy(async (username, password, done) => {
        const user = await _UserService.GetByUsername(username);
        if (!user || user.password !== password) {
          return done(null, false, { message: "Invalid credentials." });
        }

        return done(null, user);
      })
    );

    passport.serializeUser((user: User, done) => {
      done(null, user.username);
    });

    passport.deserializeUser(async (username: string, done) => {
      const user = await _UserService.GetByUsername(username);
      return done(null, user);
    });
  }

  static isAuthenticated(req: Request, res: Response, next: NextFunction) {
    if (req.isAuthenticated()) return next();
    else res.json(ResultError("User is not authenticated."));
  }
}
