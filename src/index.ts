import type * as ts from 'typescript/lib/tsserverlibrary'
import path from 'path'
import { createDtsSnapshot } from './createDts'
import { isToml, isConstToml } from './util'
import { createLogger } from './logger'

function init({
  typescript: tsModule
}: {
  typescript: typeof ts
}): ts.server.PluginModule {
  const create = (info: ts.server.PluginCreateInfo) => {
    const logger = createLogger(info)

    const languageServiceHost: Partial<ts.LanguageServiceHost> = {
      getScriptKind(fileName) {
        if (!info.languageServiceHost.getScriptKind) {
          return tsModule.ScriptKind.Unknown
        }
        if (isToml(fileName)) return tsModule.ScriptKind.TS
        return info.languageServiceHost.getScriptKind(fileName)
      },
      getScriptSnapshot(fileName) {
        if (isToml(fileName)) {
          return createDtsSnapshot(
            tsModule,
            fileName,
            logger,
            isConstToml(fileName)
          )
        }
        return info.languageServiceHost.getScriptSnapshot(fileName)
      },
      resolveModuleNameLiterals(moduleNames, containingFile, ...rest) {
        if (!info.languageServiceHost.resolveModuleNameLiterals) {
          return []
        }

        const resolvedModules =
          info.languageServiceHost.resolveModuleNameLiterals(
            moduleNames,
            containingFile,
            ...rest
          )

        return moduleNames.map(({ text: moduleName }, i) => {
          if (!isToml(moduleName)) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            return resolvedModules[i]!
          }

          return {
            resolvedModule: {
              resolvedFileName: path.join(
                path.dirname(containingFile),
                path.dirname(moduleName),
                path.basename(moduleName)
              ),
              extension: tsModule.Extension.Dts,
              isExternalLibraryImport: false
            }
          }
        })
      }
    }
    const languageServiceHostProxy = new Proxy(info.languageServiceHost, {
      get(target, key: keyof ts.LanguageServiceHost) {
        return languageServiceHost[key] ?? target[key]
      }
    })
    const languageService = tsModule.createLanguageService(
      languageServiceHostProxy
    )

    if (info.languageServiceHost.resolveModuleNameLiterals) {
      logger.log('resolveModuleNameLiterals not found')
    }

    return languageService
  }

  const getExternalFiles = (project: ts.server.ConfiguredProject) => {
    return project.getFileNames().filter(name => isToml(name))
  }

  return { create, getExternalFiles }
}

export = init
