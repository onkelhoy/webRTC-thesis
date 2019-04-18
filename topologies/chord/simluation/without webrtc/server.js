const http   = require('http')
const app    = require('./server/app')
const socket = require('./server/Socket')
const path   = require('path')

const server = http.createServer(app)
socket(server)

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/index.html'))
})

server.listen(app.get('port'), listen => console.log('server running on ' + app.get('port')))
