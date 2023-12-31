import { GameScore } from "../baseGame";
import { Wordle } from "./wordle";

const sampleEvenRowWin = `
Wordle 123 2/6

⬜🟩🟩🟩🟩
🟩🟩🟩🟩🟩
`;

const sampleOddRowWin = `
Wordle 123 3/6

⬜🟩🟩🟩🟩
⬜🟩🟩🟩🟩
🟩🟩🟩🟩🟩
`;

const sampleNearWin = `
Wordle 123 X/6*

🟨⬜🟩⬜⬜
⬜🟨🟩⬜⬜
⬜⬜🟩🟨⬜
⬜🟨🟩⬜🟩
⬜🟩🟩🟩🟩
⬜🟩🟩🟩🟩
`;

const sampleLoss = `
Wordle 123 X/6*

🟨⬛🟩⬛⬛
⬛🟨🟩⬛⬛
⬛⬛🟩🟩⬛
⬛🟩🟩🟩⬛
⬛🟩🟩🟩⬛
⬛🟩🟩🟩🟨
`;

describe("Wordle", () => {
  const wordle = new Wordle();

  for (const [name, input, expectedScore] of [
    ["sampleEvenRowWin", sampleEvenRowWin, GameScore.Win],
    ["sampleOddRowWin", sampleOddRowWin, GameScore.Win],
    ["sampleNearWin", sampleNearWin, GameScore.NearWin],
    ["sampleLoss", sampleLoss, GameScore.Loss],
  ] as Array<[string, string, GameScore]>) {
    it(`should serialize and deserialize ${name} correctly`, () => {
      const match = wordle.resultRegex.exec(input);
      expect(match).not.toBeNull();
      const { score, serializedResult } = wordle.serializeResult(match!);

      expect(score).toEqual(expectedScore);
      expect(wordle.deserialize(serializedResult)).toEqual(
        // The encoding ignores light / dark mode.
        input.trim().replace(/⬜/gu, "⬛"),
      );
    });
  }
});
