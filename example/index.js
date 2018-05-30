const { join } = require('path')

const Dock = require('../')
const waterfall = require('../util/waterfall')

const config = join(__dirname, './config.yml')

const context = {
  log: {
    level: 'debug',
    pretty: true
  }
}

const dock = Dock(context)

waterfall([
  () => dock.diff(config),
  diff => {
    console.log('up diff', JSON.stringify(diff, null, 2))
    return dock.patch(diff)
  },
  () => dock.diff({}),
  diff => {
    console.log('down diff', JSON.stringify(diff, null, 2))
    return dock.patch(diff)
  }
])().fork(console.error, () => console.log('done'))
