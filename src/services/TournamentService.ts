import { Collection, MongoClient } from "mongodb";
import { Tournament, TournamentDTO } from "../model/TournamentModel";
import { ObjectID } from "mongodb";

export class TournamentService {
  constructor(private db: Collection<Tournament>) {}

  async GetTournament(id: string): Promise<Tournament | null> {
    const doc = await this.db.findOne({ _id: new ObjectID(id) });

    if (!doc) return null;

    const tournament = Tournament.ParseFromJSON(doc);

    return tournament;
  }

  async CreateTournament(userDoc: any) {
    const tournament = Tournament.CreateFromJSON(userDoc);

    // Create json doc to be inserted and delete stub id.
    const doc: any = Tournament.ToJSON(tournament);
    delete doc._id;

    const result = await this.db.insertOne(doc);

    return Tournament.ParseFromJSON(result.ops[0]);
  }

  async DeleteTournament(id: string) {
    const result = await this.db.deleteOne({ _id: new ObjectID(id) });
    return result.deletedCount;
  }

  async UpdateTournament(id: string, userDoc: TournamentDTO) {
    const tournamentToUpdate = await this.GetTournament(id);
    if (!tournamentToUpdate) return null;

    const toUpdateDoc = Tournament.ToJSON(tournamentToUpdate);

    const unionDoc: any = {
      ...userDoc,
      ...toUpdateDoc,
    };

    const result = await this.db.replaceOne(
      { _id: new ObjectID(id) },
      unionDoc
    );

    return Tournament.ParseFromJSON(result.ops[0]);
  }
}
