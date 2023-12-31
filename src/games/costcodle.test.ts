import { GameScore } from "../baseGame";
import { Costcodle } from "./costcodle";

const sampleOddRowWin = `
Costcodle #95 3/6
⬆️🟥
⬇️🟨
✅
`;

const sampleEvenRowWin = `
Costcodle #95 2/6
⬆️🟥
✅
`;

const sampleNearWin = `
Costcodle #95 X/6
⬆️🟥
⬇️🟥
⬆️🟥
⬇️🟥
⬆️🟨
⬇️🟨
`;

const sampleLoss = `
Costcodle #95 X/6
⬇️🟥
⬇️🟥
⬇️🟥
⬆️🟥
⬆️🟥
⬆️🟥
`;

describe("Costcodle", () => {
  const wordle = new Costcodle();

  it("can parse with extra link text", () => {
    const match = wordle.resultRegex.exec(sampleOddRowWin + "\nhttps://costcodle.com");
    expect(match).not.toBeNull();
    const { score, serializedResult } = wordle.serializeResult(match!);
    expect(score).toEqual(GameScore.Win);
    expect(wordle.deserialize(serializedResult)).toEqual(sampleOddRowWin.trim());
  });

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
      expect(wordle.deserialize(serializedResult)).toEqual(input.trim());
    });
  }
});
