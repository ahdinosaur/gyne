const test = require('tape')

const dockerUp = require('../')

test('docker-up', function (t) {
  t.ok(dockerUp, 'module is require-able')
  t.end()
})
