# longshore

[![travis](https://travis-ci.org/buttcloud/longshore.svg?branch=master)](https://travis-ci.org/buttcloud/longshore) [![codecov](https://codecov.io/gh/buttcloud/longshore/branch/master/graph/badge.svg)](https://codecov.io/gh/buttcloud/longshore)

_work in progress_

opinionated glue to manage a Docker swarm

built for [ButtCloud](http://buttcloud.org)

```shell
# npm install --save longshore
```

## features

also known as, _what we need for ButtCloud_:

* able to configure fractal stacks
* able to use remote config files
* ensure all Docker systems are up
* ensure one Docker sub-system is up

## cli

### up

```shell
longshore stack up ./example/config.json
```

### down

```shell
longshore stack down ./example/config.json
```

## api

### `{ System } = require('longshore')`

### `Stack = require('longshore').default`

### `stack = system(context)`

where `context` is an optional object with:

* `docker`: [`docker-remote-api`](https://github.com/mafintosh/docker-remote-api) options or instance

- `debug`: whether to include debug in logs (default: `false`)
- `pretty`: whether to pretty print logs (default: `false`)
- `logStream`: where to stream logs, (default: if `pretty`, then [`pino-colada`](https://github.com/lrlna/pino-colada), else `process.stdout`)
- `log`: [`pino`](https://github.com/pinojs/pino) options or instance

### `stack.up(config)((err, info) => {})`

### `stack.down(config)((err) => {})`

`config` is object with:

* `Name`: (optional) namespace for networks, volumes, services, or nested stacks
* `Networks`: array of networks options
* `Volumes`: array of volume options
* `Services`: array of service options
* `Stacks`: array of stack options

### `{ Service } = require('longshore')`

### `service = Service(context)`

### `service.up(config)(err, info) => {})`

### `service.down(config)(err) => {})`

`config` matches [Docker API Service config](https://docs.docker.com/engine/api/v1.37/#operation/ServiceCreate)

### `{ Network } = require('longshore')`

### `network = Network(context)`

### `network.up(config)(err, info) => {})`

### `network.down(config)(err) => {})`

`config` matches [Docker API Network config](https://docs.docker.com/engine/api/v1.37/#operation/NetworkCreate)

### `{ Volume } = require('longshore')`

### `volume = Volume(context)`

### `volume.up(config)(err, info) => {})`

### `volume.down(config)(err) => {})`

`config` matches [Docker API Volume config](https://docs.docker.com/engine/api/v1.37/#operation/VolumeCreate)

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
