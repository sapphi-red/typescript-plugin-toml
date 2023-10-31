import type ts from 'typescript/lib/tsserverlibrary'
import toml from 'toml'
import { Logger } from './logger'
import { readFileSync } from 'fs'

export const createDtsSnapshot = (
  tsModule: typeof ts,
  fileName: string,
  logger: Logger,
  useAsConst: boolean
): ts.IScriptSnapshot => {
  const text = readFileSync(fileName, 'utf-8')

  let dts
  try {
    const data = toml.parse(text)

    dts = `
declare const data = ${JSON.stringify(data)}${useAsConst ? ' as const' : ''}
export default data
`
  } catch (e) {
    logger.error(e)
    dts = `
declare const data: void
export default data
`
  }
  return tsModule.ScriptSnapshot.fromString(dts)
}
