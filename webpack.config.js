/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const config = require('./package.json');

module.exports = (env, argv) => {
    let filename = config.name + '-' + config.version;
    if (argv.mode === 'production') {
        filename += '.min.js';
    } else {
        filename += '.js';
    }
    return {
        entry: './src/index.ts',
        devtool: 'source-map',
        output: {
            path: path.resolve(__dirname, 'dist'),
            publicPath: '/dist/',
            filename: filename,
            libraryTarget: 'var',
            library: 'WarpField',
        },
        resolve: {
            extensions: ['.ts', '.js'],
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
};
