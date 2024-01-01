import { GameScore } from "../baseGame";
import { runGameTests } from "../util/testUtils";
import { Murdle } from "./murdle";

const sampleWin = `
Murdle for 12/24/2023

👤🔪🏡     🕰️
✅✅✅     1️⃣9️⃣:5️⃣4️⃣

⚖️
👤
`;

const sampleLoss = `
Murdle for 12/24/2023

👤🔪🏡     🕰️
✅❌❌     0️⃣:0️⃣8️⃣

⚖️
❌
`;

const sampleNearWin = `
Murdle for 12/24/2023

👤🔪🏡     🕰️
✅✅❌     0️⃣:1️⃣0️⃣

⚖️
❌
`;

describe("Murdle", () => {
  runGameTests(new Murdle(), [
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
