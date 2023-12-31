import { GameScore } from "../baseGame";
import { Listed } from "./listed";

const sampleWin = `
I got #Listed game 487 in 6 guesses:

⬆️⬆️⬇️↗️↗️🏡
`;

const sampleLoss = `
I was stumped by #Listed game 487:

⬆️⬆️⬆️⬆️⬆️⬆️⬇️⬆️❌
`;

const sampleNearWin = `
I was stumped by #Listed game 487:

⬆️⬆️⬆️⬆️⬆️⬆️↘️⬆️❌
`;

describe("Listed", () => {
  const listed = new Listed();

  it("can parse with extra link text", () => {
    const match = listed.resultRegex.exec(sampleWin + "\nhttps://listed.fun/usa/487");
    expect(match).not.toBeNull();
    const { score, serializedResult } = listed.serializeResult(match!);
    expect(score).toEqual(GameScore.Win);
    expect(listed.deserialize(serializedResult)).toEqual(sampleWin.trim());
  });

  for (const [name, input, expectedScore] of [
    ["sampleWin", sampleWin, GameScore.Win],
    ["sampleNearWin", sampleNearWin, GameScore.NearWin],
    ["sampleLoss", sampleLoss, GameScore.Loss],
  ] as Array<[string, string, GameScore]>) {
    it(`should serialize and deserialize ${name} correctly`, () => {
      const match = listed.resultRegex.exec(input);
      expect(match).not.toBeNull();
      const { score, serializedResult } = listed.serializeResult(match!);

      expect(score).toEqual(expectedScore);
      expect(listed.deserialize(serializedResult)).toEqual(input.trim());
    });
  }
});
