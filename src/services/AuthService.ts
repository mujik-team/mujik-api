import { Router } from "express";
import passport from "passport";
import { userService } from "../app";
import Local from "passport-local";
import { User } from "../model/UserModel";
import { Request, Response, NextFunction } from "express";
import { ResultError } from "../utils/ResultGenerator";

export class AuthService {
  static init(app: Router) {
    app.use(passport.initialize());
    app.use(passport.session());

    passport.use(
      new Local.Strategy(async (username, password, done) => {
        const user = await userService.GetByUsername(username);
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
      const user = await userService.GetByUsername(username);
      return done(null, user);
    });
  }

  static isAuthenticated(req: Request, res: Response, next: NextFunction) {
    if (req.isAuthenticated()) return next();
    else res.status(401).json(ResultError("User is not authenticated."));
  }
}
