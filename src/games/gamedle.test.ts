import { GameScore } from "../baseGame";
import { runGameTests } from "../util/testUtils";
import { Gamedle } from "./gamedle";

const sampleEarlyWin = `
🕹️ Gamedle: 27/01/2024 🟩⬜⬜⬜⬜⬜
`;

const sampleLateWin = `
🕹️ Gamedle: 27/01/2024 🟥🟥🟥🟥🟥🟩
`;

const sampleLoss = `
🕹️ Gamedle: 27/01/2024 🟥🟥🟥🟥🟥🟥
`;

describe("Gamedle", () => {
  runGameTests(new Gamedle(), [
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
      name: "sampleLoss",
      input: sampleLoss,
      expectedScore: GameScore.Loss,
    },
  ]);
});
