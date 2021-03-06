import { Route } from "./_types";
import { AuthService } from "../services/AuthService";
import { _UserService } from "../app";
import { _MixtapeService } from "../app";
import { Mixtape } from "../model/MixtapeModel";
import { ResultError, ResultOK, ResultWarning } from "../utils/ResultGenerator";
import fs from "fs";

export const MixtapeRoutes: Route[] = [
  /**
   * Get featured mixtapes.
   */

  {
    path: "/mixtape/featured",
    method: "get",
    handler: async (req, res) => {
      try {
        const mixtapes = await _MixtapeService.GetFeaturedMixtapes();
        res.json(ResultOK("Retrieved mixtapes", { mixtapes }));
      } catch (err) {
        res.json(ResultError("Unable to retrieve mixtapes", { mixtapes: [] }));
      }
    },
  },
  /**
   * Get a mixtape by ID.
   */
  {
    path: "/mixtape/:id",
    method: "get",
    handler: [
      AuthService.isAuthenticated,
      async (req, res) => {
        console.log(req.params);
        const { id } = req.params;

        try {
          const mixtape: any = await _MixtapeService.GetMixtape(id);
          res.json(
            ResultOK(`Retrieved mixtape ${mixtape.mixtapeName}.`, { mixtape })
          );
        } catch (err) {
          res
            .status(404)
            .json(ResultWarning("Unable to retrieve mixtape with that id."));
        }
      },
    ],
  },

  /**
   * Get mixtape cover image.
   */
  {
    path: "/mixtape/:id/cover",
    method: "get",
    handler: [
      // AuthService.isAuthenticated,
      async (req, res) => {
        const { id } = req.params;
        const root = process.env.UPLOAD_DIR || "/var/mujik/uploads/mixtapes/";

        // Check if mixtape cover image exists.

        fs.stat(root + id, (err, stat) => {
          if (!err) {
            res.setHeader("Content-Type", "image");
            res.sendFile(id, {
              root,
            });
          } else {
            res
              .status(404)
              .json(ResultError("Mixtape cover image doesn't exist"));
          }
        });
      },
    ],
  },

  /**
   * Create a new mixtape.
   */
  {
    path: "/mixtape/",
    method: "post",
    handler: [
      AuthService.isAuthenticated,
      async (req, res) => {
        const {
          createdBy,
          mixtapeName,
          description,
          tags,
          isPrivate,
          image,
          lastUpdated,
          followers,
          totalDuration,
          songs,
          tournamentsWon,
        } = req.body;

        try {
          const mixtape: Mixtape = new Mixtape(
            createdBy,
            mixtapeName,
            description,
            tags,
            isPrivate,
            image,
            lastUpdated,
            followers,
            totalDuration,
            songs,
            tournamentsWon
          );
          const newMixtape: any = await _MixtapeService.CreateMixtape(mixtape);

          // Add the mixtape to the user
          const currentUser: any = await _UserService.GetByUsername(createdBy);
          const profile = currentUser.profile;
          profile.mixtapes.push(String(newMixtape._id));
          const updatedUser = await _UserService.UpdateUserProfile(
            createdBy,
            profile
          );

          res.json(
            ResultOK(`Created mixtape ${mixtapeName}.`, {
              mixtape: newMixtape,
            })
          );
        } catch (err) {
          res.json(ResultError("Error creating mixtape.", err));
        }
      },
    ],
  },

  /**
   * Update the details of a mixtape.
   */ {
    path: "/mixtape/:id",
    method: "put",
    handler: [
      AuthService.isAuthenticated,
      async (req, res) => {
        const { id } = req.params;
        const mixtape = req.body;
        delete mixtape._id;

        const updatedMixtape = await _MixtapeService.UpdateMixtape(id, mixtape);

        if (updatedMixtape) {
          res.json(
            ResultOK(`Updated mixtape ${updatedMixtape.mixtape_name}`, {
              mixtape,
            })
          );
        } else {
          res.json(ResultError("Error updating mixtape."));
        }
      },
    ],
  },

  /**
   * Delete a mixtape.
   */
  {
    path: "/mixtape/:id",
    method: "delete",
    handler: [
      AuthService.isAuthenticated,
      async (req, res, next) => {
        const { id } = req.params;
        const mixtape_deleted: any = await _MixtapeService.GetMixtape(id);
        try {
          const deletedMixtape = await _MixtapeService.DeleteMixtape(id);
          res.json(ResultOK(`Deleted mixtape ${deletedMixtape}`));

          // remove from the user mixtapes
          // Add the mixtape to the user
          const currentUser: any = await _UserService.GetByUsername(
            mixtape_deleted.createdBy
          );
          const profile = currentUser.profile;
          const index = profile.mixtapes.indexOf(String(mixtape_deleted._id));
          profile.mixtapes.splice(index, 1);
          const updatedUser = await _UserService.UpdateUserProfile(
            mixtape_deleted.createdBy,
            profile
          );
        } catch (err) {
          res.json(ResultError("Error deleting mixtape"));
        }
      },
    ],
  },
  /**
   * Get mixtapes by query
   */
  {
    path: "/mixtape/query",
    method: "post",
    handler: [
      AuthService.isAuthenticated,
      async (req, res, next) => {
        const query = req.body;

        // Create the advanced query
        // console.log(query);
        const mixtape: any = await _MixtapeService.GetMixtapeByQuery(query);
        // res.json(ResultOK("Found the query", { mixtape }));
        // For every element in query, it would be like { $and: [ query: params ] }
        if (mixtape) {
          res.json(ResultOK("Found mixtape matching query", { mixtape }));
        } else {
          res.json(ResultError("Error finding mixtape"));
        }
      },
    ],
  },
  /**
   * Get multiple mixtapes by id.
   */
  {
    path: "/mixtape/query/id",
    method: "post",
    handler: [
      AuthService.isAuthenticated,
      async (req, res, next) => {
        const { ids } = req.body;
        try {
          const mixtapeRequests = await ids.map(async (id: string) => {
            try {
              return await _MixtapeService.GetMixtape(id);
            } catch (err) {
              console.log(err);
              return undefined;
            }
          });

          Promise.all(mixtapeRequests).then((result) =>
            res.json(
              ResultOK("Retrieved mixtapes", {
                mixtapes: result.filter((m) => m !== undefined),
              })
            )
          );
        } catch (err) {
          console.log(err);
          res.json(ResultError("Error retrieving mixtapes"));
        }
      },
    ],
  },

  /**
   * Follow Mixtape
   */
  {
    path: "/mixtape/:id/follow",
    method: "post",
    handler: [
      AuthService.isAuthenticated,
      async (req, res, next) => {
        const { id } = req.params;
        const { username, follow } = req.body;

        try {
          const mixtape: any = await _MixtapeService.GetMixtape(id);
          const user = await _UserService.GetByUsername(username);

          if (follow === true) {
            mixtape.followers = mixtape?.followers + 1;
            user?.profile.mixtapes.push(id);
          } else {
            mixtape.followers =
              mixtape?.followers > 0 ? mixtape?.followers - 1 : 0;
            const mixtapeIndex = user?.profile.mixtapes.indexOf(id) as number;
            if (mixtapeIndex > -1) {
              user?.profile.mixtapes.splice(mixtapeIndex, 1);
            }
          }

          const updatedUser = await _UserService.UpdateUserProfile(
            username,
            user?.profile
          );
          const updatedMixtape = await _MixtapeService.UpdateMixtape(
            id,
            mixtape
          );

          res.json(
            ResultOK(
              `${username} followed mixtape ${updatedMixtape.mixtapeName}`,
              { updatedMixtape }
            )
          );
        } catch (err) {
          res.json(ResultError("Error following mixtape"));
        }
      },
    ],
  },
  /**
   * Fork Mixtape
   */
  {
    path: "/mixtape/fork",
    method: "post",
    handler: [
      AuthService.isAuthenticated,
      async (req, res, next) => {
        const user = req.body.username;
        const mixtape = req.body.mixtape;

        console.log(mixtape);
        console.log(user);

        try {
          const newMixtape: any = await _MixtapeService.CreateMixtape(mixtape);

          // Add the mixtape to the user
          const currentUser: any = await _UserService.GetByUsername(user);
          const profile = currentUser.profile;
          profile.mixtapes.push(String(newMixtape._id));
          const updatedUser = await _UserService.UpdateUserProfile(
            user,
            profile
          );

          res.json(
            ResultOK(`Forked mixtape ${newMixtape}.`, {
              mixtape: newMixtape,
            })
          );
        } catch (err) {
          res.json(ResultError("Error forking mixtape.", err));
        }
      },
    ],
  },
];
