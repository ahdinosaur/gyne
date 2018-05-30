const test = require('ava')
const { join } = require('path')
// const Docker = require('../util/docker')
const Future = require('fluture')

const Gyne = require('../')
const config = join(__dirname, '../example/config.yml')

test('gyne integration', t => {
  const gyne = Gyne({
    log: {
      level: 'fatal'
    }
  })
  // const docker = Docker()

  return gyne
    .diff(config)
    .chain(diff => gyne.patch(diff))
    .chain(() => {
      t.pass()
      // TODO test stack is up
      return Future.of(null)
    })
    .chain(() => gyne.diff({}))
    .chain(diff => gyne.patch(diff))
    .chain(() => {
      t.pass()
      // TODO test stack is down
      return Future.of(null)
    })
    .promise()
})
