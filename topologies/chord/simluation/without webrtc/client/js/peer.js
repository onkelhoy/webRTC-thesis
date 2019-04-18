import Finger from './Finger'
import UUID from './uuid'
import chord from './main'
import Range from './range'

export default class Peer {
  constructor (m) {
    this.finger = new Finger(m)
    this.predeccessor = null 
    this.successor    = null 
    
    this.socket = new WebSocket('ws://localhost:8080/')
    this.socket.onmessage = this.message.bind(this)
    this.uuid = null 
  }

  connect () {
  }

  static Create (uuid, range) {
    return { uuid, range } // dont need any routing info blabla.. since 
  }

  message (message) {
    let data = JSON.parse(message.data)
    if (data.successor) 
    {
      console.log('oh look my successor', data.successor.uuid)
      this.successor = Peer.Create(data.successor.uuid, new Range(this.uuid, data.successor.uuid))
      chord.Join(this.successor)
      this.fixFingers()
    }
    else if (data.id)
    {
      this.uuid = UUID(data.id)
      console.log('my uuid', this.uuid)
      this.successor = Peer.Create(this.uuid, new Range(this.uuid+1, this.uuid+2))
      this.fixFingers()

      console.log(this.finger.table)

      chord.Join(this)
    }
    else if (data.arival)
    {
      // incomming arrival 
      let uuid = UUID(data.arival)
      let successor = this.findSuccessor(uuid)
      
      this.send({ successor, id: data.arival })
    }
  }

  fixFingers () {
    let next = 0  
    for (let i = 0; i < this.finger.M; i++)
    {
      next = next + 1

      let id = this.uuid + 2 ** (next - 1)
      id %= chord.N

      let nextid = this.uuid + 2 ** next 
      nextid %= chord.N 

      this.finger.table[i] = Peer.Create(this.findSuccessor(id).uuid, new Range(id, nextid))
      chord.Connect(this.uuid, id)
    }
  }

  findSuccessor (id) {
    if (this.predeccessor && id < this.predeccessor.uuid)
    {
      return this.predeccessor
    }
    else if (this.successor.range.contains(id))
    {
      return this.successor
    }
    else 
    {
      return this.closestSuccessor(id)
    }
  }

  closestSuccessor (id) {
    for (let i = this.finger.table.length-1; i >= 0; i--) 
    {
      if (this.finger.table[i].range.contains(id))
      {
        return this.finger.table[i]
      }
    }

    return this 
  }

  stabilize () {
    v = this.successor 
    // get the predeccessor from v ? 
    if (v !== null && this.successor.contains(v))
    {
      this.successor = v 
    }

    
  }

  send (data) {
    this.socket.send(JSON.stringify(data))
  }
}