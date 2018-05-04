const { join } = require('path')

const { Stack } = require('../')

const config = join(__dirname, './config.json')
const stack = Stack({
  pretty: true,
  debug: true
})

stack.up(config)(err => {
  if (err) throw err

  stack.down(config)(err => {
    if (err) throw err
  })
})
