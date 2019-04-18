const WebSocket = require('ws')
const sha1      = require('sha1')

let clients = [], hostid = null, wss = null 

module.exports = function (server)
{
  wss = new WebSocket.Server({ server })
    
  wss.on('connection', connect)
}


function connect (socket) {
  socket.id = sha1(Math.random() + '.' + new Date().getTime())
  clients[socket.id] = socket 

  if (!hostid)
  {
    hostid = socket.id 
  }
  else 
  {
    clients[hostid].send(JSON.stringify({arival: socket.id}))
  }

  socket.send(JSON.stringify({ id: socket.id }))
  
  socket.on('message', message => {
    let data = JSON.parse(message)
    
    for (let id in clients) 
    {
      if (id === data.id)
      {
        clients[id].send(message)
      }
    }
  })

  socket.on('close', data => {
    // tell the others.. or dont ? 
    delete clients[socket.id] 
    if (socket.id === hostid)
    {
      console.log('host left')
      hostid = null 
      for (let id in clients)
      {
        hostid = id 
        break
      }
    }
  })
}