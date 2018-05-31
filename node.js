const fs = require('fs')
const leftpad = require('leftpad')
const { RayTracer, RectangularPrism } = require('./raytracer')

function example () {
  const Canvas = require('canvas')
  const c = new Canvas()
  c.width = 400
  c.height = 225

  const cube = new RectangularPrism(100, 100, 100, 1)

  const offset = [500, 0, 0, 100]

  const moving_cube = {
    obj: cube,
    beta: [0.4, 0, 0],
    offset
  }

  const ray_tracer = new RayTracer(c)

  for (let time = 0; time < 1400; time += 50) {
    ray_tracer.render(moving_cube, time)
    const filename = 'frames/' + leftpad(time, 4) + '.png'
    console.log('Rendering: ' + filename)
    fs.writeFileSync(filename, c.toBuffer())
  }
}

example()
