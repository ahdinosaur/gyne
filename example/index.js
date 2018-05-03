const { System } = require('../')

const config = require('./config')

const system = System(config)

system.up(err => {
  if (err) throw err

  system.down(err => {
    if (err) throw err
  })
})
