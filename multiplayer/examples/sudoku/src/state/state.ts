import { GameState, Color } from "../logic/types/GameState"
import { atom } from "jotai"
import { Players, PlayerId } from "rune-games-sdk/multiplayer"
import { cellPointer } from "../lib/cellPointer"

export const $state = atom<
  | {
      game: GameState
      players: Players
      yourPlayerId: PlayerId | undefined
    }
  | undefined
>(undefined)

export const $board = atom((get) => get($state)?.game.sudoku?.board)

export const $selections = atom((get) =>
  Object.entries(get($state)?.game.playerState ?? {}).reduce<{
    [index: number]: string[] | undefined
  }>(
    (acc, [playerId, { selection }]) => ({
      ...acc,
      [cellPointer(selection)]: (acc[cellPointer(selection)] ?? []).concat(
        playerId
      ),
    }),
    {}
  )
)

export const $yourPlayerId = atom((get) => get($state)?.yourPlayerId)

export const $colors = atom((get) =>
  Object.entries(get($state)?.game.playerState ?? {}).reduce<{
    [playerId: string]: Color
  }>(
    (acc, [playerId, { color }]) => ({
      ...acc,
      [playerId]: color,
    }),
    {}
  )
)
