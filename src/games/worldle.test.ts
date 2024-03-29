import { GameScore } from "../baseGame";
import { runGameTests } from "../util/testUtils";
import { Worldle } from "./worldle";

const sampleOddRowWin = `
#Worldle #700 5/6 (100%)
🟩🟩🟩🟨⬛↗️
🟩🟩🟩🟩⬛↗️
🟩🟩🟩🟩⬛⬆️
🟩🟩🟩🟩🟨↗️
🟩🟩🟩🟩🟩🎉
`;

const sampleEvenRowWin = `
#Worldle #701 2/6 (100%)
🟩🟩🟩🟩⬛⬇️
🟩🟩🟩🟩🟩🎉
`;

const sampleNearWin = `
#Worldle #701 X/6 (92%)
🟩🟩🟩🟩⬛↙️
🟩🟩🟩🟨⬛⬆️
🟩🟩🟩🟨⬛↘️
🟩🟩🟩🟩🟨↘️
🟩🟩🟩⬛⬛➡️
🟩🟩🟩🟨⬛⬅️
`;

const sampleLoss = `
#Worldle #123 X/6 (81%)
🟩⬛⬛⬛⬛↙️
🟩🟨⬛⬛⬛⬆️
🟩🟩🟩⬛⬛↘️
🟩🟨⬛⬛⬛↘️
🟩🟩🟩⬛⬛➡️
🟩🟩🟩⬛⬛⬅️
`;

const newFormatWin = `
#Worldle #798 (29.03.2024) 1/6 (100%)
🟩🟩🟩🟩🟩🎉
`;

const newFormatNearWin = `
#Worldle #798 (29.03.2024) X/6 (94%)
🟩🟩🟩🟩🟨⬆️
🟩🟩🟩🟩🟨⬆️
🟩🟩🟩🟩🟨↖️
🟩🟩🟩🟩🟨↖️
🟩🟩🟩🟩🟨↙️
🟩🟩🟩🟩⬛↙️
`;

describe("Worldle", () => {
  runGameTests(new Worldle(), [
    {
      name: "sampleEvenRowWin",
      input: sampleEvenRowWin,
      expectedScore: GameScore.Win,
    },
    {
      name: "sampleOddRowWin",
      input: sampleOddRowWin,
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
    {
      name: "newFormatWin",
      input: newFormatWin,
      expectedScore: GameScore.Win,
    },
    {
      name: "newFormatNearWin",
      input: newFormatNearWin,
      expectedScore: GameScore.NearWin,
    },
  ]);
});
