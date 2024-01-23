import { GameScore } from "../baseGame";
import { runGameTests } from "../util/testUtils";
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

const sampleShortWin = `
Costcodle #125 1/6
✅
`;

const sampleLongWin = `
Costcodle #125 6/6
⬆️🟥
⬆️🟥
⬆️🟥
⬆️🟥
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
  runGameTests(new Costcodle(), [
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
    {
      name: "sampleShortWin",
      input: sampleShortWin,
      expectedScore: GameScore.Win,
    },
    {
      name: "sampleLongWin",
      input: sampleLongWin,
      expectedScore: GameScore.Win,
    },
    {
      name: "sampleNearWin",
      input: sampleNearWin,
      expectedScore: GameScore.NearWin,
    },
    {
      name: "sampleLoss",
      input: sampleLoss,
      expectedScore: GameScore.Loss,
    },
  ]);
});
