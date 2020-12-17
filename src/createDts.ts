import type ts from 'typescript/lib/tsserverlibrary'
import toml from 'toml'
import { Logger } from './logger'

export const createDtsSnapshot = (
  tsModule: typeof ts,
  scriptSnapshot: ts.IScriptSnapshot,
  logger: Logger
): ts.IScriptSnapshot => {
  const text = scriptSnapshot.getText(0, scriptSnapshot.getLength())
  let dts
  try {
    const data = toml.parse(text)

    dts = `
declare const data = ${JSON.stringify(data)} as const
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
