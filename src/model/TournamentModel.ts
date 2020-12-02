import { ObjectId } from "mongodb";
import { Reward } from "./RewardModel";

export class Tournament {
  // title of the tournament.
  public Title: string = "Mujik Tournament";
  // id of the user who created the tournament.
  public CreatedBy: string = "mujik";
  // a description of the tournament.
  public Description: string = "Tournament Description...";

  // How the winner of the tournament is decided.
  public WinnerBy: "community" | "creator" = "community";
  public SubmissionDate: Date = new Date();
  public VoteDate: Date = new Date();
  // The number of possible winners for this tournament.
  public NumWinners: number = 3;
  // Rewards offered by winning the tournament
  public Rewards: Reward[] = new Array<Reward>();

  public Restrictions: Restriction[] = new Array<Restriction>();
  // Special flags that alter the tournament's behaviour.
  public Modifiers: TournamentModifiers[] = new Array<TournamentModifiers>();
  public Submissions: Submission[] = new Array<Submission>();
  public IsActive: boolean = true;
  public TournamentId: string = "stub";

  static CreateFromJSON(doc: TournamentDTO) {
    const tournament = new Tournament();

    tournament.Title = doc.title;
    tournament.CreatedBy = doc.createdBy;
    tournament.Description = doc.description;
    tournament.WinnerBy = doc.winnerBy;
    tournament.SubmissionDate = doc.submissionDate;
    tournament.VoteDate = doc.voteDate;
    tournament.NumWinners = doc.numWinners;
    tournament.Rewards = doc.rewards;

    if (doc.restrictions) tournament.Restrictions = doc.restrictions;

    if (doc.modifiers) tournament.Modifiers = doc.modifiers;

    return tournament;
  }

  static ParseFromJSON(doc: any) {
    try {
      const tournament = new Tournament();

      tournament.TournamentId = doc._id;
      tournament.Title = doc.title;
      tournament.CreatedBy = doc.createdBy;
      tournament.Description = doc.description;
      tournament.WinnerBy = doc.winnerBy;
      tournament.SubmissionDate = doc.submissionDate;
      tournament.VoteDate = doc.voteDate;
      tournament.NumWinners = doc.numWinners;
      tournament.Rewards = doc.rewards;
      tournament.IsActive = doc.isActive;
      tournament.Submissions = doc.submissions;
      tournament.Restrictions = doc.restrictions;
      tournament.Modifiers = doc.modifiers;

      return tournament;
    } catch (err) {
      console.log("Unable to parse doc to create new tournament.");
      console.error(err);
      return undefined;
    }
  }

  static ToJSON(tournament: Tournament) {
    return {
      _id: tournament.TournamentId,
      title: tournament.Title,
      createdBy: tournament.CreatedBy,
      description: tournament.Description,
      isActive: tournament.IsActive,
      submissions: tournament.Submissions,
      restrictions: tournament.Restrictions,
      modifiers: tournament.Modifiers,
      winnerBy: tournament.WinnerBy,
      submissionDate: tournament.SubmissionDate,
      voteDate: tournament.VoteDate,
      numWinners: tournament.NumWinners,
      rewards: tournament.Rewards,
    };
  }
}

class Submission {
  constructor(public MixtapeId: string, public NumVotes: number = 0) {}

  static ToJSON(submission: Submission) {
    return {
      id: submission.MixtapeId,
      votes: submission.NumVotes,
    };
  }
}

class Restriction {
  constructor(public Type: string, public Value: string | boolean | number) {}

  static ToJSON(restriction: Restriction) {
    return {
      type: restriction.Type,
      value: restriction.Value,
    };
  }
}

enum TournamentModifiers {
  DOUBLE_XP = "double_xp",
  DOUBLE_COINS = "double_coins",
}

export type TournamentDTO = {
  title: string;
  createdBy: string;
  description: string;
  restrictions: Restriction[];
  modifiers: TournamentModifiers[];
  winnerBy: "community" | "creator";
  submissionDate: Date;
  voteDate: Date;
  numWinners: number;
  rewards: Reward[];
};
