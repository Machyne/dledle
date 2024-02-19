import { GameScore } from "../baseGame";
import { runGameTests } from "../util/testUtils";
import { Travle } from "./travle";

const sampleWins = [
  `
#travle #432 (6/10)
✅✅🟧✅✅✅
`,
  `
#travle #409 (16/18)
🟧✅🟧✅✅🟧✅✅✅🟧✅🟧✅✅✅✅
`,
];

const sampleLoss = `
#travle #432 (?/10) (2 away)
🟧🟧🟧🟥🟧🟥🟧✅✅✅
`;

const sampleNearWin = `
#travle #432 (?/10) (1 away)
⬛✅🟥🟧🟥✅✅✅🟧🟧
`;

describe("Travle", () => {
  runGameTests(new Travle(), [
    ...sampleWins.map((input, idx) => ({
      name: `sampleWin${idx}`,
      input,
      expectedScore: GameScore.Win,
    })),
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
