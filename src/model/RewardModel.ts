export class Reward {
  constructor(public Type: RewardType, public Value: number) {}

  static ToJSON(reward: Reward) {
    return {
      type: reward.Type,
      value: reward.Value,
    };
  }

  static ParseFromJSON(doc: any) {
    return new Reward(doc.Type, doc.Value);
  }
}

export enum RewardType {
  XP = "xp",
  COIN = "coin",
}
