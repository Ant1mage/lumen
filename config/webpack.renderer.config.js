const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  target: 'web',
  entry: './src/renderer/index.tsx',
  output: {
    path: path.resolve(__dirname, '../dist/renderer'),
    filename: 'renderer.js',
    clean: true,
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.jsx'],
    alias: {
      '@main': path.resolve(__dirname, '../src/main'),
      '@renderer': path.resolve(__dirname, '../src/renderer'),
      '@preload': path.resolve(__dirname, '../src/preload'),
      '@shared': path.resolve(__dirname, '../src/shared'),
    },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader', 'postcss-loader'],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, '../public'),
    },
    hot: true,
    port: 3001,
  },
};
