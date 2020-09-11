const express = require('express');
require('express-async-errors');
const app = express();

const cors = require('cors');
const middleware = require('./utils/middleware');

// const tempRouter = require('./controllers/temp');

// import * as tempRouter from './controllers/temp';

import { tempRouter } from './controllers/temp';

app.use(cors());
app.use(express.json());
app.use(middleware.requestLogger);

app.use('/', tempRouter);

app.use(middleware.unkownEndpoint);
app.use(middleware.errorHandler);

module.exports = app;