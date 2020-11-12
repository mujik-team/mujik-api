export class Mixtape {
  constructor(
    public createdBy: string,
    public mixtapeName: string,
    public description: string,
    public tags = new Array<string>(),
    public isPublic: boolean,
    public image: any = null,
    public lastUpdated = Date.now(),
    public followers = 0,
    public totalDuration = 0,
    public songs = new Array<string>(),
    public tournamentsWon = new Array<Object>(),
    // public mixtapeDetails = new MixtapeDetails()
  ) {}
}

class MixtapeDetails {
  // constructor(
  public image: any = null;
  public lastUpdated = Date.now();
  public followers = 0;
  public totalDuration = 0;
  public songs = new Array<string>();
  public tournamentsWon = new Array<Object>();
  // ){}
}
