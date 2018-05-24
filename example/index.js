const { join } = require('path')

const Dock = require('../')
const waterfall = require('../util/waterfall')

const config = join(__dirname, './config.yml')

const options = {
  pretty: true,
  debug: true
}

const dock = Dock(options)

waterfall([
  () => dock.diff(config),
  diff => {
    console.log('up diff', diff)
    return dock.patch(diff)
  }
  /*
  () => dock.diff({}),
  diff => {
    console.log('down diff', diff)
    return dock.patch(diff)
  },
  */
])().fork(console.error, () => console.log('done'))
