import {
  BOTTOM_PADDLE_POSITION,
  GAME_HEIGHT,
  GAME_WIDTH,
  GameState,
  PADDLE_WIDTH,
  PADDLE_SPEED,
  TOP_PADDLE_POSITION,
} from "./logic"
import { throttle } from "./helpers"
import {
  renderBall,
  renderPaddle,
  renderPopup,
  renderScore,
  SCORE_DURATION,
  setupCanvas,
} from "./render"
import { Players } from "rune-games-sdk"

const ballInterpolator = Rune.interpolator<[number, number]>()
const opponentPaddleInterpolator = Rune.interpolatorLatency<number>({
  maxSpeed: PADDLE_SPEED,
  timeToMaxSpeed: 0,
})
const playerPaddleInterpolator = Rune.interpolator<number>()

const { canvas, context } = setupCanvas()

let game: GameState
let players: Players
let futureGame: GameState
let yourPlayerId: string | undefined

let opponentIndex = 0
let playerIndex = 0

let isReady = false
const images = [new Image(22, 22), new Image(22, 22)]

let lastScoreAt= 0
let lastScoredBy: number | null = null

window.onload = function () {
  document.body.appendChild(canvas)

  Rune.initClient({
    onChange: (params) => {
      game = params.game

      futureGame = params.futureGame!
      players = params.players
      yourPlayerId = params.yourPlayerId

      if (!isReady) {
        isReady = true
        images[0].src = players[game.players[0].id].avatarUrl
        images[1].src = players[game.players[1].id].avatarUrl

        playerIndex =
          yourPlayerId && game.players[0].id === yourPlayerId ? 0 : 1
        opponentIndex = playerIndex === 0 ? 1 : 0
      }

      if (game.totalScore === futureGame.totalScore) {
        ballInterpolator.update({
          game: game.ball.position,
          futureGame: futureGame.ball.position,
        })

        opponentPaddleInterpolator.update({
          game: game.paddles[opponentIndex].position,
          futureGame: futureGame.paddles[opponentIndex].position,
        })

        playerPaddleInterpolator.update({
          game: game.paddles[playerIndex].position,
          futureGame: futureGame.paddles[playerIndex].position,
        })
      }

      if (params.previousGame.totalScore !== game.totalScore) {
        lastScoreAt = performance.now()

        lastScoredBy =
          params.previousGame.players[0].score !== game.players[0].score ? 0 : 1

        opponentPaddleInterpolator.jump(game.paddles[opponentIndex].position)
      }
    },
  })
}

function render() {
  context.clearRect(0, 0, canvas.width, canvas.height)

  context.fillStyle = "#150813"
  context.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT)

  if (game) {
    renderScore(
      context,
      25,
      images[opponentIndex],
      players[game.players[opponentIndex].id].displayName,
      game.players[opponentIndex].score
    )

    renderScore(
      context,
      GAME_HEIGHT - 25,
      images[playerIndex],
      players[game.players[playerIndex].id].displayName,
      game.players[playerIndex].score
    )

    if (lastScoredBy !== null) {
      if (performance.now() - lastScoreAt > SCORE_DURATION) {
        lastScoreAt = 0
        lastScoredBy = null
      } else {
        renderPopup(
          context,
          players[game.players[lastScoredBy].id].displayName,
          lastScoreAt
        )
      }
    }

    renderBall(
      context,
      game.players[0].id === yourPlayerId,
      ...ballInterpolator.getPosition()
    )

    renderPaddle(
      context,
      TOP_PADDLE_POSITION,
      opponentPaddleInterpolator.getPosition()
    )

    renderPaddle(
      context,
      BOTTOM_PADDLE_POSITION,
      playerPaddleInterpolator.getPosition()
    )
  }

  requestAnimationFrame(render)
}

render()

const move = throttle((x: number) => {
  const position = Math.max(
    0,
    Math.min(
      Math.round((x / window.innerWidth) * GAME_WIDTH - PADDLE_WIDTH / 2),
      GAME_WIDTH - PADDLE_WIDTH
    )
  )

  Rune.actions.setPosition(position)
}, 100)

window.addEventListener("pointerdown", (event) => move(event.clientX))
window.addEventListener("pointermove", (event) => {
  // if (event.pressure > 0) {
  move(event.clientX)
  // }
})
