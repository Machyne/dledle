import { GameScore } from "../baseGame";
import { runGameTests } from "../util/testUtils";
import { Factle } from "./factle";

const sampleEvenRowWin = `
Factle.app #2 2/5
⬛⬛🐱⬛🐱
🐸🐸🐸🐸🐸
`;

const sampleLateWin = `
Factle.app #2 5/5
⬛⬛🐱⬛🐱
⬛⬛⬛⬛⬛
🐱⬛🐱⬛⬛
⬛🐸⬛⬛⬛
🐸🐸🐸🐸🐸
`;

const sampleEarlyWin = `
Factle.app #2 1/5
🐸🐸🐸🐸🐸
`;

const sampleNearWin = `
Factle.app #2 5/5
⬛⬛🐱🐱⬛
⬛🐱🐱🐱⬛
🐱⬛⬛⬛⬛
🐱🐱🐱🐱🐱
🐱🐱🐱🐱🐱
`;

const sampleNearWinLastRowWrong = `
Factle.app #2 5/5
⬛⬛🐱🐱⬛
⬛🐱🐱🐱⬛
🐱🐱🐱🐱⬛
🐸🐸🐸🐸⬛
🐱⬛⬛⬛⬛
`;

const sampleLoss = `
Factle.app #2 5/5
⬛⬛🐸⬛⬛
⬛🐸⬛⬛🐱
⬛⬛🐱⬛🐸
⬛⬛⬛⬛⬛
⬛⬛⬛🐸🐱
`;

const sampleFullText = [
  `
Factle.app #2 5/5
HIGHEST PAYING OCCUPATIONS IN AMERICA (2021)
⬛⬛🐱⬛🐱
⬛⬛⬛⬛⬛
🐱⬛🐱⬛⬛
⬛🐸⬛⬛⬛
🐸🐸🐸🐸🐸
Top 25.2%
`,
  `
Factle.app #2 5/5
⬛⬛🐱⬛🐱
⬛⬛⬛⬛⬛
🐱⬛🐱⬛⬛
⬛🐸⬛⬛⬛
🐸🐸🐸🐸🐸
`.trim(),
];

describe("Factle", () => {
  runGameTests(new Factle(), [
    {
      name: "sampleEvenRowWin",
      input: sampleEvenRowWin,
      expectedScore: GameScore.Win,
    },
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
    {
      name: "sampleNearWin",
      input: sampleNearWin,
      expectedScore: GameScore.NearWin,
    },
    {
      name: "sampleNearWinLastRowWrong",
      input: sampleNearWinLastRowWrong,
      expectedScore: GameScore.NearWin,
    },
    {
      name: "sampleLoss",
      input: sampleLoss,
      expectedScore: GameScore.Loss,
    },
  ]);
});
