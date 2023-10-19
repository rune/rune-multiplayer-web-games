import { GameState } from "./types.ts"

import { countdownDuration } from "./logicConfig.ts"
import { getInitialLine } from "./getInitialLine.ts"

export function newRound(game: GameState) {
  game.stage = "countdown"
  game.timer = countdownDuration
  game.timerStartedAt = Rune.gameTime()
  game.collisionGrid = {}

  for (const player of game.players) {
    player.state = "alive"

    const snake = game.snakes[player.playerId]

    snake.line = getInitialLine()
    snake.turning = "none"
    snake.gapCounter = 0
  }
}