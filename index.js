const Network = require('./resources/network')
const Service = require('./resources/service')
const Stack = require('./resources/stack')
const Volume = require('./resources/volume')

module.exports = {
  default: Stack,
  Network,
  Service,
  Stack,
  Volume
}
