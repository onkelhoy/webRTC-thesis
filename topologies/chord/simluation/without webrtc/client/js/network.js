export default class Network {
  constructor () {
    this.socket = new WebSocket('ws://localhost:3000/')
    this.socket.onmessage = this.receive.bind(this)

    this.hooks = []
  }

  receive (message) {
    let data = JSON.parse(message.data)

    if (data.type && this.hooks[data.type])
    {
      for (let hook of this.hooks[data.type])
      {
        hook(data)
      }
    }
  }

  registerHook (key, callback) { // maybe should register key on uuid as well (tailored)
    if (!this.hooks[key])
    {
      this.hooks[key] = []
    }

    this.hooks[key].push(callback)
  }

  send (type, data) {
    data.stamp = (new Date()).getTime()
    data.type = type 
    let stringified = JSON.stringify(data)
    this.socket.send(stringified)
  }

  Ask (type, data) {
    this.send(type, data)

    // register this as a temp hook, once it receives it should be removed from hook list 
    return new Promise ((resolve, reject) => {
      let callback = data2 => {
        // remove it 
        this.removeHook(type+'-ACK', callback)

        return resolve(data2)
      }

      setTimeout(u => {
        this.removeHook(type+'-ACK', callback)
        return reject('5000ms timeout')
      }, 5000) // 5s timeout 

      this.registerHook(type+'-ACK', callback)
    })
  }

  removeHook (key, callback) {
    if (!this.hooks[key])
    {
      return 
    }

    for (let i = 0; i < this.hooks[key].length; i++)
    {
      if (this.hooks[key][i] === callback)
      {
        this.hooks[key].splice(i, 1)
      }
    }
  }
}