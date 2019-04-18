export default class Finger {
  constructor (m) {
    this.M = m 

    this.table = []
  }

  get successor () {
    return this.table[0]
  }
}