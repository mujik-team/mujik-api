import { Route } from "./_types";
import * as UserService from "../services/UserService";
import { ResultError, ResultOK } from "../utils/ResultGenerator";

/**
 * 1. post = register a user
 * 2. get = get a user - done
 * 3. get = get a user profile - not sure
 * 4. put = update a user - done
 * 5. delete = delete a user
 */


export const UserRoutes: Route[] = [
  /**
   * Get a user by username.
   */
  // {
  //   path: "/user/:username",
  //   method: "get",
  //   handler: async (req, res) => {
  //     console.log(req.params);
  //     const { username } = req.params;
  //     const user = await UserService.GetByUsername(username);

  //     if (user) {
  //       res.json(ResultOK(`Retrieved user ${username}.`, { user }));
  //     } else {
  //       res.status(400).json(ResultError("Error retrieving user."));
  //     }
  //   },
  // },
  /**
   * Get a user by id
   */
  {
    path: "/user/:id",
    method: "get",
    handler: async (req, res) => {
      const  { id }  = req.params;
      const user = await UserService.GetUser(id);

      if (user) {
        res.json(ResultOK(`Retrieved user ${user.username}`, { user }));
      } else {
        res.status(400).json(ResultError("Error retrieving user."));
      }
    }
  },
  /**
   * Create a new user.
   */
  {
    path: "/user/",
    method: "post",
    handler: async (req, res) => {
      const user = req.body;
      console.log(user);
      const newUser = await UserService.CreateUser(user);

      if (newUser) {
        res.json(ResultOK(`Created user ${user}.`, { user }));
      } else {
        res.status(400).json(ResultError("Error creating user."));
      }
    },
  },
  /**
   * Update the details of a user.
   */
  {
    path: "/user/:id",
    method: "put",
    handler: async (req, res) => {
      const { id } = req.params;
      const user = req.body;
      const updatedUser = await UserService.UpdateUser(id, user);
      
      if (updatedUser) {
        res.json(ResultOK(`Updated user ${updatedUser.username}`, { updatedUser }));
      } else {
        res.status(400).json(ResultError("Error updating user"));
      }
    },
  },

  /**
   * Delete a user.
   */
  {
    path: "/user/:id",
    method: "delete",
    handler: async (req, res) => {
      const { id } = req.params;
      const deletdUser = await UserService.DeleteUser(id);

      if (deletdUser) {
        res.json(ResultOK(`Deleted user ${deletdUser.username}`));
      } else {
        res.status(400).json(ResultError("Error deleting user"));
      }
    },
  },
  /**
   * Follow/Unfollow a user.
   */
  {
    path: "/user/follow/:id",
    method: "post",
    handler: async (req, res) => {
      const { id } = req.params;
      const { followId, follow } = req.body;
      const followed = await UserService.FollowUser(id, followId, follow);

      if (followed) {
        res.json(ResultOK(`${id} followed/unfollowed ${followId}`));
      } else {
        res.status(400).json(ResultError("Error following user"));
      }

    }
  },
];
