const test = require('ava')
const Future = require('fluture')

const MockDockerApi = require('../helpers/docker')
const Context = require('../../context/create')
const { DOCKER_API_VERSION } = require('../../util/docker')

const Network = require('../../resources/network')

test('network.create happy path', t => {
  const givenConfig = {
    name: 'test_network'
  }
  const givenResponse = {
    Id: 'da6f4d2f24db20a5e24be83233a22457928e0d17a0e0d09417aec12430d8fd0e',
    Warning: ''
  }
  const expectedMethod = 'POST'
  const expectedPath = '/networks/create'
  const expectedOptions = {
    version: DOCKER_API_VERSION,
    json: givenConfig
  }
  const expectedResult = givenResponse.Id

  function handleRequest (method, path, options) {
    t.is(method, expectedMethod)
    t.is(path, expectedPath)
    t.deepEqual(options, expectedOptions)
    return Future.of(givenResponse)
  }

  const network = Network(
    Context({
      docker: MockDockerApi({ handleRequest }),
      log: {
        level: 'fatal'
      }
    })
  )

  return network.create(givenConfig).value(result => {
    t.is(result, expectedResult)
  })
})
