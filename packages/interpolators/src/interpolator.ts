import { validateUpdateParams } from "./validation"
import { getDimensions } from "./dimensions"

function lerp(a: number, b: number, t: number) {
  return (b - a) * t + a
}

const runValidation = true

export function interpolator<Dimensions extends number | number[]>() {
  let current: Dimensions | undefined = undefined
  let future: Dimensions | undefined = undefined

  let size: number | null = null

  return {
    update(params: { current: Dimensions; future: Dimensions }) {
      //This value is set to true when `onChange` is called by `update` event.
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      if (!Rune._isOnChangeCalledByUpdate) {
        return
      }

      if (runValidation) {
        validateUpdateParams(params, size)
      }

      size = getDimensions(params.current)

      current = params.current
      future = params.future
    },

    getPosition(): Dimensions {
      if (current === undefined) {
        throw new Error(
          "getPosition can't be called before calling update at least once"
        )
      }

      const delta = Rune.timeSinceLastUpdate() / Rune.msPerUpdate

      if (size !== -1) {
        return (current as number[]).map((curr, index) => {
          return lerp(curr, (future as number[])[index], delta)
        }) as Dimensions
      }

      return lerp(current as number, future as number, delta) as Dimensions
    },
  }
}