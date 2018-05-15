module.exports = Service

function Service (config) {
  const { name, image } = config

  return {
    Name: name,
    TaskTemplate: {
      ContainerSpec: {
        Image: image
      }
    }
  }
}
