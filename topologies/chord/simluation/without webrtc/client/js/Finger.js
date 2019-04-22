import Range from './range'

export default class Finger {
  constructor (m) {
    this.M = m 

    this.table = []
  }

  init (uuid, N, createPeer) {
    for (let i = 0; i < this.M; i++)
    {
      let id = uuid + 2 ** i
      id %= N

      let nextid = uuid + 2 ** (i + 1) - 1
      nextid %= N 

      this.table[i] = createPeer(null, new Range(id, nextid), uuid)
    }
  }

  get successor () {
    return this.table[0]
  }
}