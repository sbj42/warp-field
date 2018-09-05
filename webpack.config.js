var path = require('path');
var config = require('./package.json');

var production = process.argv.indexOf('-p') !== -1;

var filename = 'warp-field-' + config.version
if (production) {
    filename += '.min.js';
} else {
    filename += '.js';
}

module.exports = {
    entry: "./src/index.ts",
    mode: production ? 'production' : 'development',
    devtool: 'source-map',
    output: {
        path: path.resolve(__dirname, 'bin'),
        publicPath: '/bin/',
        filename: filename,
        libraryTarget: "var",
        library: "WarpField"
    },
    resolve: {
        extensions: ['.ts']
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: [ 'ts-loader' ]
            }
        ]
    }
};
