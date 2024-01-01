import { GameScore } from "../baseGame";
import { runGameTests } from "../util/testUtils";
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
  runGameTests(new Nerdle(), [
    {
      name: "sampleEvenRowWin",
      input: sampleEvenRowWin,
      expectedScore: GameScore.Win,
    },
    {
      name: "sampleOddRowWin",
      input: sampleOddRowWin,
      expectedScore: GameScore.Win,
    },
  ]);
});
