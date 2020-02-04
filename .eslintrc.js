// https://eslint.org/docs/user-guide/configuring

module.exports = {
  root: true,
  parser: "vue-eslint-parser",
  parserOptions: {
    parser: "babel-eslint",
    sourceType: 'module'
  },
  env: {
    browser: true,
  },
  // https://github.com/standard/standard/blob/master/docs/RULES-en.md
  extends: 'standard',
  // required to lint *.vue files
  plugins: [
    'vue'
  ],
  // add your custom rules here
  rules: {
    "semi": ["error", "always"],
    "indent": ["error", 4],
    "space-before-function-paren": ["error", "never"],
    "no-extra-boolean-cast": 0, // 0=silence, 1=warning, 2=error
    // allow async-await
    'generator-star-spacing': 'off',
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-prototype-builtins': 'off'
  },
  globals: {
    Camera: "readonly"
  }
}
