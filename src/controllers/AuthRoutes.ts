import passport from "passport";
import { _UserService } from "../app";
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
        const user = await _UserService.GetByUsername(username);
        res.json(ResultOK(`Welcome ${username}.`, { user }));
      },
    ],
  },
  {
    path: "/reset",
    method: "post",
    handler: async (req, res) => {
      const { resetCode, newPassword, username } = req.body;

      const user = await _UserService.GetByUsername(username);

      if (user) {
        if (resetCode === "abracadabra") {
          if (!newPassword || newPassword.length < 5) {
            res.json(ResultWarning("Please check your new password."));
            return;
          }

          user.password = newPassword;
          await _UserService.UpdateUser(username, user, false);
          res.json(ResultOK("Successfully reset credentials."));
        } else {
          res.json(ResultWarning("Incorrect reset code."));
        }
      } else {
        res.json(ResultWarning(`User ${username} doesn't exist.`));
      }
    },
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
