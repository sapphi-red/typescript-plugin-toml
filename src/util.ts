export const isToml = (filename: string): boolean => filename.endsWith('.toml')
export const isConstToml = (filename: string): boolean =>
  filename.endsWith('.const.toml')
