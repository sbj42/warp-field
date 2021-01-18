module.exports = {
    'env': {
        'browser': true,
        'es6': true,
        'node': true
    },
    'extends': [
        'eslint:recommended',
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended'
    ],
    'globals': {
        'Atomics': 'readonly',
        'SharedArrayBuffer': 'readonly'
    },
    'parser': '@typescript-eslint/parser',
    'parserOptions': {
        'ecmaVersion': 2018,
        'sourceType': 'module'
    },
    'plugins': [
        '@typescript-eslint'
    ],
    'rules': {
        'indent': [
            'off'
        ],
        'linebreak-style': [
            'off'
        ],
        'quotes': [
            'error',
            'single',
            {
                'avoidEscape': true,
                'allowTemplateLiterals': true
            }
        ],
        'semi': [
            'error',
            'always'
        ],
        '@typescript-eslint/explicit-function-return-type': [
            'off'
        ],
        '@typescript-eslint/no-unused-vars': [
            'off'
        ],
        '@typescript-eslint/no-use-before-define': [
            'off'
        ],
        '@typescript-eslint/explicit-module-boundary-types': [
            'off'
        ]
    }
};