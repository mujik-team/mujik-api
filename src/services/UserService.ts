import { User } from "../model/UserModel";
import { db } from "../utils/db";
const mongo = require("mongodb");

export async function GetUser(id: string): Promise<any> {
  const users = db.collection("user");
  const user = await users.findOne({ "_id": mongo.ObjectID(id) });
  return user;
}

export async function GetByUsername(username: string): Promise<any | null> {
  // return { id: "12345", username: "mckillagorilla", password: "secret" };
  const users = db.collection("user");
  const user = await users.findOne({ username: username });
  return user;
}

export async function CreateUser(user: User): Promise<any> {
  // return { id: "1234", username: "mckillagorilla", password: "secret" };
  const users = db.collection("user");
  const newUser = await users.insertOne(user);
  return newUser;
}

export async function DeleteUser(id: string): Promise<any> {
  const users = db.collection("user");
  const user = await users.deleteOne({ "_id": mongo.ObjectID(id) });
  return user;
}

export async function UpdateUser(id: string, user: User): Promise<any> {
  const users = db.collection("user");
  const updatedUser = await users.replaceOne({ "_id": mongo.ObjectID(id) }, user);
  return updatedUser;
}