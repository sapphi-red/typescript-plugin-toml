import { getDtsContent } from './dtsContent'
import { isToml, isConstToml } from './util'
import { createLogger } from './logger'
import { createLanguageServicePlugin } from '@volar/typescript/lib/quickstart/createLanguageServicePlugin'
import type { LanguagePlugin } from '@volar/language-core'
import type {} from '@volar/typescript'

export = createLanguageServicePlugin((ts, info) => {
  const tsConfigPath = info.project.getProjectName()
  if (!info.project.fileExists(tsConfigPath)) {
    // project name not a tsconfig path, this is a inferred project
    return { languagePlugins: [] }
  }

  const logger = createLogger(info)

  const plugin: LanguagePlugin<string> = {
    getLanguageId(scriptId) {
      if (isToml(scriptId)) {
        return 'toml'
      }
    },
    createVirtualCode(scriptId, languageId) {
      if (languageId !== 'toml') return undefined

      const fileName = scriptId.includes('://')
        ? scriptId.split('://')[1] ?? ''
        : scriptId

      const dtsContent = getDtsContent(fileName, logger, isConstToml(fileName))
      return {
        id: 'main',
        languageId: 'toml',
        snapshot: {
          getText: (start, end) => dtsContent.slice(start, end),
          getLength: () => dtsContent.length,
          getChangeRange: () => undefined
        },
        mappings: []
      }
    },
    typescript: {
      extraFileExtensions: [
        {
          extension: 'toml',
          isMixedContent: true,
          scriptKind: ts.ScriptKind.TS
        }
      ],
      getServiceScript(root) {
        return { code: root, extension: '.ts', scriptKind: ts.ScriptKind.TS }
      }
    }
  }

  return { languagePlugins: [plugin] }
})
