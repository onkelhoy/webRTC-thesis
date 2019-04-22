import Finger from './Finger'
import UUID from './uuid'
import chord from './main'
import Range from './range'
import Network from './network'

const network = new Network()

class LocalPeer {
  constructor (uuid, range, to) {
    console.log('creating localPeer', uuid)
    this.uuid = uuid
    this.range = range 
    this.to = to 
  }

  get predecessor () {
    console.log('calling predecessor function!', this.uuid)
    return new Promise((res, rej) => {
      network.Ask('predecessor', {
        to: this.uuid, 
        from: this.to 
      }).then(data => res(data.predecessor))
        .catch(rej)
    })
  }

  get successor () {
    return new Promise((res, rej) => {
      network.Ask('successor', {
        to: this.uuid, 
        from: this.to 
      }).then(data => res(data.successor))
        .catch(rej)
    })
  }

  get notify () {
    network.send('notify', {
      to: this.uuid,
      from: this.to
    })
  }

  get stabilize () {
    network.send('stabilize', {
      to: this.uuid,
      from: this.to
    })
  }

  contains (id) {
    return this.range.contains(id)
  }
}

export default class Peer {
  constructor (m) {
    this.finger = new Finger(m)
    this.predecessor = null 
    this.successor    = null 
    
    this.uuid = null 
    this.init    = this.init.bind(this)
    this.notify  = this.notify.bind(this)
    this.connect = this.connect.bind(this)
    this.lookup  = this.lookup.bind(this)
    this.stabilize = this.stabilize.bind(this)

    network.registerHook('connect', this.connect)
    network.registerHook('notify', this.notify)
    network.registerHook('stabilize', this.stabilize)
    network.registerHook('init', this.init)
    network.registerHook('lookup', this.lookup)

    network.registerHook('successor', data => 
      network.send('successor-ACK', { to: data.from, from: this.uuid, successor: this.successor ? this.successor.uuid : null }))
    network.registerHook('predecessor', data => 
      network.send('predecessor-ACK', { to: data.from, from: this.uuid, predecessor: this.predecessor ? this.predecessor.uuid : null }))
  }

  init (data) {
    console.log('init')
    this.uuid = UUID(data.id)
    // now we check if this is ok 
    network.send('init-ACK', {
      uuid: this.uuid 
    })

    // should set a timeout for a connect response or something.. but.. not now 
  }

  async connect (data) {
    // Joining of network ? 
    console.log('connect with uuid', this.uuid)
    this.finger.init(this.uuid, chord.N, this.CreateLocal)
    
    if (data.host !== null)
    {
      for (let finger of this.finger.table)
      {
        try 
        {
          let d = await network.Ask('lookup', {
            lookup: finger.range.a,
            to: data.host,
            from: this.uuid
          })

          finger.uuid = d.lookup

          if (!this.successor)
          {
            this.successor = this.finger.successor
          }
  
        }
        catch (e)
        {
          console.error('Error while connecting', e)
        }
      } 
      try 
      {
        await this.stabilize()
      }
      catch (e)
      {
        console.error('Error while stabilize', e)
      }
    }
    else 
    {
      this.successor = this.finger.successor
    }

    console.log(this.finger.table)
    chord.Join(this)
  }

  CreateLocal (uuid, range, from) {
    return new LocalPeer(uuid, range, from === undefined ? this.uuid : from) // dont need any routing info bla-bla.. since 
  }

  message (message) {
    let data = JSON.parse(message.data)
    if (data.successor) 
    {
      console.log('oh look my successor', data.successor.uuid)
      this.successor = this.CreateLocal(data.successor.uuid, new Range(this.uuid, data.successor.uuid))
      chord.Join(this.successor)
      this.fixFingers()
    }
    else if (data.id)
    {
      
    }
    else if (data.arrival)
    {
      // incoming arrival 
      
    }
  }

  fixFingers () {
    for (let i = 0; i < this.finger.M; i++)
    {
      let id = this.uuid + 2 ** i
      id %= chord.N

      this.finger.table[i].uuid = this.findSuccessor(id).uuid
      chord.Connect(this.uuid, id)
    }
  }

  lookup (data) {
    network.send('lookup-ACK', {
      to: data.from,
      from: this.uuid,
      lookup: this.findSuccessor(data.lookup).uuid
    })
  }

  findSuccessor (id) {
    if (this.predecessor && id < this.predecessor.uuid)
    {
      return this.predecessor
    }
    else if (this.successor.uuid && this.successor.contains(id))
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
      if (this.finger.table[i].uuid && this.finger.table[i].contains(id))
      {
        return this.finger.table[i]
      }
    }

    return this 
  }

  notify (p) {
    if (!this.predecessor || this.predecessor.contains(p))
    {
      if (this.predecessor)
      {
        this.predecessor.stabilize
      }
      this.predecessor = this.CreateLocal(p, new Range(p, this.uuid-1))

      this.fixFingers()
    }
  }

  async stabilize () {
    // ask predecessor p for its successor p.s
    // if p.s is not this, set p.s to this 

    try 
    {
      let v = await this.successor.predecessor
      if (v && this.successor.contains(v))
      {
        // this.successor = this.CreateLocal(v, new Range(this.uuid + 1, v - 1))
        this.successor.uuid = v
      }

      this.successor.notify
      this.fixFingers()
    }
    catch (e) 
    {
      // try again and if fail again then reconnect ?? 
      console.error('[stabilization] timeout error', e)
    } 
  }
}