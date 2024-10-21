// @ts-check
import antfu from '@antfu/eslint-config'

export default antfu({
  type: 'lib',
  ignores: ['examples/content/**'],
  rules: {
    '@typescript-eslint/explicit-function-return-type': 'off',
    'node/prefer-global/process': 'off',
    'ts/no-unsafe-function-type': 'off',
    'node/prefer-global/buffer': 'off',
  },
})
