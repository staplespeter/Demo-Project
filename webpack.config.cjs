const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const { EnvironmentPlugin } = require('webpack');
require('dotenv').config({ path: 'config/.env' });

const serverConfig = {
    name: "server",
    mode: "development",
    target: "node",
    context: path.resolve(__dirname, ''),
    entry: {
        server: "./build/Server/Api/index.js"
    },
    output: {
        path: path.resolve(__dirname, 'dist/Server'),
        filename: "[name].bundle.js"
    }
};

const clientConfig = {
    name: "client",
    mode: "development",
    target: "web",
    devtool: "eval-source-map",
    context: path.resolve(__dirname, ''),
    entry: {
        signin: "./build/Client/React/Pages/SignIn.js"
    },
    output: {
        path: path.resolve(__dirname, 'dist/Client'),
        filename: "[name].bundle.js"
    },
    plugins: [
        new HtmlWebpackPlugin({
            filename: "signIn.html",
            title: "Sign In"
        }),
        new EnvironmentPlugin(['API_HOSTNAME', 'API_PORT'])
    ],
    resolve: {
        fallback: {
            "https": require.resolve("https-browserify"),
            "http": require.resolve("stream-http")
        }
    }
};

module.exports = [serverConfig, clientConfig];