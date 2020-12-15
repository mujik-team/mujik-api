import { Mixtape } from "../model/MixtapeModel";
import { Collection } from "mongodb";
const mongo = require("mongodb");

export class MixtapeService {
  constructor(private db: Collection<Mixtape>) {
    this.InitMixtapeIndices();
  }

  InitMixtapeIndices() {
    this.db.createIndex({ createdBy: "text", mixtapeName: "text" });
    this.db.createIndex({ lastUpdated: 1, isPrivate: 1, followers: 1 });
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
      mongoQuery.push({ [QueryKey]: query[QueryKey] });
    }

    const cursor = this.db.find({ $and: mongoQuery });

    const mixtape: any = [];

    await cursor.forEach((doc: any) => {
      mixtape.push(doc);
    });

    return mixtape;
  }

  async GetFeaturedMixtapes() {
    const docs = await this.db
      .find({ isPrivate: false })
      .sort({ lastUpdated: -1, followers: 1 })
      .limit(10)
      .toArray();

    return docs;
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
    const updatedMixtape = await this.db.replaceOne(
      { _id: mongo.ObjectID(id) },
      mixtape
    );
    return updatedMixtape.ops[0];
  }
}
