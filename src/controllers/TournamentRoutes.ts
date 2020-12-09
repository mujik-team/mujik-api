import { Tournament } from "../model/TournamentModel";
import { ResultError, ResultOK } from "../utils/ResultGenerator";
import { _TournamentService } from "../app";
import { Route } from "./_types";
import { AuthService } from "../services/AuthService";
import { User } from "../model/UserModel";

export const TournamentRoutes: Route[] = [
  {
    path: "/tournament",
    method: "get",
    handler: async (req, res) => {
      try {
        const results = await _TournamentService.GetTournamentQuery();
        res.json(
          ResultOK("Successfully retrieved all tournaments.", {
            tournaments: results,
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

        if (!tournament) throw Error("Tournament not found!");

        res.json(
          ResultOK("Successfully retrieved tournament.", { tournament })
        );
      } catch (err) {
        res.json(ResultError("Unable to retrieve tournament with ID: ", id));
      }
    },
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

        res.json(
          ResultOK("Successfully updated tournament.", {
            tournament: updatedTournament,
          })
        );
      } catch (err) {
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
        } catch (err) {}
      },
    ],
  },
];
