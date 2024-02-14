import { BaseGame, GameResult, GameScore } from "./baseGame";
import { ALLOWED_MISSES, gamesForGameNumber } from "./gameList";
import { Store } from "./ui/store";
import { base64ToInt, intToBase64, nextInt } from "./util/base64";
import { emojiSquares } from "./util/emoji";

type Skip = { isSkip: true };
export const SKIP: Skip = { isSkip: true };
type VariableResult = GameResult | Skip | null;
export type GameResultOrSkip = Partial<GameResult> & Partial<Skip>;
type VRUnion = GameResultOrSkip | null;

const resultChars = {
  win: emojiSquares.green,
  bonusWin: "⭐️",
  nearWin: emojiSquares.yellow,
  bonusNearWin: "🌑",
  loss: emojiSquares.red,
  bonusLoss: emojiSquares.black,
  skip: "❌",
  noResultYet: "❔",
  streakFlame: "🔥",
};

const scoreCodes = {
  [GameScore.Win]: 3,
  [GameScore.NearWin]: 2,
  [GameScore.Loss]: 1,
  // Skip is 0
};
const inverseScoreCodes = Object.fromEntries(
  Object.entries(scoreCodes).map(([k, v]) => [v, k as GameScore]),
) as Record<number, GameScore>;

/**
 * This saves 1 character in our share URLs at the expense of limiting
 * the max game number to (64^2 - 1) = 4095, which is plenty.
 */
const gameNumberWidth = 2;

export class GameManager {
  private curIdx = 0;
  private games: Array<BaseGame> = [];
  private results: Array<VariableResult> = [];
  private allowedMisses = 0;
  private _gameNumber = 0;

  setGames(args: { games: Array<BaseGame>; allowedMisses: number; gameNumber: number }) {
    this.games = args.games;
    this.results = Array(this.games.length).fill(null);
    this.curIdx = 0;
    this.allowedMisses = args.allowedMisses;
    this._gameNumber = args.gameNumber;
  }

  numGames() {
    return this.games.length;
  }

  get gameNumber() {
    return this._gameNumber;
  }

  isFinished(): boolean {
    return this.curIdx >= this.games.length;
  }

  get requiredWins(): number {
    return this.games.length - this.allowedMisses;
  }

  hasWon(): boolean {
    return (
      this.results.filter((r) => (r as VRUnion)?.score === GameScore.Win).length >=
      this.requiredWins
    );
  }

  winStars(): number {
    return Math.max(
      0,
      this.results.filter((r) => (r as VRUnion)?.score === GameScore.Win).length -
        this.requiredWins,
    );
  }

  makeGuessFractionString() {
    const winIndexes = this.results
      .map((result, idx) => [result, idx] as [GameResultOrSkip | null, number])
      .filter(([result]) => result?.score === GameScore.Win)
      .map(([, idx]) => idx);
    let wonAfterGuesses = 0;
    if (winIndexes.length >= this.requiredWins) {
      wonAfterGuesses = winIndexes[this.requiredWins - 1] + 1;
    }
    return `${wonAfterGuesses ? wonAfterGuesses.toString() : "X"}/${this.numGames()}`;
  }

  makeStreakIndicatorString() {
    if (this.winStars() !== this.allowedMisses) {
      return "";
    }
    const allPastGames = Store.getCompletedGames();
    let streakLen = 1;
    for (let previousGameNum = this.gameNumber - 1; previousGameNum > 0; --previousGameNum) {
      const pastGame = allPastGames[previousGameNum];
      if (!pastGame || pastGame.winStars() !== pastGame.allowedMisses) {
        break;
      }
      ++streakLen;
    }
    if (streakLen === 1) {
      return "";
    }
    return ` ${resultChars.streakFlame.repeat(streakLen)}`;
  }

  addNextResult(result: GameResult) {
    if (this.isFinished()) {
      throw new Error("No more games");
    }
    this.results[this.curIdx] = result;
    this.curIdx++;
  }

  skipCurrentGame() {
    if (this.isFinished()) {
      throw new Error("No more games");
    }
    this.results[this.curIdx] = SKIP;
    this.curIdx++;
  }

  undoLastResult() {
    if (this.curIdx === 0) {
      return;
    }
    this.curIdx--;
    this.results[this.curIdx] = null;
  }

  numGamesCompleted(): number {
    return this.curIdx;
  }

  currentGame(): BaseGame | null {
    if (this.isFinished()) {
      return null;
    }
    return this.games[this.curIdx];
  }

  gamesAndResults(): Array<[BaseGame, GameResult | Skip]> {
    return this.games.map((game, idx) => [game, this.results[idx] ?? SKIP]);
  }

  resultsSoFar(skipRemaining = false): string {
    let ret = "";
    let winsSoFar = 0;
    for (const result of this.results) {
      const hasWon = winsSoFar >= this.games.length - this.allowedMisses;
      if (result === null && !skipRemaining) {
        ret += resultChars.noResultYet;
      } else if ((result === null && skipRemaining) || result === SKIP) {
        ret += resultChars.skip;
      } else {
        const score = (result as GameResult).score;
        if (score === GameScore.Win) {
          winsSoFar++;
        }
        ret +=
          score === GameScore.Win
            ? hasWon
              ? resultChars.bonusWin
              : resultChars.win
            : score === GameScore.NearWin
              ? hasWon
                ? resultChars.bonusNearWin
                : resultChars.nearWin
              : hasWon
                ? resultChars.bonusLoss
                : resultChars.loss;
      }
    }
    return ret;
  }

  encode(): string {
    const gameResults: Array<string> = [];
    let encodedScores = 0;
    // Each game results in win, near win, loss, or skip: 2 bits per game * 5 games = 10 bits so this fits in 3 b64 characters (18 bits).
    for (let i = 0; i < this.results.length; i++) {
      const result = this.results[i];
      if (result === null || result === SKIP) {
        // Skip is 0 so we can ignore it. Treat uncompleted games as a skip.
        continue;
      }
      const gameResult = result as GameResult;
      gameResults.push((result as GameResult).serializedResult);
      encodedScores += scoreCodes[gameResult.score] * 4 ** i;
    }
    const encoded = intToBase64(this.gameNumber, gameNumberWidth) + intToBase64(encodedScores);
    return [encoded, ...gameResults].join("=");
  }

  decode(encoded: string) {
    let [managerResult, ...gameResults] = encoded.split("=");
    [this._gameNumber, managerResult] = nextInt(managerResult, gameNumberWidth);
    let encodedScores = base64ToInt(managerResult);
    const playedGames = gamesForGameNumber(this._gameNumber);
    this.setGames({
      games: playedGames,
      allowedMisses: ALLOWED_MISSES,
      gameNumber: this._gameNumber,
    });

    for (let i = 0; i < this.results.length; i++) {
      const score = encodedScores % 4;
      if (score !== 0) {
        const gameResult: GameResult = {
          score: inverseScoreCodes[score],
          serializedResult: gameResults.shift() ?? "",
        };
        this.addNextResult(gameResult);
      } else {
        this.skipCurrentGame();
      }
      encodedScores = Math.floor(encodedScores / 4);
    }
  }

  static fromEncoded(encoded: string): GameManager {
    const manager = new GameManager();
    manager.decode(encoded);
    return manager;
  }
}
