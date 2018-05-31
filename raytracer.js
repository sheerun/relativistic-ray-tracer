const util = require('./util')

const ORIGIN = [0, 0, 0, 0]
const DEFAULT_OBJ_COLOR = 255
const DEFAULT_BG_COLOR = 0

function map3 (arr, fn) {
  return [fn(arr[0]), fn(arr[1]), fn(arr[2]), fn(arr[3])]
}

function sub3 (A, B) {
  return [A[0] - B[0], A[1] - B[1], A[2] - B[2]]
}

function sub04 (a, B) {
  return [a - B[0], a - B[1], a - B[2], a - B[3]]
}

function add4 (A, B) {
  return [A[0] + B[0], A[1] + B[1], A[2] + B[2], A[3] + B[3]]
}

// A ray in Minkowski space.
class Ray {
  constructor (start, direction) {
    this.start = start
    this.direction = direction
    this.start_3 = this.start.slice(1)
  }

  get direction_3 () {
    return this.direction.slice(1)
  }

  boost (boost_matrix) {
    return new Ray(
      map3(boost_matrix, e => util.dot4(e, this.start)),
      map3(boost_matrix, b => util.dot4(b, this.direction))
    )
  }

  translate (offset) {
    return new Ray(add4(this.start, offset), this.direction)
  }
}

class Sphere {
  constructor (radius, color_function = () => DEFAULT_OBJ_COLOR) {
    this.radius = radius
    this._radius_sq = Math.pow(radius, 2)
    this.color_function = color_function
  }

  get_intersection_and_color(ray) {
    const intersection = this._get_intersection(ray)

    if (intersection !== null) {
      return [intersection, this.color_function(intersection)]
    } else {
      return [null, null]
    }
  }

  _get_intersection(ray) {
    const x0 = ray.start_3
    const d = ray.direction_3

    const a = util.dot3(d, d)
    const b = 2 * util.dot3(x0, d)
    const c = util.dot3(x0, x0) - this._radius_sq

    const solns = util.quadratic_eqn_roots(a, b, c)

    for (let i = 0; i < solns.length; i++) {
      const root = solns[i]
      if (root >= 0) {
        return [x0[0] + root * d[0], x0[1] + root * d[1], x0[2] + root * d[2]]
      }
    }

    return null
  }
}

// A cylinder, defined by its axis line segment, radius, and color.
class Cylinder {
  constructor (start, end, radius, color = DEFAULT_BG_COLOR) {
    this.start = start
    this.end = end
    this.radius = radius
    this.color = color
    this._radius_sq = Math.pow(radius, 2)
    this._axis = sub3(end, start)
    this._axis_sq = util.dot3(this._axis, this._axis)
  }

  get_intersection_and_color (ray) {
    const intersection = this._get_intersection(ray)
    if (intersection != null) {
      return [intersection, this.color]
    } else {
      return [null, null]
    }
  }

  _get_intersection (ray) {
    const x0 = ray.start_3
    const d = ray.direction_3

    const d_proj_dot = util.dot3(d, this._axis)

    const d_proj = [
      d[0] - d_proj_dot / this._axis_sq * this._axis[0],
      d[1] - d_proj_dot / this._axis_sq * this._axis[1],
      d[2] - d_proj_dot / this._axis_sq * this._axis[2]
    ]

    const q = [
      x0[0] - this.start[0],
      x0[1] - this.start[1],
      x0[2] - this.start[2]
    ]
    const q_proj_dot = util.dot3(q, this._axis)
    const q_proj = [
      q[0] - q_proj_dot / this._axis_sq * this._axis[0],
      q[1] - q_proj_dot / this._axis_sq * this._axis[1],
      q[2] - q_proj_dot / this._axis_sq * this._axis[2]
    ]

    const a = util.dot3(d_proj, d_proj)
    if (a == 0) {
      return null
    }

    const b = 2 * util.dot3(d_proj, q_proj)
    const c = util.dot3(q_proj, q_proj) - this._radius_sq

    const solns = util.quadratic_eqn_roots(a, b, c)

    for (let i = 0; i < solns.length; i++) {
      const root = solns[i]
      if (root >= 0) {
        const x = [
          x0[0] + root * d[0],
          x0[1] + root * d[1],
          x0[2] + root * d[2]
        ]
        // parameter for the cylinder axis line segment
        const s =
          util.dot3(
            [x[0] - this.start[0], x[1] - this.start[1], x[2] - this.start[2]],
            this._axis
          ) / this._axis_sq
        if (s >= 0 && s <= 1) {
          return x
        }
      }
    }

    return null
  }
}

class CompositeObject {
  constructor (objs) {
    this.objs = objs
  }

  get_intersection_and_color (ray) {
    const x0 = ray.start_3
    let min_dist = null
    let intersection = null
    let color = null
    for (let i = 0; i < this.objs.length; i++) {
      const obj = this.objs[i]
      const [int, c] = obj.get_intersection_and_color(ray)
      if (c !== null) {
        const dist = util.norm3(sub3(int, x0))
        if (!min_dist || dist < min_dist) {
          min_dist = dist
          intersection = int
          color = c
        }
      }
    }

    return [intersection, color]
  }
}

class RectangularPrism {
  constructor (width, height, depth, segment_radius, color = DEFAULT_OBJ_COLOR) {
    this.width = width
    this.height = height
    this.depth = depth
    this.segment_radius = segment_radius
    this.color = color
    this._cylinders = new CompositeObject(this._get_cylinders())
  }

  _get_cylinders () {
    const x = this.width / 2.0 + this.segment_radius
    const y = this.height / 2.0 + this.segment_radius
    const z = this.depth / 2.0 + this.segment_radius

    const endpoints = [
      // "front" rectangle
      [[+x, +y, +z], [+x, -y, +z]],
      [[+x, -y, +z], [-x, -y, +z]],
      [[-x, -y, +z], [-x, +y, +z]],
      [[-x, +y, +z], [+x, +y, +z]],
      // "back" rectangle
      [[+x, +y, -z], [+x, -y, -z]],
      [[+x, -y, -z], [-x, -y, -z]],
      [[-x, -y, -z], [-x, +y, -z]],
      [[-x, +y, -z], [+x, +y, -z]],
      //  connect the rectangles to make a prism
      [[+x, +y, +z], [+x, +y, -z]],
      [[+x, -y, +z], [+x, -y, -z]],
      [[-x, -y, +z], [-x, -y, -z]],
      [[-x, +y, +z], [-x, +y, -z]]
    ]
    return endpoints.map(
      e => new Cylinder(e[0], e[1], this.segment_radius, this.color)
    )
  }
  get_intersection_and_color (ray) {
    return this._cylinders.get_intersection_and_color(ray)
  }
}

// An "ray tracer" modeled after a ideal pinhole camera.
// The pinhole of the camera is at the (spatial) origin, and it faces the +z
// direction. Incoming light rays enter through the pinhole and strike a flat
// screen at z = -`focal_length`. For a given picture, all of the light rays
// enter through the pinhole at the same time (even though light rays at the
// edges of the picture would have struck the screen later).
// The image must then be flipped (as with all pinhole cameras) to produce the
// correctly oriented image; that is, an ray that hit the screen at (-x, -y,
// -z) corresponds to the point (x, y) in the final image.
//        +z
//     \   |   /
//      v  v  v  direction of light
//       \ | /
//        \|/
//         *  pinhole (z = 0)
//        /|\
//       v v v
//     _/__|__\_  screen
//        -z
// If a ray hit the screen at (-x, -y, -z), then we can find the point on the
// object that emitted the ray using backward ray tracing. The backward ray
// starts at the pinhole at (0, 0, 0), and a point on the ray is (x, y, z).
// Considered as points in Minkowski space, the light entered the pinhole at
// (`time`, 0, 0, 0), and the point on the ray is at (`time`-t1, x, y, z),
// where t1 is the amount of time taken for the original (non-backward) ray to
// go from (x, y, z) to (0, 0, 0).
// These ideas were taken from  "Relativistic Ray-Tracing: Simulating the
// Visual Appearance of Rapidly Moving Objects" (1995) by Howard, Dance, and
// Kitchen.
// Note also that because light rays are projected onto a flat screen, there
// will be distortion around the edges of the image, since an object that
// subtends a certain angle will be projected onto a larger surface area when
// its position vector makes a larger angle with respect to the z axis.
class RayTracer {
  constructor (canvas, focal_length, bg_color = DEFAULT_BG_COLOR) {
    this.context = canvas.getContext('2d')
    this.image_width = canvas.width
    this.image_height = canvas.height
    this.bg_value = bg_color
    this.focal_length = 0.3
  }

  render (moving_object, time) {
    const boost_matrix = util.lorentz_boost(moving_object.beta)

    const trace_ray = (x, y) => {
      const origin_to_image_time = util.norm3([x, y, this.focal_length])
      const image_coords = [-origin_to_image_time, x, y, this.focal_length]
      const camera_frame_ray = new Ray(ORIGIN, image_coords).translate([
        time,
        0,
        0,
        0
      ])

      const object_frame_ray = camera_frame_ray
        .translate(sub04(0, moving_object.offset))
        .boost(boost_matrix)
      const [
        intersection,
        color
      ] = moving_object.obj.get_intersection_and_color(object_frame_ray)

      if (color) {
        return color
      } else {
        return this.bg_value
      }
    }

    const image_value = (i, j) => {
      const ratio = this.image_width / this.image_height
      const x = (i / this.image_width - 0.5)*ratio
      const y = -(j / this.image_height - 0.5)
      return trace_ray(x, y, boost_matrix, time)
    }

    const width = this.image_width
    const height = this.image_height
    const data = this.context.getImageData(0, 0, width, height)
    const d = data.data

    let i = 0
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const color = image_value(x, y, boost_matrix, time)
        d[i] = color
        d[++i] = color
        d[++i] = color
        d[++i] = 255
        i += 1
      }
    }

    this.context.putImageData(data, 0, 0)
  }
}

module.exports = {
  Cylinder,
  Ray,
  RectangularPrism,
  RayTracer,
  Sphere
}
