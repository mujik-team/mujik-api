import { Router } from "express";
import { AuthRoutes } from "./AuthRoutes";
import { MixtapeRoutes } from "./MixtapeRoutes";
import { TournamentRoutes } from "./TournamentRoutes";
import { UserRoutes } from "./UserRoutes";

const AppRoutes = [
  ...AuthRoutes,
  ...UserRoutes,
  ...MixtapeRoutes,
  ...TournamentRoutes,
];

/**
 * Applies all of the routes to the router provided.
 * @param router Router to apply the routes to.
 */
export const applyRoutes = (router: Router) => {
  for (const route of AppRoutes) {
    const { method, path, handler } = route;
    router[method](path, handler);
  }
};
