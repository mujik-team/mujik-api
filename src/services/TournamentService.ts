import { Collection, MongoClient } from "mongodb";
import { Tournament, TournamentDTO } from "../model/TournamentModel";
import { ObjectID } from "mongodb";
import { User } from "../model/UserModel";
import { UserService } from "./UserService";

export class TournamentService {
  constructor(
    private db: Collection<Tournament>,
    private _UserService: UserService
  ) {}

  InitTournamentIndicies() {
    this.db.createIndex({ isActive: 1, createdBy: 1 });
  }

  async GetTournament(id: string): Promise<Tournament | undefined> {
    const doc = await this.db.findOne({ _id: new ObjectID(id) });

    if (!doc) return undefined;

    const tournament = Tournament.ParseFromJSON(doc);

    return tournament;
  }

  async CreateTournament(tournamentDoc: any, createdBy: User) {
    const parsedTournament = Tournament.CreateFromJSON(tournamentDoc);

    // Create json doc to be inserted and delete stub id.
    const doc: any = Tournament.ToJSON(parsedTournament);
    delete doc._id;

    // Insert the newly parsed document to the db.
    const result = await this.db.insertOne(doc);
    const createdTournament = Tournament.ParseFromJSON(result.ops[0]);

    // Add the tournament to the user's profile.
    createdBy.profile.tournamentsCreated.push(createdTournament!.TournamentId);
    await this._UserService.UpdateUser(createdBy.username, createdBy);

    return createdTournament;
  }

  async DeleteTournament(id: string) {
    const result = await this.db.deleteOne({ _id: new ObjectID(id) });
    return result.deletedCount;
  }

  async UpdateTournament(id: string, userDoc: TournamentDTO) {
    const tournamentToUpdate = await this.GetTournament(id);
    if (!tournamentToUpdate) return null;

    const toUpdateDoc = Tournament.ToJSON(tournamentToUpdate);

    // Use the spread operator to create a union of the two docs.
    // With preference given to the updated doc.
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
