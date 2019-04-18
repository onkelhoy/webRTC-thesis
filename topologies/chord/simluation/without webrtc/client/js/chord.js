export default class Chord {
  constructor (m, svg) {
    this.m = m 
    this.n = 2 ** m 
    this.svg = svg 

    let ring = svg.querySelector('circle.chord-ring')
    ring.setAttribute('cx', 220)
    ring.setAttribute('cy', 220)
    ring.setAttribute( 'r', 200)
  }

  get M () {
    return this.m 
  }

  get N () {
    return this.n 
  }

  /**
   * 
   * @param {Peer} peer 
   */
  Join (peer) {
    const pos = this.GetPos(peer.uuid)

    let node = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
    node.setAttribute('cx', pos.x)
    node.setAttribute('cy', pos.y)
    node.setAttribute('r', 10)

    node.classList.add('node')

    this.svg.appendChild(node)
  }

  GetPos (uuid) {
    let angle = (Math.PI * 2 / this.n) * uuid - Math.PI/2
    return {
      x: 220 + Math.cos(angle) * 200,
      y: 220 + Math.sin(angle) * 200
    }
  }

  Connect (uuid, next) {
    let line = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    let a = this.GetPos(uuid)
    let b = this.GetPos(next)

    let angle = Math.atan2(a.y-b.y, a.x-b.x)
    let c = { x: b.x + Math.cos(angle + Math.PI / 6) * 20, y: b.y + Math.sin(angle + Math.PI/6) * 20 }
    let d = { x: b.x + Math.cos(angle - Math.PI / 6) * 20, y: b.y + Math.sin(angle - Math.PI/6) * 20 }

    line.setAttribute('d', `M${a.x},${a.y} L${b.x},${b.y} L${c.x},${c.y} L${b.x},${b.y} L${d.x},${d.y}`)

    this.svg.appendChild(line)
  }

  Leave () {

  }
} 