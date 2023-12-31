import { GameScore } from "../baseGame";
import { Nerdle } from "./nerdle";

const sampleEvenRowWin = `
nerdlegame 710 2/6

⬛🟪🟪⬛🟪⬛⬛🟩
🟩🟩🟩🟩🟩🟩🟩🟩
`;

const sampleOddRowWin = `
nerdlegame 711 3/6

⬛🟪⬛⬛🟪⬛⬛🟩
🟩⬛🟩🟪⬛⬛🟩🟩
🟩🟩🟩🟩🟩🟩🟩🟩
`;

// TODO add a sample loss and near-win? Seems like nerdle doesn't allow sharing without a win.

describe("Nerdle", () => {
  const nerdle = new Nerdle();

  for (const [name, input, expectedScore] of [
    ["sampleEvenRowWin", sampleEvenRowWin, GameScore.Win],
    ["sampleOddRowWin", sampleOddRowWin, GameScore.Win],
  ] as Array<[string, string, GameScore]>) {
    it(`should serialize and deserialize ${name} correctly`, () => {
      const match = nerdle.resultRegex.exec(input);
      expect(match).not.toBeNull();
      const { score, serializedResult } = nerdle.serializeResult(match!);

      expect(score).toEqual(expectedScore);
      expect(nerdle.deserialize(serializedResult)).toEqual(input.trim());
    });
  }
});
