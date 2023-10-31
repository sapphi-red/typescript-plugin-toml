// eslint-disable-next-line no-undef
module.exports = {
  root: true,
  env: {
    es2017: true
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/stylistic',
    'prettier'
  ],
  rules: {
    'no-console': 'warn',
    'no-debugger': 'warn'
  }
}
