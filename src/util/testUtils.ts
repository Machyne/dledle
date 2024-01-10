import { BaseGame, GameScore } from "../baseGame";

export type TestCases = {
  name: string;
  input: string;
  expectedScore: GameScore;
  expectedOutput?: string;
};

export function runGameTests(game: BaseGame, testCases: Array<TestCases>) {
  const winCase = testCases.find(({ expectedScore }) => expectedScore === GameScore.Win);
  if (winCase) {
    testCases.push({
      name: winCase.name + " with extra link text",
      input: "whatever text\n" + winCase.input + "\n" + game.link,
      expectedScore: GameScore.Win,
      expectedOutput: winCase.expectedOutput ?? winCase.input.trim(),
    });
    testCases.push({
      ...winCase,
      name: winCase.name + " trimmed",
      input: winCase.input.trim(),
    });
  }

  for (const { name, input, expectedScore, expectedOutput } of testCases) {
    it(`should serialize and deserialize ${name} correctly`, () => {
      const match = game.resultRegex.exec(input);
      expect(match).not.toBeNull();
      const { score, serializedResult } = game.serializeResult(match!);

      expect(score).toEqual(expectedScore);
      expect(game.deserialize(serializedResult)).toEqual(expectedOutput ?? input.trim());
    });
  }

  it("serialized data should match snapshot", () => {
    const data = Object.fromEntries(
      testCases.map(({ name, input }) => {
        const match = game.resultRegex.exec(input);
        expect(match).not.toBeNull();
        return [name, game.serializeResult(match!)];
      }),
    );
    expect(data).toMatchSnapshot();
  });
}
