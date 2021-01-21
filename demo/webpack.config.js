/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');

module.exports = {
    entry: './src/demo.ts',
    devtool: 'source-map',
    target: 'web',
    mode: 'production',
    output: {
        path: path.join(__dirname, 'www', 'build'),
        filename: 'demo.js',
    },
    resolve: {
        extensions: ['.ts', '.js'],
    },
    devServer: {
        contentBase: path.join(__dirname, 'www'),
        publicPath: '/build/',
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: [ 'ts-loader' ],
            },
        ],
    },
};
