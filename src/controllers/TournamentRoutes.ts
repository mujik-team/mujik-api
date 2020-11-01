import { Route } from "./_types";

export const TournamentRoutes: Route[] = [
  /**
   * Get a tournament by ID.
   */
  {
    path: "/tournament/:id",
    method: "get",
    handler: (req, res) => {
      throw new Error("Not yet implemented.");
    },
  },

  /**
   * Create a new tournament.
   */
  {
    path: "/tournament/",
    method: "post",
    handler: (req, res) => {
      throw new Error("Not yet implemented.");
    },
  },

  /**
   * Update the details of a tournament.
   */
  {
    path: "/tournament/:id",
    method: "put",
    handler: (req, res) => {
      throw new Error("Not yet implemented.");
    },
  },

  /**
   * Delete a tournament.
   */
  {
    path: "/tournament/:id",
    method: "delete",
    handler: (req, res) => {
      throw new Error("Not yet implemented.");
    },
  },
];
