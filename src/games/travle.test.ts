import { GameScore } from "../baseGame";
import { runGameTests } from "../util/testUtils";
import { Travle } from "./travle";

const sampleWins = [
  `
#travle #508 +0 (Perfect)
✅✅✅✅✅✅
`,
  `
#travle #508 +0
🟩✅🟩✅🟩✅
`,
  `
#travle #508 +5
✅🟧✅🟩✅🟧✅🟧🟧🟧✅
`,
  `
#travle #508 +0 (3 hints)
✅✅✅✅✅✅
`,
];

const sampleLosses = [
  `
#travle #508 (2 away)
🟥🟥🟧🟥🟥🟩✅✅🟧🟧🟩
`,
  `
#travle #508 (2 away) (1 hint)
🟩🟧🟧🟩✅🟧🟧🟩🟧🟧🟧
`,
];

const sampleNearWin = `
#travle #508 (1 away)
🟧🟩🟧🟩🟩✅✅🟧🟧🟧🟧
`;

describe("Travle", () => {
  runGameTests(new Travle(), [
    ...sampleWins.map((input, idx) => ({
      name: `sampleWin${idx}`,
      input,
      expectedScore: GameScore.Win,
    })),
    ...sampleLosses.map((input, idx) => ({
      name: `sampleLoss${idx}`,
      input,
      expectedScore: GameScore.Loss,
    })),
    {
      name: "sampleNearWin",
      input: sampleNearWin,
      expectedScore: GameScore.NearWin,
    },
  ]);
});
