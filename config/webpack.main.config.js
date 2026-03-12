const path = require('path');

module.exports = {
  mode: 'development',
  target: 'electron-main',
  entry: './src/main/index.ts',
  output: {
    path: path.resolve(__dirname, '../dist/main'),
    filename: 'index.js',
  },
  resolve: {
    extensions: ['.ts', '.js'],
    alias: {
      '@main': path.resolve(__dirname, '../src/main'),
      '@renderer': path.resolve(__dirname, '../src/renderer'),
    },
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  node: {
    __dirname: false,
    __filename: false,
  },
  externals: {
    'better-sqlite3': 'commonjs better-sqlite3',
    // Note: node-llama-cpp is ESM-only; we load it at runtime via dynamic import.
    // Do not bundle or require it here, otherwise it will fail with ERR_REQUIRE_ESM.
  },
};
