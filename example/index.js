const { join } = require('path')

const Dock = require('../')

const config = join(__dirname, './config.yml')

const options = {
  pretty: true,
  debug: true
}

const dock = Dock(options)

dock
  .up(config)
  .chain(() => dock.up(config))
  .chain(() => dock.down(config))
  .chain(() => dock.down(config))
  .fork(console.error, () => console.log('done'))
