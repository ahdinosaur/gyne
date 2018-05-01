const { System } = require('../')

const config = require('./config')

const system = System(config, err => {
  if (err) throw err
})

system.on('network', function (message) {
  console.log('network', message)
})

system.on('volume', function (message) {
  console.log('volume', message)
})

system.on('stack', function (message) {
  console.log('stack', message)
})
