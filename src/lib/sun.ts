// Solar position (NOAA general solar position equations, accurate to well under a degree).
// Returns degrees: altitude above the horizon, azimuth clockwise from north.
const rad = Math.PI / 180;

export function sunPosition(lat: number, lon: number, tz: number, doy: number, hour: number) {
  const g = (2 * Math.PI / 365) * (doy - 1 + (hour - 12) / 24);
  const eqt = 229.18 * (0.000075 + 0.001868 * Math.cos(g) - 0.032077 * Math.sin(g) - 0.014615 * Math.cos(2 * g) - 0.040849 * Math.sin(2 * g));
  const decl = 0.006918 - 0.399912 * Math.cos(g) + 0.070257 * Math.sin(g) - 0.006758 * Math.cos(2 * g) + 0.000907 * Math.sin(2 * g) - 0.002697 * Math.cos(3 * g) + 0.00148 * Math.sin(3 * g);
  const ha = ((hour * 60 + eqt + 4 * lon - 60 * tz) / 4 - 180) * rad;
  const phi = lat * rad;
  const cosZen = Math.min(1, Math.max(-1, Math.sin(phi) * Math.sin(decl) + Math.cos(phi) * Math.cos(decl) * Math.cos(ha)));
  const altitude = 90 - Math.acos(cosZen) / rad;
  const azimuth = (Math.atan2(Math.sin(ha), Math.cos(ha) * Math.sin(phi) - Math.tan(decl) * Math.cos(phi)) / rad + 180 + 360) % 360;
  return { altitude, azimuth, declination: decl / rad };
}

// Highest point of the day, found by scanning (also gives solar noon in local clock time).
export function solarNoon(lat: number, lon: number, tz: number, doy: number) {
  let best = { hour: 12, altitude: -90, azimuth: 0 };
  for (let h = 10; h <= 14; h += 1 / 60) {
    const p = sunPosition(lat, lon, tz, doy, h);
    if (p.altitude > best.altitude) best = { hour: h, altitude: p.altitude, azimuth: p.azimuth };
  }
  return best;
}

export function daylight(lat: number, lon: number, tz: number, doy: number) {
  let rise = NaN, set = NaN;
  for (let h = 0; h < 24; h += 1 / 60) {
    const up = sunPosition(lat, lon, tz, doy, h).altitude > -0.83;
    if (up && isNaN(rise)) rise = h;
    if (up) set = h;
  }
  return { rise, set };
}

export const doyToDate = (doy: number) => new Date(Date.UTC(2026, 0, doy));
export const fmtDate = (doy: number) => doyToDate(doy).toLocaleDateString("en-GB", { day: "numeric", month: "long", timeZone: "UTC" });
export const fmtTime = (h: number) => `${String(Math.floor(h)).padStart(2, "0")}:${String(Math.round((h % 1) * 60) % 60).padStart(2, "0")}`;
