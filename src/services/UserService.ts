import { User } from "../model/UserModel";
import { db } from "../utils/db";

export async function GetUser(id: string): Promise<User> {
  const users = db.collection("user");

  return { id: "12345", username: "mckillagorilla", password: "secret" };
}

export async function GetByUsername(username: string): Promise<User | null> {
  return { id: "12345", username: "mckillagorilla", password: "secret" };
}

export async function CreateUser(user: User): Promise<User> {
  return { id: "1234", username: "mckillagorilla", password: "secret" };
}
