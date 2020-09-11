import { logInfo, logError } from './logger';

export const requestLogger = (request: any, response: any, next: any) => {
  logInfo('Method:', request.method);
  logInfo('Path:', request.path);
  logInfo('Body:', request.body);
  logInfo('---');
  next();
};

export const unkownEndpoint = (_request: any, response: any) => {
  response.status(404).send({ error: 'Unkown Endpoint' });
};

export const errorHandler = (error: any, _request: any, response: any, next: any) => {
  logError(error.message);
  next(error);
};