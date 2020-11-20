import { Router } from "express";
import { AuthRoutes } from "./AuthRoutes";
import { MixtapeRoutes } from "./MixtapeRoutes";
import { TournamentRoutes } from "./TournamentRoutes";
import { UploadRoutes } from "./UploadRoutes";
import { UserRoutes } from "./UserRoutes";
import { Route } from "./_types";

const AppRoutes: Route[] = [
  ...AuthRoutes,
  ...UserRoutes,
  ...MixtapeRoutes,
  ...TournamentRoutes,
  ...UploadRoutes,
];

/**
 * Applies all of the routes to the router provided.
 * @param router Router to apply the routes to.
 */
export const setupRoutes = (router: Router) => {
  for (const route of AppRoutes) {
    const { method, path, handler } = route;
    router[method](path, handler);
  }
};
