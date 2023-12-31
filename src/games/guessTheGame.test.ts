import { GameScore } from "../baseGame";
import { GuessTheGame } from "./guessTheGame";

const sampleWin = `
#GuessTheGame #596

🎮 🟥 🟩 ⬜ ⬜ ⬜ ⬜
`;

const sampleLoss = `
#GuessTheGame #595

🎮 🟥 🟥 🟥 🟥 🟥 🟥
`;

describe("GuessTheGame", () => {
  const guessTheGame = new GuessTheGame();

  it("can parse with extra link text", () => {
    const match = guessTheGame.resultRegex.exec(sampleWin + "\nhttps://guessthe.game/");
    expect(match).not.toBeNull();
    const { score, serializedResult } = guessTheGame.serializeResult(match!);
    expect(score).toEqual(GameScore.Win);
    expect(guessTheGame.deserialize(serializedResult)).toEqual(sampleWin.trim());
  });

  for (const [name, input, expectedScore] of [
    ["sampleWin", sampleWin, GameScore.Win],
    ["sampleLoss", sampleLoss, GameScore.Loss],
  ] as Array<[string, string, GameScore]>) {
    it(`should serialize and deserialize ${name} correctly`, () => {
      const match = guessTheGame.resultRegex.exec(input);
      expect(match).not.toBeNull();
      const { score, serializedResult } = guessTheGame.serializeResult(match!);

      expect(score).toEqual(expectedScore);
      expect(guessTheGame.deserialize(serializedResult)).toEqual(input.trim());
    });
  }
});
