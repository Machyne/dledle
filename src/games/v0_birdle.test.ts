import { GameScore } from "../baseGame";
import { runGameTests } from "../util/testUtils";
import { V0Birdle } from "./v0_birdle";

const sampleEarlyWin = `
Birdle #700 1/6
🐦🐦🐦🐦
`;

const sampleLateWin = `
Birdle #700 6/6
❌❌❌❌
🐦❌❌❌
🐦❌❌❌
❌❌❌❌
❌❌❌❌
🐦🐦🐦🐦
`;

const sampleNearWin = `
Birdle #700 X/6
🐦🐦❌❌
🐦🐦❌❌
🐦❌❌❌
🐦🐦❌❌
🐦🐦🐦❌
🐦🐦❌❌
`;

const sampleLoss = `
Birdle #700 X/6
🐦🐦❌❌
🐦❌❌❌
🐦❌❌❌
❌❌❌❌
❌❌❌❌
❌❌❌❌
`;

describe("V0Birdle", () => {
  runGameTests(new V0Birdle(), [
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
