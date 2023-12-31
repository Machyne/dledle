import { GameScore } from "../baseGame";
import { Artle } from "./artle";

const sampleWin = `
Artle #601
🎨 🟥 🟩 ⬜ ⬜
`;

const sampleLoss = `
Artle #601
🎨 🟥 🟥 🟥 🟥
`;

describe("Artle", () => {
  const artle = new Artle();

  it("can parse with extra link text", () => {
    const match = artle.resultRegex.exec(sampleWin + "\nhttps://artle.wtf/");
    expect(match).not.toBeNull();
    const { score, serializedResult } = artle.serializeResult(match!);
    expect(score).toEqual(GameScore.Win);
    expect(artle.deserialize(serializedResult)).toEqual(sampleWin.trim());
  });

  for (const [name, input, expectedScore] of [
    ["sampleWin", sampleWin, GameScore.Win],
    ["sampleLoss", sampleLoss, GameScore.Loss],
  ] as Array<[string, string, GameScore]>) {
    it(`should serialize and deserialize ${name} correctly`, () => {
      const match = artle.resultRegex.exec(input);
      expect(match).not.toBeNull();
      const { score, serializedResult } = artle.serializeResult(match!);

      expect(score).toEqual(expectedScore);
      expect(artle.deserialize(serializedResult)).toEqual(input.trim());
    });
  }
});
