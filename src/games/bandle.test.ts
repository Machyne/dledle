import { GameScore } from "../baseGame";
import { runGameTests } from "../util/testUtils";
import { Bandle } from "./bandle";

const sampleLateWin = `
Bandle #528 6/6
🟥⬛⬛🟨🟥🟩
`;

const sampleEarlyWin = `
Bandle #528 1/6
🟩⬜⬜⬜⬜⬜
`;

const sampleSkipWin = `
Bandle #528 4/6
🟥⬛🟨🟩⬜⬜
`;

const sampleLoss = `
Bandle #528 x/6
🟥🟥🟥🟥🟥🟥
`;

const sampleSkipLoss = `
Bandle #528 x/6
🟥⬛⬛⬛⬛⬛
`;

const sampleNearWin = `
Bandle #528 x/6
⬛⬛⬛🟨⬛🟥
`;

describe("Bandle", () => {
  runGameTests(new Bandle(), [
    {
      name: "sampleEarlyWin",
      input: sampleEarlyWin,
      expectedScore: GameScore.Win,
    },
    {
      name: "sampleLateWin",
      input: sampleLateWin,
      expectedScore: GameScore.Win,
    },
    {
      name: "sampleSkipWin",
      input: sampleSkipWin,
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
    {
      name: "sampleSkipLoss",
      input: sampleSkipLoss,
      expectedScore: GameScore.Loss,
    },
  ]);
});
