const webpack = require('webpack')
const path = require('path')

const config = {
  entry: {},
  output: {
    path: path.join(__dirname, 'public'),
    filename: 'js/[name].bundle.js',
    publicPath: '/'
  },

  module: {
    rules: [
      { exclude: /node_modules/, test: /\.s?css$/, use: ['style-loader', 'css-loader', 'sass-loader'] },
      { exclude: /node_modules/, test: /\.js$/, use: 'babel-loader' },
      {
        exclude: /node_modules/,
        test: /\.(html)$/,
        use: {
          loader: 'html-loader',
          options: {
            attrs: [':data-src']
          }
        }
      }
    ]
  },
  plugins: [
    new webpack.NoEmitOnErrorsPlugin()
  ]
}

config.mode = 'development'
config.devServer = {
  publicPath: config.output.publicPath
}
config.entry.main = [
  'webpack/hot/dev-server',
  'webpack-hot-middleware/client',
  './client/js/main.js'
]

config.devtool = 'source-map'
config.plugins.push(new webpack.NamedModulesPlugin())
config.plugins.push(new webpack.HotModuleReplacementPlugin())

module.exports = config