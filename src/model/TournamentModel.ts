import { ObjectId } from "mongodb";
import { Reward } from "./RewardModel";

export class Tournament {
  private constructor(
    // title of the tournament.
    public Title: string,
    // id of the user who created the tournament.
    public CreatedBy: string,
    // a description of the tournament.
    public Description: string,

    // How the winner of the tournament is decided.
    public WinnerBy: "community" | "creator",
    public SubmissionDate: Date,
    public VoteDate: Date,
    // The number of possible winners for this tournament.
    public NumWinners: number,
    // Rewards offered by winning the tournament
    public Rewards: Reward[],

    public Restrictions: Restriction[] = new Array<Restriction>(),
    // Special flags that alter the tournament's behaviour.
    public Modifiers: TournamentModifiers[] = new Array<TournamentModifiers>(),
    public Submissions: Submission[] = new Array<Submission>(),
    public IsActive: boolean = true,
    public TournamentId?: ObjectId
  ) {}

  static CreateFromJSON(doc: TournamentDTO) {
    const tournament = new Tournament(
      doc.title,
      doc.createdBy,
      doc.description,
      doc.winnerBy,
      doc.submissionDate,
      doc.voteDate,
      doc.numWinners,
      doc.rewards
    );

    if (doc.restrictions) tournament.Restrictions = doc.restrictions;

    if (doc.modifiers) tournament.Modifiers = doc.modifiers;

    return tournament;
  }

  static ParseFromJSON(doc: any) {
    try {
      let {
        _id,
        title,
        createdBy,
        description,
        isActive,
        submissions,
        restrictions,
        winnerBy,
        submissionDate,
        voteDate,
        numWinners,
        rewards,
        modifiers,
      } = doc;

      if (!submissions) submissions = new Array<Submission>();

      if (!restrictions) restrictions = new Array<Restriction>();

      return new Tournament(
        title,
        createdBy,
        description,
        winnerBy,
        submissionDate,
        voteDate,
        numWinners,
        rewards,
        restrictions,
        modifiers,
        submissions,
        isActive,
        new ObjectId(_id)
      );
    } catch (err) {
      console.log("Unable to parse doc to create new tournament.");
      console.error(err);
      return null;
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
