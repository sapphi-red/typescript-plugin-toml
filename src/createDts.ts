import type ts from 'typescript/lib/tsserverlibrary'
import toml from 'toml'

export const createDtsSnapshot = (
  tsModule: typeof ts,
  scriptSnapshot: ts.IScriptSnapshot
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
    dts = `
declare const data: never
export default data
`
  }
  return tsModule.ScriptSnapshot.fromString(dts)
}
