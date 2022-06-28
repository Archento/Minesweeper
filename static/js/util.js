export function getRandomInt (max) {
  return Math.round(Math.random() * max)
}

export function colorize (num) {
  let color = 'lightgray'
  if (num === 1) color = 'blue'
  if (num === 2) color = 'darkgreen'
  if (num === 3) color = 'red'
  if (num > 3) color = 'darkred'
  return `<span style="color: ${color};">${num}</span>`
}

export const secret = ['KeyC', 'KeyH', 'KeyE', 'KeyA', 'KeyT', 'ShiftLeft']
