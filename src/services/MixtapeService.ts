import { Mixtape } from "../model/MixtapeModel";
import { Collection } from "mongodb";
const mongo = require("mongodb");

export class MixtapeService {
  constructor(private db: Collection<Mixtape>) {}

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
      console.log(doc);
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
    const updatedMixtape = await this.db.replaceOne(
      { _id: mongo.ObjectID(id) },
      mixtape
    );
    return updatedMixtape.ops[0];
  }
}
