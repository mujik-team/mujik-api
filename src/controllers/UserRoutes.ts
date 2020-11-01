import { Route } from "./_types";
import * as UserService from "../services/UserService";
import { ResultError, ResultOK } from "../utils/ResultGenerator";

export const UserRoutes: Route[] = [
  /**
   * Get a user by username.
   */
  {
    path: "/user/:username",
    method: "get",
    handler: async (req, res) => {
      const { username } = req.params;
      const user = await UserService.GetByUsername(username);

      if (user) {
        res.json(ResultOK(`Retrieved user ${username}.`, { user }));
      } else {
        res.status(400).json(ResultError("Error retrieving user."));
      }
    },
  },

  /**
   * Create a new user.
   */
  {
    path: "/user/",
    method: "post",
    handler: (req, res) => {},
  },
  /**
   * Update the details of a user.
   */
  {
    path: "/user/:id",
    method: "put",
    handler: (req, res) => {
      throw new Error("Not yet implemented.");
    },
  },

  /**
   * Delete a user.
   */
  {
    path: "/user/:id",
    method: "delete",
    handler: (req, res) => {
      throw new Error("Not yet implemented.");
    },
  },
];
