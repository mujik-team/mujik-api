export class User {
  id?: string;

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

  followUser(userToFollow: User) {
    // Check if already followed user.
    if (this.profile.following.includes(userToFollow.username)) {
      return false;
    }

    this.profile.following.push(userToFollow.username);
    userToFollow.profile.followers.push(this.username);
    userToFollow.profile.totalFollowers += 1;
    this.profile.totalFollowing += 1;
    return true;
  }

  unfollowUser(userToUnfollow: User) {
    // Check if already not following user.
    if (!this.profile.following.includes(userToUnfollow.username)) return true;

    this.profile.following = this.profile.following.filter(
      (f) => f !== userToUnfollow.username
    );
    userToUnfollow.profile.followers = userToUnfollow.profile.followers.filter(
      (f) => f !== userToUnfollow.username
    );
    this.profile.totalFollowing -= 1;
    userToUnfollow.profile.totalFollowers -= 1;

    return true;
  }
}

class Profile {
  bio: string = "";
  level: number = 1;
  coins: number = 0;

  favGenre = new Array<string>();
  favArtist = new Array<string>();
  mixtapes = new Array<string>();

  totalFollowers: number = 0;
  totalFollowing: number = 0;
  followers = new Array<string>();
  following = new Array<string>();

  tournamentsJoined = new Array<string>();
  tournamentsCreated = new Array<string>();
}
