import { Collection, MongoClient } from "mongodb";
import { Tournament, TournamentDTO } from "../model/TournamentModel";
import { ObjectID } from "mongodb";
import { User } from "../model/UserModel";
import { UserService } from "./UserService";
import { RewardType } from "../model/RewardModel";

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

    // Calculate XP Rewards.
    const xp = 50 * Math.log2(createdBy.profile.level + 1) * 100;
    parsedTournament.Rewards.push({
      Type: RewardType.XP,
      Value: xp,
    });

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

  async DeleteTournament(id: string, username: string) {
    const tournament = await this.GetTournament(id);
    const user = await this._UserService.GetByUsername(username);

    if (!tournament) throw Error("Tournament with that id doesn't exist.");

    if (!user) throw Error("User with that id doesn't exist.");

    if (tournament.CreatedBy !== username)
      throw Error("User is not the creator of this tournament.");

    const result = await this.db.deleteOne({ _id: new ObjectID(id) });

    // Delete tournament from user.
    user.profile.tournamentsCreated = user.profile.tournamentsCreated.filter(
      (tourneyId) => tourneyId !== id
    );

    this._UserService.UpdateUser(username, user);

    return result.deletedCount;
  }

  async UpdateTournament(id: string, userDoc: TournamentDTO) {
    const tournamentToUpdate = await this.GetTournament(id);
    if (!tournamentToUpdate) return null;

    const toUpdateDoc = Tournament.ToJSON(tournamentToUpdate);

    // Use the spread operator to create a union of the two docs.
    // With preference given to the updated doc.
    const unionDoc: any = {
      ...toUpdateDoc,
      ...userDoc,
    };
    console.log(unionDoc);

    const result = await this.db.replaceOne(
      { _id: new ObjectID(id) },
      unionDoc
    );

    return Tournament.ParseFromJSON(result.ops[0]);
  }

  async FollowTournament(
    tournamentId: string,
    username: string,
    follow: boolean
  ) {
    const tournament = await this.GetTournament(tournamentId);
    const user = await this._UserService.GetByUsername(username);

    if (user && tournament) {
      if (follow) {
        user.profile.tournamentsFollowing.push(tournament.TournamentId);
        this._UserService.UpdateUser(user.username, user);
      } else {
        user.profile.tournamentsFollowing = user.profile.tournamentsFollowing.filter(
          (id) => id !== tournamentId
        );
        this._UserService.UpdateUser(user.username, user);
      }
    } else {
      throw Error("Tournament with that ID doesn't exist.");
    }
  }
}
