const { RayTracer, RectangularPrism, Sphere } = require('./raytracer')
const util = require('./util')

var canvas = document.getElementById('renderCanvas')

canvas.width = Math.floor(160)
canvas.height = Math.floor(90)
var ctx = canvas.getContext("2d");
ctx.fillStyle = "black";
ctx.fillRect(0, 0, canvas.width, canvas.height);

let current = 0;

function startAnimating (options) {
  current += 1;

  const scale = 1
  canvas.width = Math.floor(160 * options.scale)
  canvas.height = Math.floor(90 * options.scale)
  var ctx = canvas.getContext("2d");
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);


  let obj

  if (options.type == "cube") {
    obj = new RectangularPrism(80, 80, 80, 2)
  } else {
    obj = new Sphere(60, util.checkerboard)
  }

  const moving_cube = {
    obj,
    beta: options.beta,
    offset: options.offset
  }

  const ray_tracer = new RayTracer(options.canvas)
  const run = current;

  function animate () {
    now = performance.now()
    elapsed = now - then
    total = now - start

    if (total < 10000 && run === current) {
      requestAnimationFrame(animate)
    }

    if (elapsed > fpsInterval) {
      then = now - elapsed % fpsInterval
      ray_tracer.render(moving_cube, total / 10)
    }
  }

  let then
  let start = performance.now()

  fpsInterval = 1000 / options.fps
  then = performance.now()
  startTime = then
  animate()
}

document.getElementById('render').addEventListener('click', () => {
  const type = document.getElementById('type').value
  const fps = parseInt(document.getElementById('fps').value, 10)
  const betax = parseFloat(document.getElementById('betax').value, 10)
  const betay = parseFloat(document.getElementById('betay').value, 10)
  const betaz = parseFloat(document.getElementById('betaz').value, 10)
  const offsett = parseFloat(document.getElementById('offsett').value, 10)
  const offsetx = parseFloat(document.getElementById('offsetx').value, 10)
  const offsety = parseFloat(document.getElementById('offsety').value, 10)
  const offsetz = parseFloat(document.getElementById('offsetz').value, 10)
  const scale = parseFloat(document.getElementById('scale').value, 10)

  startAnimating({
    type,
    fps,
    beta: [betax, betay, betaz],
    offset: [offsett, offsetx, offsety, offsetz],
    canvas,
    scale
  })
})

