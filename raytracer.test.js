const raytracer = require('./raytracer')

describe('Cylinder intersection', () => {
  test('cylinder to intersections othogonal', () => {
    const cylinder = new raytracer.Cylinder([1, 0, -1], [1, 0, 1], 1)
    const [intersection, color] = cylinder.get_intersection_and_color(
      new raytracer.Ray([0, 3, 0, 0], [0, -1, 0, 0])
    )
    expect(intersection).toEqual([2, 0, 0])
  })

  test('cylinder to intersections beyond edge', () => {
    const cylinder = new raytracer.Cylinder([0, 0, -1], [0, 0, 1], 1)
    const [intersection, color] = cylinder.get_intersection_and_color(
      new raytracer.Ray([0, 2, 2, 0], [0, -1, 0, 0])
    )
    expect(intersection).toEqual(null)
  })

  test('cylinder to intersections on edge', () => {
    const cylinder = new raytracer.Cylinder([0, 0, -1], [0, 0, 1], 1)
    const [intersection, color] = cylinder.get_intersection_and_color(
      new raytracer.Ray([0, 2, 0, 1], [0, -1, 0, 0])
    )
    expect(intersection).toEqual([1, 0, 1])
  })

  test('cylinder two intersections orthogonal', () => {
    const cylinder = new raytracer.Cylinder([0, 0, -2], [0, 0, 2], 1)
    const [intersection, color] = cylinder.get_intersection_and_color(
      new raytracer.Ray([0, 2, 0, 0], [0, -1, 0, 1])
    )
    expect(intersection).toEqual([1, 0, 1])
  })

  test('no intersections parallel to axis', () => {
    const cylinder = new raytracer.Cylinder([0, 0, -1], [0, 0, 1], 1)
    const [intersection, color] = cylinder.get_intersection_and_color(
      new raytracer.Ray([0, 2.0, 0, 2], [0, 0, 0, -1])
    )
    expect(intersection).toEqual(null)
  })
  test('no intersections on axis', () => {
    const cylinder = new raytracer.Cylinder([0, 0, -1], [0, 0, 1], 1)
    const [intersection, color] = cylinder.get_intersection_and_color(
      new raytracer.Ray([0, 0, 0, 2], [0, 0, 0, -1])
    )
    expect(intersection).toEqual(null)
  })
})

describe('Box intersection', () => {
  test('basic', () => {
    const box = new raytracer.RectangularPrism(2, 2, 2, 0.1)
    const [intersection, color] = box.get_intersection_and_color(
      new raytracer.Ray([0, 2, 1, 0], [0, -1, 0, 0])
    )
    expect(intersection).toEqual([1.1, 1.0, 0])
  })
})
