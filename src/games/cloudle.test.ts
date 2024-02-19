import { GameScore } from "../baseGame";
import { runGameTests } from "../util/testUtils";
import { Cloudle } from "./cloudle";

const sampleLateWin = `
Cloudle 6/6

⚫⚫⚫⚫⚫
🟢⚫⚫🟢🟢
⚫⚫⚫⚫⚫
⚫⚫⚫⚫⚫
⚫⚫⚫⚫⚫
🟢🟢🟢🟢🟢
`;

const sampleEarlyWin = `
Cloudle 1/6

🟢🟢🟢🟢🟢
`;

const sampleNearWins = [
  `
Cloudle X/6

🟡🟡🟢🟢🟢
⚫⚫⚫⚫⚫
⚫⚫⚫⚫⚫
⚫⚫⚫⚫⚫
⚫⚫⚫⚫⚫
🟡⚫🟢⚫⚫
`,
  `
Cloudle X/6

⚫⚫⚫⚫⚫
⚫⚫⚫⚫⚫
⚫🟢🟢🟢🟢
⚫⚫⚫⚫⚫
⚫⚫⚫⚫⚫
🟡⚫🟢⚫⚫
`,
];

const sampleLoss = `
Cloudle X/6

⚫⚫⚫⚫⚫
⚫⚫⚫⚫⚫
⚫⚫⚫⚫⚫
⚫⚫🟢🟢🟡
⚫🟡🟢🟢🟢
🟡⚫⚫⚫⚫
`;

const sampleFullText = [
  `
Cloudle - Libreville, Gabon: 5/6

⚫⚫⚫⚫⚫
⚫⚫⚫⚫🟡
🟡🟢🟡⚫⚫
🟢🟢🟢⚫🟢
🟢🟢🟢🟢🟢


https://cloudle.app/
`,
  `
Cloudle 5/6

⚫⚫⚫⚫⚫
⚫⚫⚫⚫🟡
🟡🟢🟡⚫⚫
🟢🟢🟢⚫🟢
🟢🟢🟢🟢🟢
`.trim(),
];

describe("Cloudle", () => {
  runGameTests(new Cloudle(), [
    {
      name: "sampleLateWin",
      input: sampleLateWin,
      expectedScore: GameScore.Win,
    },
    {
      name: "sampleEarlyWin",
      input: sampleEarlyWin,
      expectedScore: GameScore.Win,
    },
    {
      name: "sampleFullText",
      input: sampleFullText[0],
      expectedOutput: sampleFullText[1],
      expectedScore: GameScore.Win,
    },
    ...sampleNearWins.map((input, idx) => ({
      name: `sampleNearWin${idx}`,
      input,
      expectedScore: GameScore.NearWin,
    })),
    {
      name: "sampleLoss",
      input: sampleLoss,
      expectedScore: GameScore.Loss,
    },
  ]);
});
