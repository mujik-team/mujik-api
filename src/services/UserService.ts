import { Collection } from "mongodb";
import { User } from "../model/UserModel";
const mongo = require("mongodb");

export class UserService {
  constructor(private db: Collection<User>) {}

  async InitUserIndices() {
    this.db.createIndex({ username: 1 }, { unique: true });
    this.db.createIndex({ email: 1 }, { unique: true });
  }

  async GetUser(id: string): Promise<User | null> {
    const user = await this.db.findOne({ _id: mongo.ObjectID(id) });
    return user;
  }

  async GetByUsername(username: string): Promise<User | null> {
    const user = await this.db.findOne({ username: username });
    return user;
  }

  async CreateUser(user: User): Promise<User> {
    const result = await this.db.insertOne(user);
    const newUser: User = result.ops[0];
    return newUser;
  }

  async DeleteUser(id: string): Promise<any> {
    const user = await this.db.deleteOne({ _id: mongo.ObjectID(id) });
    return user;
  }

  async UpdateUser(id: string, user: User): Promise<any> {
    const updatedUser = await this.db.replaceOne(
      { _id: mongo.ObjectID(id) },
      user
    );
    return updatedUser;
  }

  async FollowUser(
    username: string,
    userToFollowUsername: string,
    follow: boolean
  ): Promise<void> {
    const user = await this.GetByUsername(username);
    const userToFollow = await this.GetByUsername(userToFollowUsername);

    if (user && userToFollow) {
      follow ? user.followUser(userToFollow) : user.unfollowUser(userToFollow);
      await this.UpdateUser(username, user);
      await this.UpdateUser(userToFollowUsername, userToFollow);
    } else {
      throw Error("User not found.");
    }
  }
}
