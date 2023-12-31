# [dledle.fun](https://dledle.fun/)

# Dledle

A daily game composed of daily games.

## How to report a bug

Open a [github issue](https://github.com/Machyne/dledle/issues)! Please include screenshots and the shared-text from any applicable 'dle games. Thank you! 😁

## Contributing

I'm happy to review and accept PRs! This section is left un-detailed because I am not optimistic about people sending me PRs 😅 If anyone takes the time to put the effort into improving this project, I will take the time to accept their contributions.

> [!IMPORTANT]
> If you want to add support for a new dle game, make sure it matches the criteria below.

### Setup

To run this game locally, clone the repo, install node dependencies, and then run the `serve` script:

```sh
$ npm install
$ npm run serve
```

## Suggesting a new game

1. Make sure the game is not already in Dledle. Find a full list [here](https://dledle.fun/?list=1).
2. Check to see if the game fits the criteria below.
3. Open a Github issue with a link to the game and example share text from a win and loss.

### Criteria for including games

* The game should add something new.
  * Ex: [Airportle](https://www.going.com/airportle) is great but doesn't add a new mechanic since we already have Wordle.
* The full share text has to be easily encoded into a short string so the Dledle share link doesn't take up the whole group chat.
  * Ex: [Cloudle](https://cloudle.app/) would be an excellent addition, but the share text uses hard-to-encode city names instead of game numbers.
* The game should be fun to play more than once, broadly appropriate, and not too long. Playing Dledle requires playing at least 3 games.
  * Ex: [Semantle](https://semantle.com/) is very challenging and takes a long time.
  * Ex: [Letterle](https://edjefferson.com/letterle/) is funny but doesn't have replayability.
