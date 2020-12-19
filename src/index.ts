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

    const _createLanguageServiceSourceFile =
      tsModule.createLanguageServiceSourceFile
    tsModule.createLanguageServiceSourceFile = (
      fileName,
      scriptSnapshot,
      ...rest
    ): ts.SourceFile => {
      if (isToml(fileName)) {
        logger.log(`create ${fileName}`)
        scriptSnapshot = createDtsSnapshot(
          tsModule,
          scriptSnapshot,
          logger,
          isConstToml(fileName)
        )
      }
      const sourceFile = _createLanguageServiceSourceFile(
        fileName,
        scriptSnapshot,
        ...rest
      )
      if (isToml(fileName)) {
        sourceFile.isDeclarationFile = true
      }
      return sourceFile
    }

    const _updateLanguageServiceSourceFile =
      tsModule.updateLanguageServiceSourceFile
    tsModule.updateLanguageServiceSourceFile = (
      sourceFile,
      scriptSnapshot,
      ...rest
    ): ts.SourceFile => {
      if (isToml(sourceFile.fileName)) {
        logger.log(`update ${sourceFile.fileName}`)
        scriptSnapshot = createDtsSnapshot(
          tsModule,
          scriptSnapshot,
          logger,
          isConstToml(sourceFile.fileName)
        )
      }
      sourceFile = _updateLanguageServiceSourceFile(
        sourceFile,
        scriptSnapshot,
        ...rest
      )
      if (isToml(sourceFile.fileName)) {
        sourceFile.isDeclarationFile = true
      }
      return sourceFile
    }

    if (info.languageServiceHost.resolveModuleNames) {
      const _resolveModuleNames = info.languageServiceHost.resolveModuleNames.bind(
        info.languageServiceHost
      )
      info.languageServiceHost.resolveModuleNames = (
        moduleNames,
        containingFile,
        ...rest
      ) => {
        const resolvedModules = _resolveModuleNames(
          moduleNames,
          containingFile,
          ...rest
        )

        return moduleNames.map((moduleName, i) => {
          if (!isToml(moduleName)) {
            return resolvedModules[i]
          }

          return {
            resolvedFileName: path.join(
              path.dirname(containingFile),
              path.dirname(moduleName),
              path.basename(moduleName)
            ),
            extension: tsModule.Extension.Dts
          }
        })
      }
    }

    return info.languageService
  }

  const getExternalFiles = (project: ts.server.ConfiguredProject) => {
    return project.getFileNames().filter(name => isToml(name))
  }

  return { create, getExternalFiles }
}

export = init
