const { camelCase, flow, upperFirst } = require('lodash')

// https://github.com/lodash/lodash/pull/942#issuecomment-73395622
module.exports = flow(camelCase, upperFirst)
