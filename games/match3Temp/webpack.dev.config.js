const path = require('path');
const { merge } = require('webpack-merge');
const CopyWebpackPlugin = require("copy-webpack-plugin");
const commonConfig = require('./webpack.base.config');
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = merge(commonConfig, {
    mode: 'development',
    devtool: 'eval-cheap-module-source-map',
    devServer: {
        static: {
            // Serve the built output (in-memory) under the same root path
            directory: path.join(__dirname, 'dist'),
        },
        compress: true,
        port: 3002,
        host: '0.0.0.0',
        hot: true,
        liveReload: true,
        watchFiles: {
            paths: ['src/**/*', 'test-index.html', 'createGameData.js', 'validateGameData.js'],
            options: {
                usePolling: false,
            },
        },
        client: {
            overlay: {
                errors: true,
                warnings: false,
            },
        },
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: 'game.html',
            filename: 'index.html',
            inject: true
        }),
        new CopyWebpackPlugin({
            patterns: [
                { from: 'test-index.html', to: 'test-index.html' },
                { from: 'createGameData.js', to: 'createGameData.js' },
                { from: 'validateGameData.js', to: 'validateGameData.js' },
                { from: 'node_modules/crypto-js/crypto-js.js', to: 'node_modules/crypto-js/crypto-js.js' }
            ]
        }),
    ],
});
