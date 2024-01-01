import { GameScore } from "../baseGame";
import { runGameTests } from "../util/testUtils";
import { GuessTheGame } from "./guessTheGame";

const sampleWin = `
#GuessTheGame #596

🎮 🟥 🟩 ⬜ ⬜ ⬜ ⬜
`;

const sampleLoss = `
#GuessTheGame #595

🎮 🟥 🟥 🟥 🟥 🟥 🟥
`;

describe("GuessTheGame", () => {
  runGameTests(new GuessTheGame(), [
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
