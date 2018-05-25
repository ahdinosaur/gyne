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

context

* debug = false
* pretty = false
* docker
  * request
  * host
  * version
* log
  * level
  * stream

stack config

* name?
* services?
* networks?
* volumes?

service config

up (context) (config) (cb)

down (context) (config) (cb)
