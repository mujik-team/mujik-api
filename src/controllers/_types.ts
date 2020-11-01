import { NextFunction, Request, Response } from "express";

type HttpMethod = "get" | "post" | "put" | "delete" | "patch" | "connect";

export type Handler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void> | void;

export type Route = {
  path: string;
  method: HttpMethod;
  handler: Handler | Handler[];
};
