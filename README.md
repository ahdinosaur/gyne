# docker-up

_work in progress_

opinionated glue to manage a Docker swarm

built for [ButtCloud](http://buttcloud.org)

```shell
# npm install --save docker-up
```

## features

also known as, _what i needed for ButtCloud_:

* able to use remote stack files
* ensure all Docker systems are up
* bring one Docker volume up
* bring one Docker stack up
* bring one Docker stack down

## usage

### `{ System } = require('docker-up')`

### `System = require('docker-up').default`

### `system = system(config, on)`

### `system.up((err, info) => {})`

### `system.down((err) => {})`

`config` is object with:

* `docker`: options to `docker-remote-api`
* `stacks`: array of stack options
* `networks`: array of networks options
* `volumes`: array of volume options

where `on` is an object of functions with keys:

* `debug`
* `info`
* `warn`
* `error`

### `{ Stack } = require('docker-up')`

### `stack = Stack(docker, options, on)`

### `stack.up((err, info) => {})`

### `stack.down((err) => {})`

### `{ Network } = require('docker-up')`

### `network = Network(docker, options, on)`

### `network.up((err, info) => {})`

### `network.down((err) => {})`

### `{ Volume } = require('docker-up')`

### `volume = Volume(docker, options, on)`

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
