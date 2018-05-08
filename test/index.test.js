const test = require('ava')
const { join } = require('path')
// const Docker = require('docker-remote-api')
const step = require('callstep')

const { Stack } = require('../')
const config = join(__dirname, '../example/config.json')

test.cb('stack integration', t => {
  const stack = Stack({
    log: {
      level: 'fatal'
    }
  })
  // const docker = Docker()

  step.series([
    stack.up(config),
    cb => {
      // TODO test stack is up
      cb()
    },
    stack.down(config),
    cb => {
      // TODO test stack is down
      cb()
    }
  ])(t.end)
})
