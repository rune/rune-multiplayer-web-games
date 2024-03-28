---
sidebar_position: 99
---

# API Reference

Rune methods for writing multiplayer games. The SDK is split into two parts:

- **Game logic**, this code needs to be located in a file called `logic.js`
- **UI integration**, that can live anywhere, but the docs will refer to `client.js`

## Game logic {#game-logic}

### `Rune.initLogic(options)` {#runeinitlogicoptions}

The `initLogic` function should be called directly at the top level of your `logic.js` file. This should contain all logic required to control your game state and handle player life cycle events. All options except `events` are required. Example:

```js
// logic.js
Rune.initLogic({
  minPlayers: 1,
  maxPlayers: 4,
  setup: (allPlayerIds) => {
    const scores = {}
    for (let playerId of allPlayerIds) {
      scores[playerId] = 0
    }
    return { scores, currentPlayerIndex: 0, currentPlayerStartedAt: 0 }
  },
  actions: {
    myAction: (payload, { game, playerId, allPlayerIds }) => {
      // Check it's not the other player's turn
      if (game.currentPlayer !== allPlayerIds[game.currentPlayerIndex]) {
        throw Rune.invalidAction()
      }

      // Increase score and switch turn
      game.scores[playerId]++
      //Switch turn
      game.currentPlayerIndex = (game.currentPlayerIndex + 1) % allPlayerIds.length;
      game.currentPlayerStartedAt = Rune.gameTimeInSeconds();
      // Determine if game has ended
      if (isVictoryOrDraw(game)) {
        Rune.gameOver()
      }
    },
  },
  events: {
    playerJoined: (playerId, { game }) => {
      game.scores[playerId] = 0
    },
    playerLeft: (playerId, { game }) => {
      delete game.scores[playerId]
    },
  },
  update: ({ game, allPlayerIds }) => {
    //If 30 seconds have passed since last player scored, switch player
    if (Rune.gameTimeInSeconds() - game.lastPlayerScoredAt > 30) {
      game.currentPlayerIndex = (game.currentPlayerIndex + 1) % allPlayerIds.length;
      game.currentPlayerStartedAt = Rune.gameTimeInSeconds();
    }
  },
  updatesPerSecond: 10,
  inputDelay: 30,
})
```

#### `minPlayers: number` {#minplayers-number}

A value between 1-4 of the minmum amount of players that is required to play the game. See [Joining and Leaving](advanced/joining-leaving.md#minimum-and-maximum-players).

#### `maxPlayers: number` {#maxplayers-number}

A value between 1-4, must be equal to or greater than `minPlayers`. If the value is lower than 4, other users may join the game as spectators. See [Joining and Leaving](advanced/joining-leaving.md#minimum-and-maximum-players).

#### `setup(allPlayerIds: string[]): any` {#setupallplayerids-string-any}

The `setup` function returns the initial values for the game state, which is the game information that’s synced across players. The function gets the `allPlayerIds` argument which is an array of the player IDs at the time of starting the game and must return the initial game state.

#### `actions: { [string]: (payload, { game: object, playerId: string, allPlayerIds: string[] }) => void}` {#actions--string-payload--game-object-playerid-string-allplayerids-string---void}

The `actions` option is an object with actions functions exposed to the UI integration layer, called with [`Rune.actions.myAction(payload)`](#runeactionspayload). The functions are responsible for [validating the action](#runeinvalidaction), mutating the `game` state and [end the game](#runegameover) when appropriate.

#### `events: { playerJoined? | playerLeft?: (playerId: string, { game: any, allPlayerIds: string[] }) => void }` _optional_ {#events--playerjoined--playerleft-playerid-string--game-any-allplayerids-string---void}

By default a game will end if a player leaves (see [Joining and Leaving](advanced/joining-leaving.md#minimum-and-maximum-players)), but by defining the `playerJoined`/`playerLeft` events you can [Support Players Joining Midgame](advanced/joining-leaving.md#supporting-players-joining-midgame).

#### `update({game: object,  allPlayerIds: string[]}) => void` _optional_ {#updategame-object--allplayerids-string--void}

Function that is executed every second. See [Using Time in your Game](advanced/real-time-games.md#update-function).

#### `updatesPerSecond?: number` {#updatespersecond-number}

How many times `update` function should be executed per second. Allowed values 1-30. Default 1. See  [Real-Time Games](advanced/real-time-games.md).

#### `inputDelay?: number` {#inputdelay-number}

How many milliseconds user action is delayed before run locally. Allowed values 0-250. Default value 25. Higher values will mean that players are more in sync with each other (i.e. fewer rollbacks), but will feel less snappy locally as it takes longer for a player's actions to be reflected on their screen.

### `Rune.invalidAction()` {#runeinvalidaction}

Whenever a player tries to do an action that is not allowed, the action handler should reject it by calling `throw Rune.invalidAction()` which will cancel the action and roll back any local optimistic updates.

This is completely safe to do and can be used throughout your game. For instance, it is used in the [Tic Tac Toe example](https://github.com/rune/rune/blob/staging/examples/tic-tac-toe/logic.js) to ensure that players only can make a move when it is their turn.

```js
// logic.js
Rune.initLogic({
  actions: {
    myAction: (payload, { game, playerId }) => {
      if (!isValidAction(payload)) {
        throw Rune.invalidAction()
      }
    },
  },
})
```

### `Rune.gameOver(options)` {#runegameoveroptions}

When the game has ended, the action handler should call `Rune.gameOver`. Your game doesn't need to show a "game over" screen. Rune overlays a standardized game over popup to the user. See more in the [Game Over](how-it-works/game-over.md) guide.

```js
// logic.js
Rune.initLogic({
  actions: {
    myAction: (payload, { game }) => {
      if (isGameOver(game)) {
        const winner = getWinner(game)
        const loser = getLoser(game)

        Rune.gameOver({
          players: {
            [winner.playerId]: "WON",
            [loser.playerId]: "LOST",
          },
          delayPopUp: true,
        })
      }
    },
  },
})
```

#### `players: Record<string, "WON" | "LOST" | number>` {#players-recordstring-won--lost--number}

`players` is an object with player IDs as keys and the game result as values. The game result for each player can be either `WON`/`LOST` or an integer score (higher is better) score. Mixing `WON`/`LOST` and scores at the same time is not allowed. All players present in the game at the moment the game ends must be mentioned in the `players` object.

#### `delayPopUp?: boolean` {#delaypopup-boolean}

Optional. Set to `true` if you want to instruct Rune to delay showing of the game over popup until you call `Rune.showGameOverPopUp()`.

### `Rune.gameTime()` {#runegametime}

Returns the amount of milliseconds that have passed since the start of the game. See [Using Time in your Game](advanced/real-time-games.md#game-time).

## Client {#client}

### `Rune.initClient(options)` {#runeinitclientoptions}

The `initClient` function should be called after your game is fully ready, but should not start the actual gameplay until `onChange` is called.

```js
// client.js
Rune.initClient({
  onChange: ({
    game,
    previousGame,
    futureGame,
    yourPlayerId,
    players,
    allPlayerIds,
    action,
    event,
    rollbacks,
  }) => {
    render(game)
  },
})
```

#### `onChange: () => void` {#onchange---void}

##### `game: object` {#game-object}

This argument is the current game state. Your `onChange()` function should update the UI to reflect its values.

##### `previousGame: object` {#previousgame-object}

This argument is the previous game state. Usually this can be ignored, but it's useful if your game needs to detect changes of certain values.

##### `futureGame?: object` {#futuregame-object}

This argument is the predicted future game state. This value is only available if game uses `update` function. Used only in cases, where the game wants to do interpolation. See [Reducing Stutter](advanced/reducing-stutter.md).

##### `yourPlayerId?: string` {#yourplayerid-string}

Your player id, if the current user is a spectator this argument is undefined.

##### `players: Record<string, { playerId: string, displayName: string, avatarUrl: string }>` {#players-recordstring--playerid-string-displayname-string-avatarurl-string-}

*Deprecated:* Use [allPlayerIds](#all-player-ids) and [Rune.getPlayerInfo](#rune-get-player-info)

The `players` argument is an object of the current players, useful to display their names and avatars in the game.

##### `allPlayerIds?: string[]` {#all-player-ids}

The player IDs of all current players in the game.

##### `action?: { name: string, playerId: string, params: any }` {#action--name-string-playerid-string-params-any-}

If the update was triggered from a `Rune.actions.*` call, this argument will contain info about it, such as the payload and who initiated. Usually this should be ignored and rely on `game` instead.

##### `event?: { name: string, params: any }` {#event--name-string-params-any-}

Possible events: `playerJoined`, `playerLeft`, `stateSync`, `update`, `timeSync`.

### `Rune.actions.*(payload)` {#runeactionspayload}

All functions passed in the `actions` object in `Rune.initLogic()` will be exposed to the client via `Rune.actions.myActionName`. This is the only way game state may be updated to make sure it's propagated to every player. You may call it with one argument of any type, but usually an object is recommended.

```js
// client.js
button.onClick = () => {
  Rune.actions.markCell({
    myId: "button",
  })
}
```

### `Rune.showGameOverPopUp()` {#runeshowgameoverpopup}

If you set `delayPopUp` to `true` in `Rune.gameOver()`, you should call this function in your `client.js` to show the game over popup.

### `Rune.showInvitePlayers()` {#runeshowinviteplayers}

Opens invite modal inside the Rune app. Useful if you want to incentivize players to invite their friends.

### `Rune.gameTime()` {#runegametime-1}

Returns the amount of milliseconds that have passed since the start of the game. See [Using Time in your Game](advanced/real-time-games.md#game-time).

### `Rune.getPlayerInfo(playerId)` {#rune-get-player-info}

Returns name, avatar, etc. for the player. Note that you can pass the ID of a player that is no longer in game and get placeholder information.

### `Rune.timeSinceLastUpdate()` {#runetimesincelastupdate}

Returns the amount of milliseconds that have passed since the last `update` call. Can be used to smoothly render timers or interpolate between two positions.

### `Rune.msPerUpdate` {#runemsperupdate}

Number of milliseconds indicating how often `update` function is called. Only available if game uses updates.

### `Rune.interpolator()` {#runeinterpolator}

Returns an instance of interpolator. See [Reducing Stutter](advanced/reducing-stutter.md).

### `Rune.interpolatorLatency()` {#runeinterpolatorlatency}

Returns an instance of interpolator. See [Reducing Stutter](advanced/reducing-stutter.md).
