import { GameScore } from "../baseGame";
import { Murdle } from "./murdle";

const sampleWin = `
Murdle for 12/24/2023

👤🔪🏡     🕰️
✅✅✅     1️⃣9️⃣:5️⃣4️⃣

⚖️
👤
`;

const sampleLoss = `
Murdle for 12/24/2023

👤🔪🏡     🕰️
✅❌❌     0️⃣:0️⃣8️⃣

⚖️
❌
`;

const sampleNearWin = `
Murdle for 12/24/2023

👤🔪🏡     🕰️
✅✅❌     0️⃣:1️⃣0️⃣

⚖️
❌
`;

describe("Murdle", () => {
  const murdle = new Murdle();

  it("can parse with extra link text", () => {
    const match = murdle.resultRegex.exec(
      "THE CASE OF THE RED DROP\n" + sampleWin + "\n\n\n\nhttps://murdle.com",
    );
    expect(match).not.toBeNull();
    const { score, serializedResult } = murdle.serializeResult(match!);
    expect(score).toEqual(GameScore.Win);
    expect(murdle.deserialize(serializedResult)).toEqual(sampleWin.trim());
  });

  for (const [name, input, expectedScore] of [
    ["sampleWin", sampleWin, GameScore.Win],
    ["sampleNearWin", sampleNearWin, GameScore.NearWin],
    ["sampleLoss", sampleLoss, GameScore.Loss],
  ] as Array<[string, string, GameScore]>) {
    it(`should serialize and deserialize ${name} correctly`, () => {
      const match = murdle.resultRegex.exec(input);
      expect(match).not.toBeNull();
      const { score, serializedResult } = murdle.serializeResult(match!);

      expect(score).toEqual(expectedScore);
      expect(murdle.deserialize(serializedResult)).toEqual(input.trim());
    });
  }
});
