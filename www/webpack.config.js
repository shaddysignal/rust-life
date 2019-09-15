const CopyWebpackPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const devMode = process.env.NODE_ENV !== 'production';

const webpack = require('webpack');
const path = require('path');

module.exports = {
  entry: "./src/index.ts",
  //entry: "./bootstrap.js",

  mode: "development",

  devServer: {
    hot: true
  },

  plugins: [
    new CopyWebpackPlugin(['index.html']),
    new webpack.ProvidePlugin({
      '_': 'lodash',
      'PropTypes': 'prop-types'
    }),
    new MiniCssExtractPlugin({
      filename: devMode ? '[name].css' : '[name].[hash].css',
      chunkFilename: devMode ? '[id].css' : '[id].[hash].css',
    }),
  ],

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              hmr: devMode,
              reloadAll: true,
            },
          },
          'css-loader',
          'postcss-loader',
          'sass-loader',
        ]
      },
      {
        test: /\.(png|jpeg|svg|jpg|gif|webm)/,
        use: [
          'file-loader'
        ]
      }
    ]
  },

  resolve: {
    extensions: [ '.tsx', '.ts', '.js', '.wasm', '.css', '.scss' ],
    alias: {
      components: path.resolve(__dirname, "src/components/"),
      utils: path.resolve(__dirname, "src/utils/")
    }
  },

  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].bundle.js",
    publicPath: "/assets"
  },
};