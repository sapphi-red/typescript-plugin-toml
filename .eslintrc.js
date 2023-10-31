// eslint-disable-next-line no-undef
module.exports = {
  root: true,
  env: {
    es2017: true
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier'
  ],
  rules: {
    'no-console': 'warn',
    'no-debugger': 'warn'
  }
}
