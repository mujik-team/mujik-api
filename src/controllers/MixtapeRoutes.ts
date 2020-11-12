import { Route } from "./_types";
import { AuthService } from "../services/AuthService";
import { userService } from "../app";
import { mixtapeService } from "../app";
import { Mixtape } from "../model/MixtapeModel";
import { ResultError, ResultOK } from "../utils/ResultGenerator";

//finished work

export const MixtapeRoutes: Route[] = [
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
        const mixtape: any = await mixtapeService.GetMixtape(id);
        if (mixtape) {
          res.json(
            ResultOK(`Retrieved mixtape ${mixtape.mixtape_name}.`, { mixtape })
          );
        } else {
          res.json(ResultError("Mixtape with that id doesn't exist."));
        }
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
        // Get only the required fields from user body.
        const {
          createdBy,
          mixtapeName,
          description,
          tags,
          isPublic,
          image, 
          lastUpdated,
          followers,
          totalDuration,
          songs,
          tournamentsWon
        } = req.body;

        // Insert user into db.
        try {
          const mixtape: Mixtape = new Mixtape(
            createdBy,
            mixtapeName,
            description,
            tags,
            isPublic,
            image, 
            lastUpdated,
            followers,
            totalDuration,
            songs,
            tournamentsWon
          );
          const newMixtape: any = await mixtapeService.CreateMixtape(mixtape);
          console.log(newMixtape);
          res.json(
            ResultOK(`Created mixtape ${mixtapeName}.`, {
              mixtape: newMixtape,
            })
          );
          // Add the mixtape to the user
          const currentUser: any = await userService.GetByUsername(createdBy);
          const profile = currentUser.profile;
          profile.mixtapes.push(String(newMixtape._id));
          const updatedUser = await userService.UpdateUserProfile(
            createdBy,
            profile
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
        console.log(id);
        console.log(mixtape);
        // const oldMixtape = await mixtapeService.GetMixtape(id)
        // mixtape.mixtapeDetails = oldMixtape?.mixtapeDetails
        const updatedMixtape = await mixtapeService.UpdateMixtape(id, mixtape);
        // add mixtape details to it

        if (updatedMixtape) {
          res.json(
            ResultOK(`Updated mixtape ${updatedMixtape.mixtape_name}`, {
              updatedMixtape,
            })
          );
        } else {
          res.json(ResultError("Error updating user"));
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
        const mixtape_deleted: any = await mixtapeService.GetMixtape(id);
        try {
          const deletedMixtape = await mixtapeService.DeleteMixtape(id);
          res.json(ResultOK(`Deleted mixtape ${deletedMixtape}`));
        } catch (err) {
          res.json(ResultError("Error deleting mixtape"));
        }
        // remove from the user mixtapes
        // Add the mixtape to the user
        const currentUser: any = await userService.GetByUsername(
          mixtape_deleted.createdBy
        );
        const profile = currentUser.profile;
        const index = profile.mixtapes.indexOf(String(mixtape_deleted._id));
        profile.mixtapes.splice(index, 1);
        const updatedUser = await userService.UpdateUserProfile(
          mixtape_deleted.createdBy,
          profile
        );
      },
    ],
  },
  {
    path: "/mixtape/query",
    method: "post",
    handler: [
      AuthService.isAuthenticated,
      async (req, res, next) => {
        const query = req.body;

        // Create the advanced query        
        // console.log(query);
        const mixtape: any = await mixtapeService.GetMixtapeByQuery(query);
        // res.json(ResultOK("Found the query", { mixtape }));
        // For every element in query, it would be like { $and: [ query: params ] }
        if (mixtape) {
          res.json(ResultOK("Found mixtape matching query", { mixtape }));
        } else {
          res.json(ResultError("Error finding mixtape"));
        }
      
      }
    ]
  },
  {
    path: "/mixtape/query/id",
    method: "post",
    handler: [
      AuthService.isAuthenticated,
      async (req, res, next) => {
        const { id } = req.body;
        try {
          const mixtapes = await id.map(async (ids: string) => {
            const mixtape: any = await mixtapeService.GetMixtape(ids);
            return mixtape;
          });
          Promise.all(mixtapes).then(result => res.json(ResultOK("Retrieved mixtapes", { result }))).catch((err) => res.json(ResultError("Cannot retrieve mixtape")));
          // console.log(mixtapes);
          // res.json(ResultOK("Retrieved mixtapes", { mixtapes }))
        } catch (err) {
          res.json(ResultError("Error retrieving mixtapes"));
        }
      }
    ]
  }
];
