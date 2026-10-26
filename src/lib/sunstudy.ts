// Geometry for the sun study, shared by the server render and the slider script.
import { sunPosition, solarNoon, daylight, fmtDate, fmtTime } from "./sun";

type Pt = [number, number];
export interface Plan { latitude: number; longitude: number; timezone: number; boundary: Pt[]; roofs: { name: string; height_m: number; outline: Pt[] }[] }

export const SKY = 120; // sky diagram radius in its own viewBox units

export function frame(plan: Plan, pad = 3) {
  const xs = plan.boundary.map((p) => p[0]), ys = plan.boundary.map((p) => p[1]);
  const minX = Math.min(...xs) - pad, maxX = Math.max(...xs) + pad, minY = Math.min(...ys) - pad, maxY = Math.max(...ys) + pad;
  const to = ([x, y]: Pt): Pt => [x - minX, maxY - y]; // plan y is north-up; SVG y runs down
  return { w: maxX - minX, h: maxY - minY, to, centre: to([(minX + maxX) / 2, (minY + maxY) / 2]) };
}

const d = (pts: Pt[]) => "M" + pts.map((p) => `${p[0].toFixed(2)},${p[1].toFixed(2)}`).join("L") + "Z";
// Same winding for every piece, so the nonzero fill rule unions overlapping pieces instead of cutting holes
const area = (pts: Pt[]) => pts.reduce((s, p, i) => { const q = pts[(i + 1) % pts.length]; return s + p[0] * q[1] - q[0] * p[1]; }, 0);
const ds = (pts: Pt[]) => d(area(pts) < 0 ? [...pts].reverse() : pts);
const sky = (alt: number, az: number): Pt => { const r = ((90 - alt) / 90) * SKY, a = (az * Math.PI) / 180; return [r * Math.sin(a), -r * Math.cos(a)]; };

export function study(plan: Plan, doy: number, hour: number) {
  const { latitude: lat, longitude: lon, timezone: tz } = plan;
  const f = frame(plan);
  const sun = sunPosition(lat, lon, tz, doy, hour);
  const up = sun.altitude > 0.5;
  // A prism's shadow is the roof outline, its copy pushed away from the sun, and the band each edge sweeps between them.
  // shortcut: roofs are extruded flat at eave level (ridges ignored) and shadows fall on one ground plane; fine for a massing study.
  let shadows = "";
  if (up) {
    const az = (sun.azimuth * Math.PI) / 180, k = 1 / Math.tan((sun.altitude * Math.PI) / 180);
    for (const r of plan.roofs) {
      const L = Math.min(r.height_m * k, 80);
      const a = r.outline, b = a.map(([x, y]): Pt => [x - L * Math.sin(az), y - L * Math.cos(az)]);
      shadows += ds(a.map(f.to)) + ds(b.map(f.to)) + a.map((p, i) => ds([p, a[(i + 1) % a.length], b[(i + 1) % a.length], b[i]].map(f.to))).join("");
    }
  }
  const arc: Pt[] = [];
  const day = daylight(lat, lon, tz, doy);
  for (let h = day.rise; h <= day.set; h += 0.1) { const p = sunPosition(lat, lon, tz, doy, h); arc.push(sky(Math.max(0, p.altitude), p.azimuth)); }
  const noon = solarNoon(lat, lon, tz, doy);
  const north = noon.azimuth < 90 || noon.azimuth > 270;
  const ray = (len: number): Pt => [f.centre[0] + len * Math.sin((sun.azimuth * Math.PI) / 180), f.centre[1] - len * Math.cos((sun.azimuth * Math.PI) / 180)];
  return {
    shadows,
    ray: up ? `M${f.centre.join(",")}L${ray(Math.min(f.w, f.h) * 0.46).join(",")}` : "",
    sunInPlan: up ? ray(Math.min(f.w, f.h) * 0.46) : null,
    arc: arc.length ? "M" + arc.map((p) => p.map((v) => v.toFixed(1)).join(",")).join("L") : "",
    sunInSky: up ? sky(sun.altitude, sun.azimuth) : null,
    label: `${fmtDate(doy)}, ${fmtTime(hour)}`,
    readout: up
      ? `Sun ${Math.round(sun.altitude)}° up, ${compass(sun.azimuth)}. ${north ? "At noon today it passes north of overhead, so the north side needs shade." : "At noon today it stays south of overhead."}`
      : `The sun is down. Today it rises at ${fmtTime(day.rise)} and sets at ${fmtTime(day.set)}.`,
    noon: `Noon height ${Math.round(noon.altitude)}°, ${north ? "north" : "south"} · daylight ${fmtTime(day.rise)}–${fmtTime(day.set)}`,
  };
}

export const plotPaths = (plan: Plan) => {
  const f = frame(plan);
  return { w: f.w, h: f.h, boundary: d(plan.boundary.map(f.to)), roofs: plan.roofs.map((r) => ({ name: r.name, d: d(r.outline.map(f.to)) })) };
};

export const solstices = (plan: Plan) => [172, 355].map((doy) => {
  const { latitude: lat, longitude: lon, timezone: tz } = plan, day = daylight(lat, lon, tz, doy), pts: Pt[] = [];
  for (let h = day.rise; h <= day.set; h += 0.2) { const p = sunPosition(lat, lon, tz, doy, h); pts.push(sky(Math.max(0, p.altitude), p.azimuth)); }
  return "M" + pts.map((p) => p.map((v) => v.toFixed(1)).join(",")).join("L");
});

function compass(az: number) {
  return ["north", "north-east", "east", "south-east", "south", "south-west", "west", "north-west"][Math.round(az / 45) % 8];
}
