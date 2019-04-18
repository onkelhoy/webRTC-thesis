export default class Range {
  constructor (a, b) {
    this.a = a 
    this.b = b 
    this.distance = Math.abs(this.a - this.b)
  }

  contains (id) {
    return id >= this.a && id <= this.a + this.distance || id >= this.b - this.distance && id <= this.b
  }
}