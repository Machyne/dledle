import { GameScore } from "../baseGame";
import { runGameTests } from "../util/testUtils";
import { Betweenle } from "./betweenle";

const sampleWins = [
  `
Betweenle 380 - 1/5:

🏆🔸️🔸️🔸️🔸️

⬆️⬇️⬇️⬇️⬇️🔹⬇️⬆️⬆️🔹⬇️⬇️⬆️🔹⬇️⬆️🔹🟩
`,
  `
Betweenle 389 - 5/5:

🏆🏆🏆🏆🏆

🟩⬜⬜⬜⬜ - ⬜⬜⬜ - ⬜⬜⬜ - ⬜⬜ - ⬜
`,
  `
Betweenle 389 - 4/5:

🏆🏆🏆🏆

⬇️⬇️⬇️⬇️⬇️ - ⬆️🟩⬜ - ⬜⬜⬜ - ⬜⬜ - ⬜
`,
  `
Betweenle 389 - 2/5:

🏆🏆

⬇️⬇️⬇️⬇️⬇️ - ⬆️⬆️⬇️ - ⬇️⬇️⬇️ - ⬆️🟩 - ⬜
`,
  `
Betweenle 391 - 3/5:

🏆🏆🏆

⬇️⬇️⬆️⬆️⬇️ - ⬆️⬇️⬆️ - ⬇️🟩⬜ - ⬜⬜ - ⬜
`,
  `
Betweenle 391 - 1/5:

🏆

⬇️⬇️⬇️⬇️⬇️ - ⬇️⬇️⬇️ - ⬇️⬇️⬇️ - ⬇️⬇️ - 🟩
`,
];

const sampleLoss = `
Betweenle 389 - 0/5:



⬇️⬇️⬇️⬇️⬇️ - ⬇️⬇️⬇️ - ⬇️⬇️⬇️ - ⬇️⬇️ - ⬇️
`;

describe("Betweenle", () => {
  runGameTests(new Betweenle(), [
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
  ]);
});
