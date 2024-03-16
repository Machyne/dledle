import { GameScore } from "../baseGame";
import { runGameTests } from "../util/testUtils";
import { Wordle } from "./wordle";

const sampleEvenRowWin = `
Wordle 123 2/6

⬜🟩🟩🟩🟩
🟩🟩🟩🟩🟩
`;

const sampleOddRowWin = `
Wordle 123 3/6

⬜🟩🟩🟩🟩
⬜🟩🟩🟩🟩
🟩🟩🟩🟩🟩
`;

const sampleNearWin = `
Wordle 123 X/6*

🟨⬜🟩⬜⬜
⬜🟨🟩⬜⬜
⬜⬜🟩🟨⬜
⬜🟨🟩⬜🟩
⬜🟩🟩🟩🟩
⬜🟩🟩🟩🟩
`;

const sampleLoss = `
Wordle 123 X/6*

🟨⬛🟩⬛⬛
⬛🟨🟩⬛⬛
⬛⬛🟩🟩⬛
⬛🟩🟩🟩⬛
⬛🟩🟩🟩⬛
⬛🟩🟩🟩🟨
`;

const sampleWithWithoutComma = [
  `
Wordle 1,001 3/6*

⬛⬛⬛🟩🟨
🟩🟩🟩🟩⬛
🟩🟩🟩🟩🟩
`,
  `
Wordle 1001 3/6*

⬛⬛⬛🟩🟨
🟩🟩🟩🟩⬛
🟩🟩🟩🟩🟩
`,
];

describe("Wordle", () => {
  runGameTests(new Wordle(), [
    {
      name: "sampleEvenRowWin",
      input: sampleEvenRowWin,
      expectedScore: GameScore.Win,
      expectedOutput: sampleEvenRowWin.trim().replace(/⬜/gu, "⬛"),
    },
    {
      name: "sampleOddRowWin",
      input: sampleOddRowWin,
      expectedScore: GameScore.Win,
      expectedOutput: sampleOddRowWin.trim().replace(/⬜/gu, "⬛"),
    },
    {
      name: "sampleNearWin",
      input: sampleNearWin,
      expectedScore: GameScore.NearWin,
      expectedOutput: sampleNearWin.trim().replace(/⬜/gu, "⬛"),
    },
    {
      name: "sampleLoss",
      input: sampleLoss,
      expectedScore: GameScore.Loss,
    },
    {
      name: "sampleWithComma",
      input: sampleWithWithoutComma[0],
      expectedScore: GameScore.Win,
    },
    {
      name: "sampleWithoutComma",
      input: sampleWithWithoutComma[1],
      expectedScore: GameScore.Win,
      expectedOutput: sampleWithWithoutComma[0].trim(),
    },
  ]);
});
