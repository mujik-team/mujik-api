const app = require('./app');
const http = require('http');
const config = require('./utils/config');

import { logInfo } from './utils/logger';

const server = http.createServer(app);

server.listen(config.PORT, () => {
  logInfo(`Server is running on port ${config.PORT}`);
});

export {};