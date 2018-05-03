# docker-up

_work in progress_

opinionated glue to manage a Docker swarm

built for [ButtCloud](http://buttcloud.org)

```shell
# npm install --save docker-up
```

## features

also known as, _what i needed for ButtCloud_:

* able to configure fractal stacks
* able to use remote config files
* ensure all Docker systems are up
* ensure one Docker sub-system is up

## cli

### up

```shell
docker-up up ./example/config.json
```

### down

```shell
docker-up down ./example/config.json
```

## api

### `{ System } = require('docker-up')`

### `Stack = require('docker-up').default`

### `stack = system(config, context)`

### `stack.up((err, info) => {})`

### `stack.down((err) => {})`

`config` is object with:

* `name`: namespace for networks, volumes, services, or nested stacks
* `networks`: array of networks options
* `volumes`: array of volume options
* `services`: array of service options
* `stacks`: array of stack options

where `context` is an optional object with:

* `docker`: [`docker-remote-api`](https://github.com/mafintosh/docker-remote-api) options or instance

- `pretty`: whether to pretty print logs (default: `true`)
- `logStream`: where to stream logs, (default: if `pretty`, then [`pino-colada`](https://github.com/lrlna/pino-colada), else `process.stdout`)
- `log`: [`pino`](https://github.com/pinojs/pino) options or instance

### `{ Service } = require('docker-up')`

### `service = Service(config, context)`

### `service.up((err, info) => {})`

### `service.down((err) => {})`

### `{ Network } = require('docker-up')`

### `network = Network(config, context)`

### `network.up((err, info) => {})`

### `network.down((err) => {})`

### `{ Volume } = require('docker-up')`

### `volume = Volume(config, context)`

### `volume.up((err, info) => {})`

### `volume.down((err) => {})`

## license

The Apache License

Copyright &copy; 2018 Michael Williams

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
