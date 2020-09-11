import { app } from './app';
import * as http from 'http';
import { PORT } from './utils/config';
import { logInfo } from './utils/logger';

const server = http.createServer(app);

server.listen(PORT, () => {
  logInfo(`Server is running on port ${PORT}`);
});

export {};