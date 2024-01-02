import { GameScore } from "../baseGame";
import { runGameTests } from "../util/testUtils";
import { Swiftle } from "./swiftle";

const sampleLateWin = `
Swiftle #657 

🔊⬛🟥🟥🟥🟨🟩
`;

const sampleEarlyWin = `
Swiftle #657 

🔊🟥🟩⬜⬜⬜⬜
`;

const sampleLoss = `
Swiftle #657 

🔇⬛⬛🟥⬛⬛🟥
`;

const sampleNearWin = `
Swiftle #657 

🔇⬛⬛🟥🟥⬛🟨
`;

describe("Swiftle", () => {
  runGameTests(new Swiftle(), [
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
