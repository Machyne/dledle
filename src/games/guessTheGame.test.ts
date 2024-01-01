import { GameScore } from "../baseGame";
import { runGameTests } from "../util/testUtils";
import { GuessTheGame } from "./guessTheGame";

const sampleWin = `
#GuessTheGame #596

🎮 🟥 🟩 ⬜ ⬜ ⬜ ⬜
`;

const sampleWinWithYellow = `
#GuessTheGame #597

🎮 🟨 🟩 ⬜ ⬜ ⬜ ⬜
`;

const sampleLoss = `
#GuessTheGame #595

🎮 🟥 🟥 🟥 🟥 🟥 🟥
`;

const sampleNearWin = `
#GuessTheGame #597

🎮 🟥 🟥 🟥 🟥 🟥 🟨
`;

const sampleAllYellow = `
#GuessTheGame #597

🎮 🟨 🟨 🟨 🟨 🟨 🟨
`;

describe("GuessTheGame", () => {
  runGameTests(new GuessTheGame(), [
    {
      name: "sampleWin",
      input: sampleWin,
      expectedScore: GameScore.Win,
    },
    {
      name: "sampleWinWithYellow",
      input: sampleWinWithYellow,
      expectedScore: GameScore.Win,
    },
    {
      name: "sampleLoss",
      input: sampleLoss,
      expectedScore: GameScore.Loss,
    },
    {
      name: "sampleNearWin",
      input: sampleNearWin,
      expectedScore: GameScore.NearWin,
    },
    {
      name: "sampleAllYellow",
      input: sampleAllYellow,
      expectedScore: GameScore.NearWin,
    },
  ]);
});
