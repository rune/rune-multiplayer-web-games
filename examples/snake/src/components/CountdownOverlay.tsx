import { useAtomValue } from "jotai"
import { $timer } from "../state/state.ts"
import { styled } from "styled-components"
import { rel } from "../lib/rel.ts"
import { colors } from "../logic/logicConfig.ts"

// TODO: no header/walls?

export function CountdownOverlay() {
  const timer = useAtomValue($timer)

  const color = colors[(timer + 1) % 4] // +1 is so that we start with pink :)

  return <Root style={{ color }}>{timer}</Root>
}

const Root = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

  font-size: ${rel(300)};
  letter-spacing: ${rel(-6)};
`
