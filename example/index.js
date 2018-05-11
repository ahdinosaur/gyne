const { join } = require('path')
const step = require('callstep')

const { Stack } = require('../')

const config = join(__dirname, './config.json')
const stack = Stack({
  pretty: true,
  debug: true
})

step.series([
  stack.up(config),
  stack.up(config),
  stack.down(config),
  stack.down(config)
])(err => {
  if (err) throw err
})
