import passport from "passport";
import { userService } from "../app";
import { ResultOK, ResultWarning } from "../utils/ResultGenerator";
import { Route } from "./_types";

export const AuthRoutes: Route[] = [
  {
    path: "/login",
    method: "post",
    handler: [
      passport.authenticate("local", { session: true }),
      async (req, res) => {
        const { username } = req.body;
        const user = await userService.GetByUsername(username);
        res.json(ResultOK(`Welcome ${username}.`, { user }));
      },
    ],
  },
  {
    path: "/logout",
    method: "post",
    handler: async (req, res) => {
      if (req.isAuthenticated()) {
        req.logout();
        res.json(ResultOK("Successfully logged out."));
      } else {
        res.json(ResultWarning("Never logged in."));
      }
    },
  },
];
