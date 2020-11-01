import { logInfo, logError } from "./logger";
import { Request, Response } from "express";
import { ResultError } from "./ResultGenerator";

export const requestLogger = (request: any, response: any, next: any) => {
  logInfo("Method:", request.method);
  logInfo("Path:", request.path);
  logInfo("Body:", request.body);
  logInfo("---");
  next();
};

export const unkownEndpoint = (_request: any, response: any) => {
  response.status(404).send({ error: "Unkown Endpoint" });
};

export const errorHandler = (
  error: any,
  _request: Request,
  response: Response,
  next: any
) => {
  logError(error.message);
  response
    .status(500)
    .json(ResultError("Server error. Please try again later."));
};
