import { Route } from "./_types";

export const MixtapeRoutes: Route[] = [
  /**
   * Get a mixtape by ID.
   */
  {
    path: "/mixtape/:id",
    method: "get",
    handler: (req, res) => {
      throw new Error("Not yet implemented.");
    },
  },

  /**
   * Create a new mixtape.
   */
  {
    path: "/mixtape/",
    method: "post",
    handler: (req, res) => {
      throw new Error("Not yet implemented.");
    },
  },
  /**
   * Update the details of a mixtape.
   */ {
    path: "/mixtape/:id",
    method: "put",
    handler: (req, res) => {
      throw new Error("Not yet implemented.");
    },
  },

  /**
   * Delete a mixtape.
   */
  {
    path: "/mixtape/:id",
    method: "delete",
    handler: (req, res) => {
      throw new Error("Not yet implemented.");
    },
  },
];
