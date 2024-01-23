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

const sampleLongWin = `
Murdle for 1/2/2024

👤🔪🏡❓     🕰️
✅✅✅✅     0️⃣:1️⃣2️⃣

⚖️
👤
`;

const sampleStreakWin = `
Murdle for 1/23/2024

👤🔪🏡❓     🕰️
✅✅✅✅     1️⃣0️⃣:5️⃣0️⃣

⚖️
🧛‍♂️👤
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

const sampleLongNearWin = `
Murdle for 1/2/2024

👤🔪🏡❓     🕰️
✅✅❌✅     0️⃣:1️⃣1️⃣

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
      name: "sampleLongWin",
      input: sampleLongWin,
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
      name: "sampleLongNearWin",
      input: sampleLongNearWin,
      expectedScore: GameScore.NearWin,
    },
    {
      name: "sampleStreakWin",
      input: sampleStreakWin,
      expectedScore: GameScore.Win,
      expectedOutput: sampleStreakWin.trim().replace("🧛‍♂️", ""),
    },
  ]);
});
