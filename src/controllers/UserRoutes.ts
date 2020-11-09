import { Route } from "./_types";
import { ResultError, ResultOK, ResultWarning } from "../utils/ResultGenerator";
import { User } from "../model/UserModel";
import { userService } from "../app";
import { AuthService } from "../services/AuthService";

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
  {
    path: "/user/:username",
    method: "get",
    handler: [
      AuthService.isAuthenticated,
      async (req, res) => {
        console.log(req.params);
        const { username } = req.params;
        const user: any = await userService.GetByUsername(username);

        if (user) {
          res.json(
            ResultOK(`Retrieved user ${username}.`, {
              user: User.cleanForAPI(user),
            })
          );
        } else {
          res.json(ResultError("User with that username doesn't exist."));
        }
      },
    ],
  },
  /**
   * Create a new user.
   */
  {
    path: "/user/",
    method: "post",
    handler: async (req, res) => {
      // Get only the required fields from user body.
      const { username, email, password, bio } = req.body;

      // Insert user into db.
      try {
        const user: User = new User(username, email, password);
        user.profile.bio = bio || "";

        const newUser: any = await userService.CreateUser(user);
        delete newUser.password; // remove password from result.

        // Successfully created new user.
        res.json(
          ResultOK(`Created user ${username}.`, {
            user: newUser,
          })
        );
      } catch (err) {
        res.json(ResultError("Error creating user.", err));
      }
    },
  },
  /**
   * Update the details of a user.
   */
  {
    path: "/user/:username",
    method: "put",
    handler: async (req, res) => {
      const { username } = req.params;
      const { user } = req.body;
      const updatedUser = await userService.UpdateUser(username, user);

      if (updatedUser) {
        res.json(
          ResultOK(`Updated user profile of ${username}`, { user: updatedUser })
        );
      } else {
        res.json(ResultError("Error updating user"));
      }
    },
  },

  /**
   * Delete a user.
   */
  {
    path: "/user/:id",
    method: "delete",
    handler: async (req, res, next) => {
      const { id } = req.params;

      try {
        const deletedUser = await userService.DeleteUser(id);
        res.json(ResultOK(`Deleted user ${deletedUser.username}`));
      } catch (err) {
        res.json(ResultError("Error deleting user"));
      }
    },
  },
  /**
   * Follow/Unfollow a user.
   */
  {
    path: "/user/follow",
    method: "post",
    handler: [
      AuthService.isAuthenticated,
      async (req, res) => {
        const { username, follow } = req.body;
        const currentUser: any = req.user;

        try {
          await userService.FollowUser(currentUser.username, username, follow);
          res.json(
            ResultOK(`${currentUser.username} followed/unfollowed ${username}`)
          );
        } catch (err) {
          console.log(err);
          res.json(ResultError("Unable to follow/unfollow."));
        }
      },
    ],
  },
];
