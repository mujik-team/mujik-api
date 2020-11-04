export type User = {
  id: string;
  username: string;
  password: string;
  email: string;
  profile: {
    totalFollowers: number;
    totalFollowing: number;
    bio: string;
    favGenre: Array<string>;
    favArtist: Array<string>;
    mixtapes: Array<object>;
    followers: Array<string>;
    following: Array<string>;
    coins: number;
    level: number;
    xp: number;
    tournamentsJoined: Array<string>;
    tournamentsCreated: Array<string>;
  }
};
