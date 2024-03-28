---
sidebar_position: 0
---

# Quick Start

Build a multiplayer game for the [Rune platform](https://www.rune.ai) and its millions of players. Rune handles netcode, servers, voice chat, matchmaking, spectating, and much more.

To get started, you only need to run one command:

```sh
npx rune-games-cli@latest create
```
After this, you'll have a multiplayer Tic Tac Toe game running.

Alternatively, follow the [guide to port your existing game to Rune](./how-it-works/existing-game.md). 

## Uploading & Playing In The App {#playing-the-game-in-app}

Now that you have Tic Tac Toe running locally, it would be great to try playing it in the Rune app:

```sh
npm run upload
```
That's it. You'll now see your game inside Rune and can play it with your friends!

## Game Logic {#game-logic}

Rune games are split into two parts: logic & rendering. Let's look at the logic for the generated Tic Tac Toe game.

You can find the logic code in the `logic.js` file. The `setup` function is responsible for creating an initial `game` state that's synced across players:

```js
function setup() {
  const game = {
    cells: new Array(9).fill(null), // 3x3 cell grid
    lastMovePlayerId: null,
    // ... rest of the game state
  }
  return game
}
```

To modify the `game` state synced between players, we define actions that get called from the client code. Here's the action to mark a cell in Tic Tac Toe:

```js
function claimCell(cellIndex, { game, playerId }) {
  // Do not allow to claim cell if it's already claimed or if it is not player's turn
  if (game.cells[cellIndex] !== null || playerId === game.lastMovePlayerId) {
    throw Rune.invalidAction()
  }

  game.cells[cellIndex] = playerId
  game.lastMovePlayerId = playerId
  
  // ... rest of the logic, like checking for win condition
}
```

Finally, we provide setup function, actions, and other game info to `Rune.initLogic()`:

```js
Rune.initLogic({
  minPlayers: 2,
  maxPlayers: 2,
  setup,
  actions: {
    claimCell,
  },
})
```
Other `initLogic()` options are described in [API game logic reference](api-reference.md#game-logic). You can also read a more in-depth explanation of how the logic code works in [Syncing Game State](how-it-works/syncing-game-state.md).


## Rendering & Inputs {#rendering}

You can find your game rendering code in `client.js` file. The client code is responsible for reacting to `game` state changes and updating the rendering accordingly:

```js
function onChange({ game, players, yourPlayerId, action }) {
  const { cells, lastMovePlayerId } = game

  // ... update your game visuals according to latest received game state. Also play sound effects, update styles, etc.
}

Rune.initClient({ onChange })
```

The client code also calls actions based on user input:

```js
const button = // ... get the cell
button.addEventListener("click", () => Rune.actions.claimCell(cellIndex))
```

You can find additional information about [rendering here](how-it-works/syncing-game-state.md#rendering).

## What Next? {#next-steps}

- If you want some inspiration for your next game, we really recommend [checking out the example games](examples.mdx)!
- Building games is more fun when you're part of a community, join the [Rune Discord server](https://discord.gg/rune-devs).
- If your game is ready to be published for all Rune users, check out [publishing your game](publishing/publishing-your-game.md).
- Want to know everything that Rune supports? [Explore the API reference](api-reference.md).
