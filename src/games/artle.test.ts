import { GameScore } from "../baseGame";
import { runGameTests } from "../util/testUtils";
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
  runGameTests(new Artle(), [
    {
      name: "sampleWin",
      input: sampleWin,
      expectedScore: GameScore.Win,
    },
    {
      name: "sampleLoss",
      input: sampleLoss,
      expectedScore: GameScore.Loss,
    },
  ]);
});
