import { _UserService } from "../app";

export class User {
  constructor(
    public username: string,
    public email: string,
    public password: string,
    public profile: Profile = new Profile()
  ) {
    if (username.length < 4)
      throw new Error("Username must be at least 4 characters.");

    if (password.length < 6)
      throw new Error("Password must be at least 6 characters.");
  }

  static followUser(currentUser: User, userToFollow: User) {
    // Check if already followed user.
    if (currentUser.profile.following.includes(userToFollow.username)) {
      return false;
    }

    currentUser.profile.following.push(userToFollow.username);
    userToFollow.profile.followers.push(currentUser.username);
    userToFollow.profile.totalFollowers += 1;
    currentUser.profile.totalFollowing += 1;

    _UserService.UpdateUser(currentUser.username, currentUser);
    _UserService.UpdateUser(userToFollow.username, userToFollow);
    return true;
  }

  static unfollowUser(currentUser: User, userToUnfollow: User) {
    // Check if already not following user.
    if (!currentUser.profile.following.includes(userToUnfollow.username))
      return true;

    currentUser.profile.following = currentUser.profile.following.filter(
      (f) => f !== userToUnfollow.username
    );
    userToUnfollow.profile.followers = userToUnfollow.profile.followers.filter(
      (f) => f !== currentUser.username
    );

    currentUser.profile.totalFollowing -= 1;
    userToUnfollow.profile.totalFollowers -= 1;

    _UserService.UpdateUser(currentUser.username, currentUser);
    _UserService.UpdateUser(userToUnfollow.username, userToUnfollow);

    return true;
  }

  static cleanForAPI(user: User) {
    const userDoc: any = user;

    delete userDoc["password"];
    delete userDoc["_id"];

    return userDoc;
  }
}

class Profile {
  bio: string = "";
  level: number = 1;
  coins: number = 5000;

  favGenre = new Array<string>();
  favArtist = new Array<string>();
  mixtapes = new Array<string>();

  totalFollowers: number = 0;
  totalFollowing: number = 0;
  followers = new Array<string>();
  following = new Array<string>();

  tournamentsJoined = new Array<string>();
  tournamentsCreated = new Array<string>();
  tournamentsFollowing = new Array<string>();
  tournamentsWon: TournamentsWon = new Map();
}

type TournamentsWon = Map<string, { Title: string; Placement: number }>;
