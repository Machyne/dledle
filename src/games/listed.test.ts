import { GameScore } from "../baseGame";
import { runGameTests } from "../util/testUtils";
import { Listed } from "./listed";

const sampleWin = `
I got #Listed game 487 in 6 guesses:

⬆️⬆️⬇️↗️↗️🏡
`;

const sampleLoss = `
I was stumped by #Listed game 487:

⬆️⬆️⬆️⬆️⬆️⬆️⬇️⬆️❌
`;

const sampleNearWin = `
I was stumped by #Listed game 487:

⬆️⬆️⬆️⬆️⬆️⬆️↘️⬆️❌
`;

describe("Listed", () => {
  runGameTests(new Listed(), [
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
    {
      name: "sampleNearWin",
      input: sampleNearWin,
      expectedScore: GameScore.NearWin,
    },
  ]);
});
