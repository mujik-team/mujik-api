import { db } from "../utils/db";
import { Mixtape } from "../model/MixtapeModel";
import { Collection } from "mongodb";
const mongo = require("mongodb");

// export async function GetMixtape(id: string): Promise<Mixtape> {
//   const users = db.collection("user");
//   return { id: "1234", title: "The First One", author: "mckillagorilla" };

//   //starting work
// }
export class MixtapeService {
  constructor(private db: Collection<Mixtape>) {
    // this.InitUserIndices();
  }

  async InitUserIndices() {
    this.db.createIndex({ username: 1 }, { unique: true });
    this.db.createIndex({ email: 1 }, { unique: true });
  }

  async GetMixtape(id: string): Promise<Mixtape | null> {
    const mixtape = await this.db.findOne({ _id: mongo.ObjectID(id) });
    return mixtape;
  }

  async GetByMixtapeName(name: string): Promise<Mixtape | null> {
    const mixtape = await this.db.findOne({ mixtape_name: name });
    return mixtape;
  }

  async GetMixtapeByQuery(query: any): Promise<any> {

    const mongoQuery = [];
        for (var QueryKey in query) {
          console.log(QueryKey, query[QueryKey]);
          // if (Array.isArray(query[QueryKey])) {
          //   const newArray = [...query[QueryKey]];
          //   console.log(newArray);
          //   mongoQuery.push({ [QueryKey]: { $all: newArray.slice() } });
          // } else {
          //   mongoQuery.push({ [QueryKey]: query[QueryKey] });
          // }
          mongoQuery.push({ [QueryKey]: query[QueryKey] });
        }
  
    // for (var key in mongoQuery) {
    //   console.log(key, mongoQuery[key]);
    //     }

    console.log(mongoQuery);

    const cursor = await this.db.find({ $and: mongoQuery });

    const mixtape: any = [];

    await cursor.forEach((doc: any) => {
      console.log(doc)
      mixtape.push(doc);
    });

    console.log(mixtape);
    return mixtape;
  }

  async CreateMixtape(mixtape: Mixtape): Promise<Mixtape> {
    const result = await this.db.insertOne(mixtape);
    const newMixtape: Mixtape = result.ops[0];
    return newMixtape;
  }

  async DeleteMixtape(id: string): Promise<any> {
    const mixtape = await this.db.deleteOne({ _id: mongo.ObjectID(id) });
    return mixtape;
  }


  async UpdateMixtape(id: string, mixtape: Mixtape): Promise<any> {
    // console.log(id)
    // console.log(mixtape)
    const updatedMixtape = await this.db.replaceOne({ _id: mongo.ObjectID(id)  }, mixtape);
    return updatedMixtape;
  }
  

  // async FollowUser(
  //   username: string,
  //   userToFollowUsername: string,
  //   follow: boolean
  // ): Promise<void> {
  //   const user = await this.GetByUsername(username);
  //   const userToFollow = await this.GetByUsername(userToFollowUsername);

  //   if (user && userToFollow) {
  //     follow
  //       ? User.followUser(user, userToFollow)
  //       : User.unfollowUser(user, userToFollow);
  //     await this.UpdateUser(username, user);
  //     await this.UpdateUser(userToFollowUsername, userToFollow);
  //   } else {
  //     throw Error("User not found.");
  //   }
  // }
}
