import { Db, MongoClient } from "mongodb";

const MONGO_HOSTNAME = process.env.MONGO_HOSTNAME || "localhost";
const MONGO_PORT = process.env.MONGO_PORT || 27017;

const uri = `mongodb://${MONGO_HOSTNAME}:${MONGO_PORT}`;
console.log("HOSTNAME", MONGO_HOSTNAME);

console.log("MONGOPORT", MONGO_PORT);
export const client = new MongoClient(uri);
export let db: Db;

export async function initDb() {
  try {
    await client.connect();
    db = client.db("mujik");

    console.info("Successfully connected to DB.");
  } catch (err) {
    console.error(`Unable to connect to DB.`, err);
  }
}
