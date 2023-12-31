import { GameScore } from "../baseGame";
import { Framed } from "./framed";

const sampleWin = `
Framed #659
🎥 🟥 🟥 🟩 ⬛ ⬛ ⬛
`;

const sampleLoss = `
Framed #659
🎥 🟥 🟥 🟥 🟥 🟥 🟥
`;

describe("Framed", () => {
  const framed = new Framed();

  it("can parse with extra link text", () => {
    const match = framed.resultRegex.exec(sampleWin + "\nhttps://framed.wtf/");
    expect(match).not.toBeNull();
    const { score, serializedResult } = framed.serializeResult(match!);
    expect(score).toEqual(GameScore.Win);
    expect(framed.deserialize(serializedResult)).toEqual(sampleWin.trim());
  });

  for (const [name, input, expectedScore] of [
    ["sampleWin", sampleWin, GameScore.Win],
    ["sampleLoss", sampleLoss, GameScore.Loss],
  ] as Array<[string, string, GameScore]>) {
    it(`should serialize and deserialize ${name} correctly`, () => {
      const match = framed.resultRegex.exec(input);
      expect(match).not.toBeNull();
      const { score, serializedResult } = framed.serializeResult(match!);

      expect(score).toEqual(expectedScore);
      expect(framed.deserialize(serializedResult)).toEqual(input.trim());
    });
  }
});
