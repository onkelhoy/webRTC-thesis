import '../style/master.scss'
import Peer from './peer'
import Chord from './chord'

let svg = null, chord = null, peer = null 

svg = document.querySelector('svg')

// init
chord = new Chord(4, svg)
peer  = new Peer(chord.M)

export default chord
