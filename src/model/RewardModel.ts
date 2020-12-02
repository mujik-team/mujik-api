export class Reward {
  constructor(public Type: RewardType, public Value: number) {}
}

enum RewardType {
  XP = "xp",
  COIN = "coin",
}
