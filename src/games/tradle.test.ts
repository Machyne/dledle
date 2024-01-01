import { GameScore } from "../baseGame";
import { runGameTests } from "../util/testUtils";
import { Tradle } from "./tradle";

const sampleOddRowWin = `
#Tradle #663 5/6
🟩🟩🟩🟩⬜
🟩🟩🟩🟩⬜
🟩🟩🟩⬜⬜
🟩🟩🟩🟩🟨
🟩🟩🟩🟩🟩
`;

const sampleEvenRowWin = `
#Tradle #663 2/6
🟩🟩🟩⬜⬜
🟩🟩🟩🟩🟩
`;

const sampleNearWin = `
#Tradle #663 X/6
🟩🟩🟩⬜⬜
🟩🟩🟩🟨⬜
🟩🟩🟩🟩🟨
🟩🟩🟩🟩🟨
🟩🟩🟩🟩⬜
🟩🟩🟩🟩🟨
`;

const sampleLoss = `
#Tradle #663 X/6
🟩🟩🟩⬜⬜
🟩🟩🟩⬜⬜
🟩🟩🟨⬜⬜
🟩🟩🟩⬜⬜
🟩🟩🟩🟨⬜
🟩🟩🟩⬜⬜
`;

describe("Tradle", () => {
  runGameTests(new Tradle(), [
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
  ]);
});
