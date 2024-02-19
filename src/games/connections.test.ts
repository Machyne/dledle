import { GameScore } from "../baseGame";
import { runGameTests } from "../util/testUtils";
import { Connections } from "./connections";

const sampleLateWin = `
Connections
Puzzle #252
🟪🟨🟪🟩
🟨🟨🟨🟨
🟦🟩🟪🟦
🟦🟦🟦🟦
🟩🟪🟪🟩
🟩🟩🟩🟩
🟪🟪🟪🟪
`;

const sampleEarlyWin = `
Connections
Puzzle #252
🟨🟨🟨🟨
🟩🟩🟩🟩
🟦🟦🟦🟦
🟪🟪🟪🟪
`;

const sampleNearWin = `
Connections
Puzzle #252
🟨🟩🟪🟨
🟦🟦🟦🟦
🟨🟨🟩🟨
🟨🟨🟨🟨
🟩🟪🟩🟪
🟩🟩🟪🟩
`;

const sampleFakeNearWin = `
Connections
Puzzle #252
🟨🟩🟪🟨
🟦🟦🟦🟦
🟨🟨🟩🟨
🟨🟨🟨🟨
🟩🟪🟩🟪
🟩🟪🟪🟩
`;

const sampleLoss = `
Connections
Puzzle #252
🟨🟩🟪🟨
🟨🟩🟪🟦
🟩🟨🟪🟦
🟩🟨🟪🟦
`;

describe("Connections", () => {
  runGameTests(new Connections(), [
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
      name: "sampleNearWin",
      input: sampleNearWin,
      expectedScore: GameScore.NearWin,
    },
    {
      name: "sampleFakeNearWin",
      input: sampleFakeNearWin,
      expectedScore: GameScore.Loss,
    },
    {
      name: "sampleLoss",
      input: sampleLoss,
      expectedScore: GameScore.Loss,
    },
  ]);
});
