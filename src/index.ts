import { app } from "./app";
import * as http from "http";
import { logInfo } from "./utils/logger";

const server = http.createServer(app);
const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  logInfo(`Server is running on port ${PORT}`);
});

export {};
