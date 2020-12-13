import { Collection, MongoClient } from "mongodb";
import {
  Tournament,
  Submission,
  TournamentDTO,
} from "../model/TournamentModel";
import { ObjectID } from "mongodb";
import { User } from "../model/UserModel";
import { UserService } from "./UserService";
import { RewardType } from "../model/RewardModel";
import { MixtapeService } from "./MixtapeService";

export class TournamentService {
  constructor(
    private db: Collection<Tournament>,
    private _UserService: UserService,
    private _MixtapeService: MixtapeService
  ) {}

  InitTournamentIndicies() {
    this.db.createIndex({ isActive: 1, createdBy: 1 });
  }

  async GetAllTournaments(): Promise<Tournament[]> {
    const docs = await this.db.find().toArray();

    return docs.map((doc: any) =>
      Tournament.ParseFromJSON(doc)
    ) as Tournament[];
  }

  async GetMultipleTournaments(ids: string[]): Promise<Tournament[]> {
    const results = await Promise.all(ids.map((id) => this.GetTournament(id)));
    const tournaments = results.filter((t) => t !== undefined) as Tournament[];

    return tournaments;
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

    delete (userDoc as any)["_id"];

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
        // Check if already follow. If so, just return.
        if (user.profile.tournamentsFollowing.includes(tournamentId)) return;

        user.profile.tournamentsFollowing.push(tournamentId);
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

  async MakeSubmission(
    tournamentId: string,
    username: string,
    mixtapeId: string
  ) {
    const tournament = await this.GetTournament(tournamentId);
    const user = await this._UserService.GetByUsername(username);
    const mixtape = await this._MixtapeService.GetMixtape(mixtapeId);

    // Check if tournament exists.
    if (!tournament) throw Error("Tournament with that ID doesn't exist.");

    // Check if user exists.
    if (!user) throw Error("User with that ID doesn't exist.");

    // Check if mixtape exists.
    if (!mixtape) throw Error("Mixtape with that ID doesn't exist");

    const dateNow = new Date();

    // Check if tournament is in submission mode.
    if (dateNow > tournament.SubmissionDate)
      throw Error("Unable to submit. Tournament is not in submission state.");

    // Check if user has already entered the tournament.
    if (tournament.Entrants.has(user.username))
      throw Error("User has already made an entry in this tournament.");

    // Check if the mixtape is private.
    if (mixtape.isPrivate) throw Error("This mixtape is private.");

    // @TODO Check if mixtape meets restrictions...
    tournament.Submissions.set(mixtapeId, new Submission(mixtapeId));
    tournament.Entrants.set(user.username, "");

    user.profile.tournamentsJoined.push(tournamentId);

    await this.UpdateTournament(tournamentId, tournament);
    await this._UserService.UpdateUser(username, user);
  }

  async VoteForMixtape(
    tournamentId: string,
    username: string,
    mixtapeId: string
  ) {
    const tournament = await this.GetTournament(tournamentId);
    const user = await this._UserService.GetByUsername(username);
    const mixtape = await this._MixtapeService.GetMixtape(mixtapeId);
    // Check if tournament exists.
    if (!tournament) throw Error("Tournament with that ID doesn't exist.");

    // Check if user exists.
    if (!user) throw Error("User with that ID doesn't exist.");

    // Check if mixtape exists.
    if (!mixtape) throw Error("Mixtape with that ID doesn't exist");

    // Check if mixtape was submitted to tournament.
    const submission = tournament.Submissions.get(mixtapeId);
    if (!submission)
      throw Error("Mixtape with that ID was not submitted to this tournament.");

    const dateNow = new Date();

    if (!(dateNow > tournament.SubmissionDate && dateNow < tournament.VoteDate))
      throw Error("Unable to vote. Tournament is not in voting state.");

    // Add vote to submission.
    submission.NumVotes += 1;

    if (tournament.Voters.has(username)) {
      let voteData = tournament.Voters.get(username);
      const date = new Date();
      const voteId = `${mixtapeId}-${date.toString()}`;

      voteData = { ...voteData, [voteId]: mixtapeId };
      tournament.Voters.set(username, voteData);
    }

    // Save.
    await this.UpdateTournament(tournamentId, tournament);

    // Add Tournament to user's following.
    await this.FollowTournament(tournamentId, username, true);
  }
}
