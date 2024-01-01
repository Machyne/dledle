import { GameScore } from "../baseGame";
import { runGameTests } from "../util/testUtils";
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
  runGameTests(new Framed(), [
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
