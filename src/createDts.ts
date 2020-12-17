import type ts from 'typescript/lib/tsserverlibrary'
import toml from 'toml'
import { Logger } from './logger'

export const createDtsSnapshot = (
  tsModule: typeof ts,
  scriptSnapshot: ts.IScriptSnapshot,
  logger: Logger
): ts.IScriptSnapshot => {
  const text = scriptSnapshot.getText(0, scriptSnapshot.getLength())

  // Sometimes the generated dts are passed
  // relates https://github.com/mrmckeb/typescript-plugin-css-modules/issues/41
  if (text.includes('export default data')) {
    return scriptSnapshot
  }

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
