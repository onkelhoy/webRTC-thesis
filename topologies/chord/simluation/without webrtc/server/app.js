const express = require('express')
const bparser = require('body-parser')
const session = require('express-session')
const path = require('path')
const dotenv = require('dotenv')
const app = express()
// loading the enviroment variables
dotenv.config()
app.set('port', process.env.SERVER_PORT) // setting it to quick access

// setting the use-ings
app.use(session({
  secret: process.env.SECRET,
  resave: false, 
  saveUninitialized: false
}))
app.use(bparser.json())
app.use(bparser.urlencoded({
  extended: true
}))

app.use(express.static(path.join(__dirname, '../public')))

const webpack = require('webpack')
const middleware = require('webpack-dev-middleware')
const hotmiddleware = require('webpack-hot-middleware')
const config = require('../webpack.config')
const compilar = webpack(config)

app.use(middleware(compilar, config.devServer))
app.use(hotmiddleware(compilar, {
  log: console.log
}))

// exporting the configurated app
module.exports = app 