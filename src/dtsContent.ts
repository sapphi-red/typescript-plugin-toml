import toml from 'toml'
import { Logger } from './logger'
import { readFileSync } from 'fs'

export const getDtsContent = (
  fileName: string,
  logger: Logger,
  useAsConst: boolean
): string => {
  const text = readFileSync(fileName, 'utf-8')

  let dts
  try {
    const data = toml.parse(text)

    dts = `
declare const data = ${JSON.stringify(data)}${useAsConst ? ' as const' : ''}
export default data
`
  } catch (e: unknown) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    logger.error(e as any)
    dts = `
declare const data: void
export default data
`
  }
  return dts
}
