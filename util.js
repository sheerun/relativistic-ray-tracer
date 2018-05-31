// Return roots of ax^2+bx+c *in ascending order*.
function quadratic_eqn_roots (a, b, c) {
  const discriminant = Math.pow(b, 2) - 4 * a * c
  if (discriminant < 0) {
    return []
  } else if (discriminant == 0) {
    return [-b / (2 * a)]
  } else {
    const sqrt_discriminant = Math.sqrt(discriminant)
    return [
      (-b - sqrt_discriminant) / (2 * a),
      (-b + sqrt_discriminant) / (2 * a)
    ]
  }
}

function dot3 (A, B) {
  return A[0] * B[0] + A[1] * B[1] + A[2] * B[2]
}

function norm3 (A) {
  return Math.sqrt(A[0] * A[0] + A[1] * A[1] + A[2] * A[2])
}

function dot4 (A, B) {
  return A[0] * B[0] + A[1] * B[1] + A[2] * B[2] + A[3] * B[3]
}

// Computes outer product of two vectors
function outer (A, B) {
  return A.map(a => B.map(b => a * b))
}

// Return 4x4 numpy array of Lorentz boost for the velocity 3-vector.
// This is a passive transformation into a reference frame moving at velocity
// = beta with respect to the original frame. Note that c=1.
function lorentz_boost (b) {
  const b2 = b[0] * b[0] + b[1] * b[1] + b[2] * b[2]

  if (b2 == 0) {
    return [[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]]
  }

  const g = 1 / Math.sqrt(1 - b2)
  const o = outer(b, b)

  return [
    [g, -g * b[0], -g * b[1], -g * b[2]],
    [
      -g * b[0],
      1 + (g - 1) * o[0][0] / b2,
      (g - 1) * o[0][1] / b2,
      (g - 1) * o[0][2] / b2
    ],
    [
      -g * b[1],
      (g - 1) * o[1][0] / b2,
      1 + (g - 1) * o[1][1] / b2,
      (g - 1) * o[1][2] / b2
    ],
    [
      -g * b[2],
      (g - 1) * o[2][0] / b2,
      (g - 1) * o[2][1] / b2,
      1 + (g - 1) * o[2][2] / b2
    ]
  ]
}

// Return (inclination, azimuth) for the given cartesian coords.
function spherical_angles (point) {
  const [x, y, z] = point
  const radius = Math.sqrt(dot3(point, point))
  const theta = Math.acos(z / radius)
  const phi = Math.atan2(y, x) + Math.PI
  return [theta, phi]
}

function checkerboard (point) {
  const [theta, phi] = spherical_angles(point)
  const n_theta = Math.floor(theta / Math.PI * 12)
  const n_phi = Math.floor(phi / (2 * Math.PI) * 12)

  return 127 + 128 * ((n_theta + n_phi) % 2)
}

module.exports = {
  quadratic_eqn_roots,
  lorentz_boost,
  spherical_angles,
  checkerboard,
  outer,
  dot3,
  dot4,
  norm3
}
