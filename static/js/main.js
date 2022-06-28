/* global Audio */
import { getRandomInt, colorize, secret } from './util.js'

/**
 * declaration
 */
const matrix = document.querySelector('#spielfeld')
const restartButton = document.querySelector('#restart-button')
const timerElement = document.querySelector('#timer')
const difficultyDropdown = document.querySelector('#difficulty-dropdown')
const soundCheckbox = document.querySelector('#soundcheck')

const columns = [] // cell store

// initialize audio
const winnerSound = new Audio('static/audio/winner.mp3')
winnerSound.volume = 0.2
const bombSound = new Audio('static/audio/bomb.mp3')
bombSound.volume = 0.2

let testing = false

const grid = {
  easy: 9,
  medium: 16,
  hard: 24
}
const bombs = {
  easy: 10,
  medium: 40,
  hard: 99
}

// initials
let gridSize = grid.easy
let amountOfBombs = bombs.easy
let gameHasStopped = false

// timer
const timer = {
  counter: 0,
  id: null,
  update () {
    this.counter++
    timerElement.innerHTML = `${this.counter} sec`
  },
  stop () {
    clearInterval(this.id)
    this.id = null
  },
  clear () {
    this.counter = 0
    timerElement.innerHTML = `${this.counter} sec`
  }
}

/**
 * Cell class for the individual cell objects
 */
class Cell {
  constructor (iAusArray, jAusArray) {
    this.x = iAusArray
    this.y = jAusArray
    this.bomb = false
    this.bombCount = 0
    this.revealed = false
    this.flag = false
    this.div = document.createElement('div')
    matrix.append(this.div) // direct link to html element
    this.div.innerHTML = '&nbsp;'
    this.div.addEventListener('click', () => {
      this.click()
    })
    this.div.addEventListener('contextmenu', (e) => {
      this.rightClick(e)
    })
  }

  click () {
    if (this.revealed || gameHasStopped || this.flag) return
    if (!timer.id) timer.id = setInterval(() => { timer.update() }, 1000)
    if (this.bomb) {
      if (soundCheckbox.checked) {
        bombSound.load()
        bombSound.play()
      }
      gameHasStopped = true // game stop flag
      timer.stop()
      showRemainingBombs()
    } else {
      this.reveal()
      if (this.bombCount === 0) {
        const surroundingCells = this.getSurroundingCells()
        surroundingCells.forEach(({ x, y }) => { // recursive
          const current = columns[x][y]
          current.bombCount === 0 ? current.click() : current.reveal()
        })
      }
    }
    checkIfWin()
  }

  rightClick (e) {
    e.preventDefault()
    if (!this.revealed && !gameHasStopped) {
      this.div.innerHTML = this.flag ? '&nbsp;' : '<span style="line-height: 90%;">&#9873;</span>'
      this.flag = !this.flag
    }
  }

  reveal () {
    if (this.revealed) return
    this.revealed = true
    this.div.classList.add('pressed')
    this.div.innerHTML = colorize(this.bombCount)
  }

  /**
   * @returns {Array} [...{ x: Number, y: Number }] (4, 6 or 9)
   */
  getSurroundingCells () {
    const surroundingCellCoordinates = []
    for (let i = Math.max(this.x - 1, 0); i <= Math.min(this.x + 1, gridSize - 1); i++) {
      for (let j = Math.max(this.y - 1, 0); j <= Math.min(this.y + 1, gridSize - 1); j++) {
        surroundingCellCoordinates.push({ x: i, y: j })
      }
    }
    return surroundingCellCoordinates
  }
}

/**
 * Erstellt ein zweidimensionales array im Speicher.
 * Beinhaltet jeweils ein Objekt vom Typ 'Cell'.
 * @param {Number} gridSize größe des Spielfeldes
 */
const init = (gridSize) => {
  timer.clear()
  columns.length = 0 // virtuelle Bereich leeren
  matrix.innerHTML = '' // visuellen Bereich leeren
  matrix.style.width = `${gridSize * 25}px`
  for (let i = 0; i < gridSize; i++) {
    const rows = []
    for (let j = 0; j < gridSize; j++) {
      rows.push(new Cell(i, j)) // erstellt jeweils ein Cell Object
    }
    columns[i] = rows
  }
}

const createBombs = (bombCount) => {
  while (bombCount > 0) {
    const randomX = getRandomInt(gridSize - 1)
    const randomY = getRandomInt(gridSize - 1)
    const currentCell = columns[randomX][randomY]

    if (!currentCell.bomb) {
      const cellCoordinates = currentCell.getSurroundingCells()
      cellCoordinates.forEach(({ x, y }) => { columns[x][y].bombCount++ })
      if (testing) currentCell.div.innerHTML = '*'
      currentCell.bomb = true
      bombCount--
    }
  }
}

const showRemainingBombs = () => {
  columns.forEach(row => {
    row.forEach(cell => {
      if (cell.bomb) cell.div.innerHTML = '<span style="line-height: 90%;">&#x1F4A3;</span>'
    })
  })
}

const checkIfWin = () => {
  let counter = 0
  columns.forEach(row => {
    row.forEach(cell => {
      if (cell.revealed) counter++
    })
  })
  if (counter === gridSize * gridSize - amountOfBombs) {
    if (soundCheckbox.checked) {
      winnerSound.load()
      winnerSound.play()
    }
    gameHasStopped = true
    timer.stop()
    timerElement.innerHTML = `Toll, so lange gebraucht: ${timer.counter}s`
  }
}

/**
 * game init
 */
const initGame = (cellcount, bombcount) => {
  gameHasStopped = false
  init(cellcount)
  amountOfBombs = bombcount
  createBombs(bombcount)
}
initGame(grid.easy, bombs.easy)

/**
 * DOM interactions
 */
restartButton.addEventListener('click', () => {
  timer.stop()
  timer.clear()
  initGame(grid[difficultyDropdown.value], bombs[difficultyDropdown.value])
})

difficultyDropdown.addEventListener('change', () => {
  timer.stop()
  timer.clear()
  const diffVal = difficultyDropdown.value
  gridSize = grid[diffVal]
  amountOfBombs = bombs[diffVal]
  initGame(gridSize, amountOfBombs)
})

/**
 * EXTRA
 */
const buffer = []
document.addEventListener('keydown', (e) => {
  buffer.push(e.code)
  if (buffer.length > 6) buffer.shift()
  if (JSON.stringify(buffer) === JSON.stringify(secret)) {
    testing = !testing
    initGame(grid[difficultyDropdown.value], bombs[difficultyDropdown.value])
  }
})
