import { Tournament } from "../model/TournamentModel";
import { ResultError, ResultOK, ResultWarning } from "../utils/ResultGenerator";
import { _TournamentService } from "../app";
import { Route } from "./_types";
import { AuthService } from "../services/AuthService";
import { User } from "../model/UserModel";
import fs from "fs";

export const TournamentRoutes: Route[] = [
  /**
   * Retrieve all tournaments.
   */
  {
    path: "/tournament",
    method: "get",
    handler: async (req, res) => {
      try {
        const results = await _TournamentService.GetAllTournaments();

        const tournaments = results.map((t) => Tournament.ToJSON(t));

        res.json(
          ResultOK("Successfully retrieved all tournaments.", {
            tournaments,
          })
        );
      } catch (err) {
        res.json(ResultError("An error occurred."));
      }
    },
  },
  /**
   * Get a tournament by ID.
   */
  {
    path: "/tournament/:id",
    method: "get",
    handler: async (req, res) => {
      const { id } = req.params;

      try {
        const tournament = await _TournamentService.GetTournament(id);
        const json = Tournament.ToJSON(tournament!);

        if (!tournament) throw Error("Tournament not found!");

        res.json(
          ResultOK("Successfully retrieved tournament.", { tournament: json })
        );
      } catch (err) {
        res.json(ResultError("Unable to retrieve tournament with ID: ", id));
      }
    },
  },

  /**
   * Get multiple tournaments.
   */
  {
    path: "/tournament/query",
    method: "post",
    handler: async (req, res) => {
      try {
        const { ids } = req.body;
        const tournamentObjects = await _TournamentService.GetMultipleTournaments(
          ids
        );
        const tournaments = tournamentObjects.map((obj) =>
          Tournament.ToJSON(obj)
        );

        res.json(
          ResultOK("Successfully retrieved tournaments.", { tournaments })
        );
      } catch (err) {
        res.json(ResultWarning("Invalid query.", { tournaments: [] }));
      }
    },
  },
  /**
   * Get tournament cover image.
   */
  {
    path: "/tournament/:id/cover",
    method: "get",
    handler: [
      async (req, res) => {
        const { id } = req.params;
        const root =
          process.env.UPLOAD_DIR || "/var/mujik/uploads/tournaments/";

        fs.stat(root + id, (err, stat) => {
          if (!err) {
            res.setHeader("Content-Type", "image");
            res.sendFile(id, { root });
          } else {
            res
              .status(404)
              .json(ResultWarning("Tournament cover image doesn't exist."));
          }
        });
      },
    ],
  },

  /**
   * Create a new tournament.
   */
  {
    path: "/tournament/",
    method: "post",
    handler: [
      AuthService.isAuthenticated,
      async (req, res) => {
        try {
          const user = req.user as User;
          const doc = req.body;
          doc.createdBy = user.username;

          const tournament = await _TournamentService.CreateTournament(
            req.body,
            user
          );
          if (!tournament) throw Error("No tournament created!");

          const tournamentDoc = Tournament.ToJSON(tournament);

          res.json(
            ResultOK("Successfully created new tournament.", {
              tournament: tournamentDoc,
            })
          );
        } catch (err) {
          console.log(err);
          res.json(ResultError("Unable to create tournament."));
        }
      },
    ],
  },

  /**
   * Update the details of a tournament.
   */
  {
    path: "/tournament/:id",
    method: "put",
    handler: async (req, res) => {
      const { id } = req.params;

      try {
        const updatedTournament = await _TournamentService.UpdateTournament(
          id,
          req.body.tournament
        );

        if (!updatedTournament) throw Error("Unable to update tournament");

        const json = Tournament.ToJSON(updatedTournament);

        res.json(
          ResultOK("Successfully updated tournament.", {
            tournament: json,
          })
        );
      } catch (err) {
        console.log(err);
        res.json(ResultError("Unable to update tournament details."));
      }
    },
  },

  /**
   * Delete a tournament.
   */
  {
    path: "/tournament/:id",
    method: "delete",
    handler: async (req, res) => {
      const { id } = req.params;
      const user = req.user as User;

      try {
        const deleted = await _TournamentService.DeleteTournament(
          id,
          user.username
        );

        if (!deleted) throw Error("Tournament not found!");

        res.json(ResultOK("Successfully deleted tournament."));
      } catch (err) {
        res.json(ResultError("Unable to delete tournament with ID: ", id));
      }
    },
  },

  /**
   * Follow a tournament.
   */
  {
    path: "/tournament/:id/follow",
    method: "post",
    handler: [
      AuthService.isAuthenticated,
      async (req, res) => {
        const { id } = req.params;
        const user = req.user as User;
        const toFollow = req.query.toFollow === "true";

        try {
          await _TournamentService.FollowTournament(
            id,
            user.username,
            toFollow
          );

          res.json(ResultOK("Successfully followed/unfollowed."));
        } catch (err) {
          console.log(err);
          res.json(ResultWarning("Unable to follow/unfollow."));
        }
      },
    ],
  },

  /**
   * Make submission to tournament.
   */
  {
    path: "/tournament/:id/enter",
    method: "post",
    handler: [
      AuthService.isAuthenticated,
      async (req, res) => {
        const { mixtapeId } = req.body;

        const username = (req.user as User).username;
        const { id } = req.params;

        try {
          const result = await _TournamentService.MakeSubmission(
            id,
            username,
            mixtapeId
          );
          res.json(ResultOK("Successfully entered the tournament."));
        } catch (err) {
          console.log(err);
          res.status(400).json(ResultWarning("Unable to make submission."));
        }
      },
    ],
  },

  /**
   * Vote for mixtape in tournament.
   */
  {
    path: "/tournament/:id/vote",
    method: "post",
    handler: [
      AuthService.isAuthenticated,
      async (req, res) => {
        const { mixtapeId } = req.body;
        const { id } = req.params;
        const username = (req.user as User).username;

        try {
          const result = await _TournamentService.VoteForMixtape(
            id,
            username,
            mixtapeId
          );
          res.json(ResultOK("Successfully voted for mixtape!"));
        } catch (err) {
          console.log(err);
          res.status(400).json(ResultWarning("Unable to vote for mixtape."));
        }
      },
    ],
  },
];
