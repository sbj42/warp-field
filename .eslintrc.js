module.exports = {
    'env': {
        'browser': true,
        'es2021': true,
        'node': true,
    },
    'extends': [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
    ],
    'parser': '@typescript-eslint/parser',
    'parserOptions': {
        'ecmaVersion': 12,
        'sourceType': 'module',
    },
    'plugins': [
        '@typescript-eslint',
    ],
    'rules': {
        'indent': [
            'error',
            4,
            {
                'SwitchCase': 1,
            },
        ],
        'quotes': [
            'error',
            'single',
            {
                'allowTemplateLiterals': true,
            },
        ],
        'semi': [
            'error',
            'always',
        ],
        'no-console': [
            'error',
        ],
        'eqeqeq': [
            'error',
        ],
        'no-invalid-this': [
            'error',
        ],
        'no-throw-literal': [
            'error',
        ],
        'curly': [
            'error',
        ],
        'brace-style': [
            'error',
        ],
        'camelcase': [
            'error',
        ],
        'comma-dangle': [
            'error',
            'always-multiline',
        ],
        'comma-style': [
            'error',
        ],
        'no-trailing-spaces': [
            'error',
        ],
        'no-var': [
            'error',
        ],
        '@typescript-eslint/no-shadow': [
            'error',
        ],
    },
};
