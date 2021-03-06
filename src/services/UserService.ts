import { Collection } from "mongodb";
import { User } from "../model/UserModel";
const mongo = require("mongodb");

export class UserService {
  constructor(private db: Collection<User>) {
    this.InitUserIndices();
  }

  async InitUserIndices() {
    this.db.createIndex({ username: 1, email: 1 }, { unique: true });
    this.db.createIndex({
      "profile.totalFollowers": 1,
      "profile.totalFollowing": 1,
      "profile.level": 1,
    });
  }

  async GetUser(id: string): Promise<User | null> {
    const user = await this.db.findOne({ _id: mongo.ObjectID(id) });
    return user;
  }

  async GetFeaturedUsers() {
    const docs = await this.db
      .find()
      .sort({ "profile.totalFollowers": -1, "profile.level": -1 })
      .limit(10)
      .toArray();
    return docs;
  }

  async GetByUsername(username: string): Promise<User | undefined> {
    const user = await this.db.findOne({ username: username });
    return user || undefined;
  }

  async CreateUser(user: User): Promise<User> {
    const result = await this.db.insertOne(user);
    const newUser: User = result.ops[0];
    return newUser;
  }

  async DeleteUser(username: string): Promise<any> {
    const user = await this.db.deleteOne({ username });
    return user;
  }

  async UpdateUser(
    username: string,
    user: User,
    remove: boolean = true
  ): Promise<any> {
    const userDoc: any = user;
    if (remove) delete userDoc["password"];
    delete userDoc["_id"];

    await this.db.updateOne({ username }, { $set: userDoc }, { upsert: false });
    const updatedUser = await this.GetByUsername(username);
    return updatedUser;
  }

  async UpdateUserProfile(username: string, profile: any) {
    const user = await this.GetByUsername(username);
    if (user) {
      user.profile = profile;
      await this.UpdateUser(username, user);
      return true;
    }
    return false;
  }

  async FollowUser(
    username: string,
    userToFollowUsername: string,
    follow: boolean
  ): Promise<void> {
    const user = await this.GetByUsername(username);
    const userToFollow = await this.GetByUsername(userToFollowUsername);

    if (user && userToFollow) {
      follow
        ? User.followUser(user, userToFollow)
        : User.unfollowUser(user, userToFollow);
      await this.UpdateUser(username, user);
      await this.UpdateUser(userToFollowUsername, userToFollow);
    } else {
      throw Error("User not found.");
    }
  }
}
