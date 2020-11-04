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

export async function FollowUser(id: string, followId: string, follow: boolean): Promise<any> {
  const users = db.collection("user");
  const user1 = await users.findOne({ "_id": mongo.ObjectID(id) });
  const user2 = await users.findOne({ "_id": mongo.ObjectID(followId) });

  if (follow === true) {
    // console.log(user1);
    // console.log(user2);
    // add followId to user1.profile.following and increase user1.profile.totalFollowing
    user1.profile.following.push(followId);
    user1.profile.totalFollowing = user1.profile.totalFollowing + 1;
    console.log("set user 1");
    // add id to user2.profile.followers and increase user2.profile.totalFollowers
    user2.profile.followers.push(id);
    user2.profile.totalFollowers = user2.profile.totalFollowers + 1;
    console.log("set user 2");
  } else {
    // remove followId from user1.profile.following and decrease user1.profile.totalFollowing
    const index1 = user1.profile.following.indexOf(followId);
    console.log(index1);
    if (index1 > -1) {
      user1.profile.following.splice(index1, 1);
      console.log(user1.profile.following);
      user1.profile.totalFollowing = user1.profile.totalFollowing - 1;
    }
    // remove id from user2.profile.followers and decrease user2.profile.totalFollowers
    const index2 = user2.profile.followers.indexOf(id);
    console.log(index2)
    if (index2 > -1) {
      user2.profile.followers.splice(index2, 1);
      user2.profile.totalFollowers = user2.profile.totalFollowers - 1;
    }
  }

  console.log("update user 1");
  await UpdateUser(id, user1);
  console.log("update user 2");
  await UpdateUser(followId, user2);
  return true;
}