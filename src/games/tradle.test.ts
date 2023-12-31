import { GameScore } from "../baseGame";
import { Tradle } from "./tradle";

const sampleOddRowWin = `
#Tradle #663 5/6
🟩🟩🟩🟩⬜
🟩🟩🟩🟩⬜
🟩🟩🟩⬜⬜
🟩🟩🟩🟩🟨
🟩🟩🟩🟩🟩
`;

const sampleEvenRowWin = `
#Tradle #663 2/6
🟩🟩🟩⬜⬜
🟩🟩🟩🟩🟩
`;

const sampleNearWin = `
#Tradle #663 X/6
🟩🟩🟩⬜⬜
🟩🟩🟩🟨⬜
🟩🟩🟩🟩🟨
🟩🟩🟩🟩🟨
🟩🟩🟩🟩⬜
🟩🟩🟩🟩🟨
`;

const sampleLoss = `
#Tradle #663 X/6
🟩🟩🟩⬜⬜
🟩🟩🟩⬜⬜
🟩🟩🟨⬜⬜
🟩🟩🟩⬜⬜
🟩🟩🟩🟨⬜
🟩🟩🟩⬜⬜
`;

describe("Tradle", () => {
  const tradle = new Tradle();

  it("can parse with extra link text", () => {
    const match = tradle.resultRegex.exec(sampleOddRowWin + "\nhttps://oec.world/en/tradle");
    expect(match).not.toBeNull();
    const { score, serializedResult } = tradle.serializeResult(match!);
    expect(score).toEqual(GameScore.Win);
    expect(tradle.deserialize(serializedResult)).toEqual(sampleOddRowWin.trim());
  });

  for (const [name, input, expectedScore] of [
    ["sampleEvenRowWin", sampleEvenRowWin, GameScore.Win],
    ["sampleOddRowWin", sampleOddRowWin, GameScore.Win],
    ["sampleNearWin", sampleNearWin, GameScore.NearWin],
    ["sampleLoss", sampleLoss, GameScore.Loss],
  ] as Array<[string, string, GameScore]>) {
    it(`should serialize and deserialize ${name} correctly`, () => {
      const match = tradle.resultRegex.exec(input);
      expect(match).not.toBeNull();
      const { score, serializedResult } = tradle.serializeResult(match!);

      expect(score).toEqual(expectedScore);
      expect(tradle.deserialize(serializedResult)).toEqual(input.trim());
    });
  }
});
