import bigInt from 'big-integer'
import chord from './main'

export default function UUID (id) {
  let b = bigInt(id, 16)
  return Number(b.mod(chord.N).value)
}