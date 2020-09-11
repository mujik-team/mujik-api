import * as express from 'express';
import 'express-async-errors';
const cors = require('cors');
import * as middleware from './utils/middleware';
import { tempRouter } from './controllers/temp';

export const app = express.default();

app.use(cors());
app.use(express.json());
app.use(middleware.requestLogger);

app.use('/', tempRouter);

app.use(middleware.unkownEndpoint);
app.use(middleware.errorHandler);