const test = require('ava')

const MockDockerApi = require('../helpers/docker')
const { DOCKER_API_VERSION } = require('../../defaults')

const Network = require('../../resources/network')

test.cb('network.create happy path', t => {
  const givenConfig = {
    Name: 'test_network'
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

  function handleRequest (method, path, options, callback) {
    t.is(method, expectedMethod)
    t.is(path, expectedPath)
    t.deepEqual(options, expectedOptions)
    callback(null, givenResponse)
  }

  const network = Network({
    docker: MockDockerApi({ handleRequest }),
    log: {
      level: 'fatal'
    }
  })
  const continuable = network.create(givenConfig)
  continuable((err, result) => {
    t.is(result, expectedResult)
    t.end(err)
  })
})
