import { client } from "./db";

export function setupCleanup() {
  process.on("exit", () => {
    // Close connection to the database.
    client.close();
  });

  process.on("SIGINT", () => {
    console.log("\nCtrl-C... Exiting Gracefully...");
    process.exit();
  });
}
