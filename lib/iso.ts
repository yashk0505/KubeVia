/**
 * Minimal isometric projection helpers.
 * Box-space coordinates: x = right axis, y = depth axis, z = height (up).
 * Projects to 2D screen space using a standard 30° isometric transform.
 */

export interface Point2D {
  x: number;
  y: number;
}

const COS30 = 0.866;

export function iso(x: number, y: number, z: number): Point2D {
  return {
    x: (x - y) * COS30,
    y: (x + y) * 0.5 - z,
  };
}

export function polyPoints(pts: Point2D[]): string {
  return pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
}

/** Builds the 3 visible faces (top, front, side) of an axis-aligned box. */
export function isoBox(
  x0: number,
  y0: number,
  zBase: number,
  w: number,
  d: number,
  h: number
) {
  const top = [
    iso(x0, y0, zBase + h),
    iso(x0 + w, y0, zBase + h),
    iso(x0 + w, y0 + d, zBase + h),
    iso(x0, y0 + d, zBase + h),
  ];
  const front = [
    iso(x0, y0, zBase),
    iso(x0 + w, y0, zBase),
    iso(x0 + w, y0, zBase + h),
    iso(x0, y0, zBase + h),
  ];
  const side = [
    iso(x0, y0, zBase),
    iso(x0, y0 + d, zBase),
    iso(x0, y0 + d, zBase + h),
    iso(x0, y0, zBase + h),
  ];
  return { top, front, side };
}
