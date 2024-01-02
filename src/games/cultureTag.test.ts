import { GameScore } from "../baseGame";
import { runGameTests } from "../util/testUtils";
import { CultureTag } from "./cultureTag";

const sampleWin = `
Daily CultureTag #665
#️⃣🟡🟢⚪
`;

const sampleLoss = `
Daily CultureTag #659
#️⃣🔴🔴🔴
`;

const sampleNearWin = `
Daily CultureTag #659
#️⃣🔴🔴🟡
`;

const sampleMaxCode = `
Daily CultureTag #659
#️⃣🟡🟡🟡
`;

describe("CultureTag", () => {
  runGameTests(new CultureTag(), [
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
    {
      name: "sampleMaxCode",
      input: sampleMaxCode,
      expectedScore: GameScore.NearWin,
    },
  ]);
});
