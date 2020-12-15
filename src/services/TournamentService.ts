import { Collection } from "mongodb";
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
  ) {
    this.InitTournamentIndicies();
  }

  InitTournamentIndicies() {
    this.db.createIndex({ SubmissionDate: 1, VoteDate: 1 });
    this.db.createIndex({ CreatedBy: "text", Title: "text" });
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

  async GetFeaturedTournaments() {
    const officialUsers = ["mango", "jelly", "mujik", "theweeknd"];

    const docs = await this.db
      .find({ CreatedBy: { $in: officialUsers } })
      .sort({ _id: -1 })
      .limit(10)
      .toArray();

    return docs.map((d) => Tournament.ParseFromJSON(d));
  }

  async CreateTournament(tournamentDoc: any, createdBy: User) {
    const parsedTournament = Tournament.CreateFromJSON(tournamentDoc);

    // Calculate XP Rewards.
    const xp = 50 * Math.log2(createdBy.profile.level + 1) * 200;
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
    if (tournament.Submissions.has(user.username))
      throw Error("User has already made an entry in this tournament.");

    // Check if the mixtape is private.
    if (mixtape.isPrivate) throw Error("This mixtape is private.");

    tournament.Submissions.set(user.username, new Submission(mixtapeId));

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
    const submission = tournament.Submissions.get(mixtape.createdBy);
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
      const voteId = `${mixtapeId}-${date.toString()}-${Math.random}`;

      voteData = { ...voteData, [voteId]: mixtapeId };
      tournament.Voters.set(username, voteData);
    } else {
      const date = new Date();
      const voteId = `${mixtapeId}-${date.toString()}-${Math.random}`;
      const voteData = { [voteId]: mixtapeId };
      tournament.Voters.set(username, voteData);
    }

    // Save.
    await this.UpdateTournament(tournamentId, tournament);

    // Add Tournament to user's following.
    await this.FollowTournament(tournamentId, username, true);
  }

  async RedeemRewards(tournamentId: string, username: string) {
    const tournament = await this.GetTournament(tournamentId);
    const user = await this._UserService.GetByUsername(username);

    // Check if tournament exists.
    if (!tournament) throw Error("Tournament with that ID doesn't exist.");

    // Check if user exists.
    if (!user) throw Error("User with that ID doesn't exist.");

    // Check if user entered the tournament.
    if (!tournament.Submissions.has(username))
      throw Error("User with that ID never entered this tournament.");

    // Check if user has already redeemed their rewards.

    const userSubmission = tournament.Submissions.get(username);
    if (userSubmission!.RewardsClaimed)
      throw Error("User has already claimed their rewards!");

    // Calculate rewards earned by user.
    const userSubmissionId = tournament.Submissions.get(username)!.MixtapeId;
    const numCoins = tournament.Rewards[0].Value;
    const numXP = tournament.Rewards[1].Value;

    // Check if user is winner.
    const submissions = [...tournament.Submissions].map(
      ([name, value]) => value
    );

    submissions.sort((t1, t2) => {
      const compare = t2.NumVotes - t1.NumVotes;

      if (compare == 0) return t2.MixtapeId < t1.MixtapeId ? 0 : 1;
      else return compare;
    });

    const winners = submissions.slice(0, 3);
    const winnerIndex = winners.findIndex(
      (s) => s.MixtapeId == userSubmissionId
    );

    // User is one of the winners.
    if (winnerIndex !== -1) {
      // User gets 1/2^n fraction of the reward
      // Where n is their placement in the tournament.
      // So someone who is 1st will get 1/2, 2nd 1/4 and so on.
      // This is different for XP where it is 2^(n-1)

      const coinsEarned = numCoins / Math.pow(2, winnerIndex + 1);
      user.profile.coins += Math.round(coinsEarned);

      const xpEarned = numXP / Math.pow(2, winnerIndex);
      user.profile.level += Math.round(xpEarned);

      const tournamentsWon = user.profile.tournamentsWon as any;

      // Add this as a Tournament won in user profile.
      tournamentsWon[tournamentId] = {
        Title: tournament.Title,
        Placement: winnerIndex + 1,
      };

      // Mark reward as claimed.
      userSubmission!.RewardsClaimed = true;
      tournament.Submissions.set(username, userSubmission!);

      await Promise.all([
        this._UserService.UpdateUser(username, user),
        this.UpdateTournament(tournamentId, Tournament.ToJSON(tournament)),
      ]);

      return { coins: coinsEarned, xp: xpEarned };
    }
    // User didn't win.
    else {
      // User just gains 1000 xp.
      if (tournament.CreatedBy !== user.username) user.profile.level += 1000;

      // Mark reward as claimed.
      const userSubmission = tournament.Submissions.get(username);
      userSubmission!.RewardsClaimed = true;
      tournament.Submissions.set(username, userSubmission!);

      await Promise.all([
        this._UserService.UpdateUser(username, user),
        this.UpdateTournament(tournamentId, Tournament.ToJSON(tournament)),
      ]);

      return { xp: 1000 };
    }
  }
}
