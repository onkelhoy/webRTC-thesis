const WebSocket = require('ws')
const sha1      = require('sha1')

let clients = [], hostid = null, wss = null 

module.exports = function (server)
{
  wss = new WebSocket.Server({ server })
    
  wss.on('connection', connect)
}

function socketMessage (event) {
  let data = JSON.parse(event)

  console.log('new message', data)

  if (data.type === 'init-ACK')
  {
    if (clients[data.uuid])
    {
      console.log('already exists', data.uuid)
      this.id = sha1(Math.random() + '.' + new Date().getTime())
      this.send(JSON.stringify({ type: 'init', id: this.id }))
    }
    else 
    {
      clients[data.uuid] = this 
      this.uuid = data.uuid
      this.send(JSON.stringify({ type: 'connect', host: hostid }))
      
      if (!hostid)
      {
        hostid = this.uuid 
      }
    }
  }
  else if (data.to) 
  {
    console.log('send to', data.to)
    clients[data.to].send(event)
  }
}

function connect (socket) {
  socket.id = sha1(Math.random() + '.' + new Date().getTime())
  // client should generate the uuid and send it back 
  
  socket.send(JSON.stringify({ type: 'init', id: socket.id }))
  socket.on('message', socketMessage)

  socket.on('close', data => {
    // tell the others.. or dont ? 
    delete clients[socket.uuid] 
    
    if (socket.uuid == hostid)
    {
      hostid = null 
      for (let id in clients)
      {
        hostid = id
        break
      }
    }
  })
}