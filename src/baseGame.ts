// Give these string values so they can be round trip through being used as object keys.
// These are never encoded as-is so strings are fine.
export enum GameScore {
  Win = "Win",
  NearWin = "NearWin",
  Loss = "Loss",
}

export type GameResult = {
  score: GameScore;
  serializedResult: string;
};

export abstract class BaseGame {
  private _resultRegex: RegExp | null = null;

  /**
   * The name of the game.
   */
  abstract get name(): string;

  /**
   * The name of the game in lowercase with only alphanumeric characters.
   */
  get fileName(): string {
    return this.name.toLowerCase().replace(/[^a-z0-9]/g, "");
  }

  /**
   * A regex that matches the result of the game.
   */
  get resultRegex(): RegExp {
    if (this._resultRegex === null) {
      this._resultRegex = this._buildResultRegex();
    }
    return this._resultRegex;
  }

  /**
   * Builds a regex that matches the result of the game. The return value will be cached.
   */
  abstract _buildResultRegex(): RegExp;

  /**
   * A link to the game.
   */
  abstract get link(): string;

  /**
   * Parses the user-supplied game result and returns a serialized version of
   * the game data in addition to the "score".
   *
   * @param gameResult the result of the game run through the resultRegex
   */
  abstract serializeResult(gameResult: RegExpMatchArray): GameResult;

  /**
   * The share text of the result of the game given the serialized game data.
   *
   * @param serializedResult the serialized game data
   */
  abstract deserialize(serializedResult: string): string;
}
