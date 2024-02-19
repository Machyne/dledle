import { gamesForGameNumber } from "./gameList";

xtest("gameList stats", () => {
  const pickedGames: Record<string, number> = {};
  const start = 60;
  const end = start + 100;
  for (let i = start; i < end; ++i) {
    const games = gamesForGameNumber(i);
    for (const game of games) {
      pickedGames[game.name] = (pickedGames[game.name] || 0) + 1;
    }
  }
  console.info(
    `\nDle picks from Dledle #${start} to #${end}:\n${Object.entries(pickedGames)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k.padEnd(15)} ${v}`)
      .join("\n")}`,
  );
});
