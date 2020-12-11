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

  public Entrants = new Map<string, string>();
  public Voters = new Map<string, any>();
  public Restrictions: Restriction[] = new Array<Restriction>();
  // Special flags that alter the tournament's behaviour.
  public Modifiers: TournamentModifiers[] = new Array<TournamentModifiers>();
  public Submissions = new Map<string, Submission>();
  public IsActive: boolean = true;
  public TournamentId: string = "stub";

  static CreateFromJSON(doc: TournamentDTO) {
    const tournament = new Tournament();

    tournament.Title = doc.Title;
    tournament.CreatedBy = doc.CreatedBy;
    tournament.Description = doc.Description;
    tournament.WinnerBy = doc.WinnerBy;
    tournament.SubmissionDate = doc.SubmissionDate;
    tournament.VoteDate = doc.VoteDate;
    tournament.NumWinners = doc.NumWinners;
    tournament.Rewards = doc.Rewards.map((r) => Reward.ParseFromJSON(r));

    if (doc.Modifiers) tournament.Modifiers = doc.Modifiers;

    return tournament;
  }

  static ParseFromJSON(doc: any) {
    try {
      const tournament = new Tournament();

      tournament.TournamentId = doc._id;
      tournament.Title = doc.Title;
      tournament.CreatedBy = doc.CreatedBy;
      tournament.Description = doc.Description;
      tournament.WinnerBy = doc.WinnerBy;
      tournament.SubmissionDate = doc.SubmissionDate;
      tournament.VoteDate = doc.VoteDate;
      tournament.NumWinners = doc.NumWinners;
      tournament.Rewards = doc.Rewards;
      tournament.IsActive = doc.IsActive;
      tournament.Restrictions = doc.Restrictions;
      tournament.Modifiers = doc.Modifiers;

      tournament.Submissions = doc.Submissions
        ? new Map(
            Object.keys(doc.Submissions)?.map((key) => [
              key,
              doc.Submissions[key],
            ])
          )
        : new Map();
      tournament.Entrants = doc.Entrants
        ? new Map(
            Object.keys(doc.Entrants)?.map((key) => [key, doc.Entrants[key]])
          )
        : new Map();

      tournament.Voters = doc.Voters
        ? new Map(Object.keys(doc.Voters)?.map((key) => [key, doc.Voters[key]]))
        : new Map();

      return tournament;
    } catch (err) {
      console.log("Unable to parse doc to create new tournament.");
      console.error(err);
      return undefined;
    }
  }

  static ToJSON(tournament: Tournament) {
    const Submissions: any = {};
    const Entrants: any = {};
    const Voters: any = {};

    tournament.Submissions.forEach((v, k) => {
      Submissions[k] = v;
    });

    tournament.Entrants.forEach((v, k) => {
      Entrants[k] = v;
    });

    tournament.Voters.forEach((v, k) => {
      Voters[k] = v;
    });

    const json = {
      _id: tournament.TournamentId,
      Title: tournament.Title,
      CreatedBy: tournament.CreatedBy,
      Description: tournament.Description,
      IsActive: tournament.IsActive,
      Submissions,
      Entrants,
      Voters,
      Restrictions: tournament.Restrictions,
      Modifiers: tournament.Modifiers,
      WinnerBy: tournament.WinnerBy,
      SubmissionDate: tournament.SubmissionDate,
      VoteDate: tournament.VoteDate,
      NumWinners: tournament.NumWinners,
      Rewards: tournament.Rewards,
    };

    return json;
  }
}

export class Submission {
  constructor(public MixtapeId: string, public NumVotes: number = 0) {}
}

export class Restriction {
  constructor(public Type: string, public Value: string | boolean | number) {}
}

enum TournamentModifiers {
  DOUBLE_XP = "double_xp",
  DOUBLE_COINS = "double_coins",
}

enum TournamentState {
  SUBMISSION = "SUBMISSION",
  VOTING = "VOTING",
  ENDED = "ENDED",
}

export type TournamentDTO = {
  Title: string;
  CreatedBy: string;
  Description: string;
  Restrictions: Restriction[];
  Modifiers: TournamentModifiers[];
  WinnerBy: "community" | "creator";
  SubmissionDate: Date;
  VoteDate: Date;
  NumWinners: number;
  Rewards: Reward[];
};
