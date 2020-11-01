import { Db, MongoClient } from "mongodb";

const uri = process.env.MONGO_URL || "mongodb://localhost:27017";

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
