import { GameScore } from "../baseGame";
import { runGameTests } from "../util/testUtils";
import { Birdle } from "./birdle";

const sampleEarlyWin = `
World Birdle
2024-04-08
🐦🐦🐦🐦
`;

const sampleLateWin = `
World Birdle
2024-04-08
🐦🐦❌❌
🐦🐦❌❌
🐦🐦❌❌
🐦🐦❌❌
🐦🐦🐦❌*
🐦🐦🐦🐦*
`;

const sampleNearWin = `
World Birdle
2024-04-08
🐦🐦❌❌
🐦🐦❌❌
🐦🐦🐦❌
🐦🐦❌❌
🐦🐦❌❌
🐦🐦❌❌*
`;

const sampleLoss = `
World Birdle
2024-04-08
❌❌❌❌
❌❌❌❌
❌❌❌❌
🐦🐦❌❌*
🐦🐦❌❌*
🐦🐦❌❌*
`;

describe("Birdle", () => {
  runGameTests(new Birdle(), [
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
