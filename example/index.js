const { System } = require('../')

const config = require('./config')
const on = {
  event: console.log,
  warn: console.warn,
  error: console.error
}

const system = System(config, on)

system.up(err => {
  if (err) throw err
})
