const path = require('path');
const shell = require('shelljs');

module.exports = {
  target: 'node',
  node: {
    __filename: true,
    __dirname: true,
    fs: true
  },
  entry: `${__dirname}/read-raw-data.ts`,
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ]
  },
  output: {
    filename: 'cns-pubvis-loader.js',
    path: path.resolve('dist', 'cns-pubvis')
  },

  plugins: [
    function () {
      this.plugin('done', () => {
        const dist = path.resolve('dist', 'cns-pubvis');
        shell
          .echo('#!/usr/bin/env node\n')
          .cat(path.resolve(dist, 'cns-pubvis-loader.js'))
          .to(path.resolve(dist, 'cns-pubvis-loader'));
        shell.chmod(755, path.resolve(dist, 'cns-pubvis-loader'));
        shell.rm(path.resolve(dist, 'cns-pubvis-loader.js'));
      })
    },
  ]
};
