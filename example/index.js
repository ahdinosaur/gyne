const { System } = require('../')

const config = require('./config')
const on = {
  debug: console.log,
  info: console.log,
  warn: console.warn,
  error: console.error
}

const system = System(config, on)

system.up(err => {
  if (err) throw err

  system.down(err => {
    if (err) throw err
  })
})
