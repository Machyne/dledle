import { GameScore } from "../baseGame";
import { Worldle } from "./worldle";

const sampleOddRowWin = `
#Worldle #700 5/6 (100%)
🟩🟩🟩🟨⬛↗️
🟩🟩🟩🟩⬛↗️
🟩🟩🟩🟩⬛⬆️
🟩🟩🟩🟩🟨↗️
🟩🟩🟩🟩🟩🎉
`;

const sampleEvenRowWin = `
#Worldle #701 2/6 (100%)
🟩🟩🟩🟩⬛⬇️
🟩🟩🟩🟩🟩🎉
`;

const sampleNearWin = `
#Worldle #701 X/6 (92%)
🟩🟩🟩🟩⬛↙️
🟩🟩🟩🟨⬛⬆️
🟩🟩🟩🟨⬛↘️
🟩🟩🟩🟩🟨↘️
🟩🟩🟩⬛⬛➡️
🟩🟩🟩🟨⬛⬅️
`;

const sampleLoss = `
#Worldle #123 X/6 (81%)
🟩⬛⬛⬛⬛↙️
🟩🟨⬛⬛⬛⬆️
🟩🟩🟩⬛⬛↘️
🟩🟨⬛⬛⬛↘️
🟩🟩🟩⬛⬛➡️
🟩🟩🟩⬛⬛⬅️
`;

describe("Worldle", () => {
  const wordle = new Worldle();

  it("can parse with extra link text", () => {
    const match = wordle.resultRegex.exec(sampleOddRowWin + "\nhttps://worldle.teuteuf.fr");
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
