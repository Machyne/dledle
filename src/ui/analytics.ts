import { makeStats } from "./gameStats";
import { Store } from "./store";

const url = "https://stats.dledle.fun/stats";

type AnalyticsData = {
  userID: string;
  plays: number;
  wins: number;
};

export class Analytics {
  private static send(data: AnalyticsData, cb = () => {}) {
    console.info("Sending analytics", data);
    fetch(url, {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .catch((e) => {
        console.error(e);
      })
      .then((response) => {
        if (response?.ok) {
          console.info("Analytics sent");
          cb();
        }
      });
  }

  static sendForToday(currentGameNumber: number) {
    if (Store.hasSentAnalyticsFor(currentGameNumber)) {
      return;
    }
    const id = Store.getID();
    if (!id) {
      return;
    }

    const stats = makeStats(Object.values(Store.getCompletedGames()), currentGameNumber);
    Analytics.send(
      {
        userID: id,
        plays: stats.gamesPlayed,
        wins: stats.gamesWon,
      },
      () => {
        Store.setSentAnalyticsFor(currentGameNumber);
      },
    );
  }
}
