what to do about service?

inspecting a service is different from creating / updating a service

---

* what should the config format be?

---

input up config

walk config tree

* fetch remote config on-demand
* output flat arrays of networks, services, volumes

get next api config

get current api config (from inspect)

diff

turn diff into commands

run api config

---

input up config

walk config tree

* fetch remote configs
* take note of networks, services, volumes for total prune

---

cli changes

* remove most commands, only system up and down
* output diff, "do you want to change system?"

---

open questions

* names
  * dock
  * longshore
* components
  * dock config: descriptor
  * docker api config: config
  * docker api endpoints: resources
* resource
  * hasUpdate: whether resource has an update method
  * validateDescriptor: (descriptor) => Validation
  * inspectFields: object describing which fields to pick from returned inspect
  * nameField: the name field returned by inspect
  * idField: the id field returned by inspect
  * createConfig: (descriptor) => config
  * onUpdate: (current, next) => ({ method, config, params })
    * run on matching names
  * config
    * fields: which fields
    * create
    * onUpdate
* resources
  * network
    * hasUpdate: false
    * idField: 'ID'
    * validate: (descriptor) => Validation
    * config
      * fields: which fields
      * create
      * onUpdate
  * service
    * hasUpdate: true
    * idField: 'ID'
    * diffConfig
  * volume
    * hasUpdate: false
    * idField: 'Name'
    * listField: 'Volumes'
* flow

  * diff
    * given dock config
    * convert to docker api config
    * fetch existing docker api config
    * diff
      * if resource hasUpdate, special case
        * inspected docker api config will be wrapped
        * check inside for diff
        * use outside as patch
      * otherwise
        * need to check whether to remove and re-create

* diff
  * given stack config, convert to next stack spec
  * inspect current stack
  * diff current with next spec
* patch

  * turn diff into operations
  * execute operations

* specs
  * network
  * service
  * stack
  * volume
  * util
    * merge
    * diff
* configs
  * network
  * service
  * stack
  * volume
* resources
  * util
    * generic
* util

* network
  * spec
  * config
  * resource
* volume
  * spec
  * config
  * resource
* service
  * spec
  * config
  * resource
* stack
  * spec
  * config
  * resource
* spec
  * diff
  * merge
  * patch (diff -> ops)
  * namespace
* resource
