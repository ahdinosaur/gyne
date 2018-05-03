const { Stack } = require('../')

const config = require('./config')

const stack = Stack(config)

stack.up(err => {
  if (err) throw err

  stack.down(err => {
    if (err) throw err
  })
})
