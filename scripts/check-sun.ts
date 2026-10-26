// Self-check for src/lib/sun.ts against the numbers in PROJECT.md (Ladybug sun path). Run: node scripts/check-sun.ts
import assert from "node:assert/strict";
import { solarNoon, fmtDate } from "../src/lib/sun.ts";
const [lat, lon, tz] = [12.00335, 79.80582, 5.5];
const jun = solarNoon(lat, lon, tz, 172), dec = solarNoon(lat, lon, tz, 355);
assert(Math.abs(jun.altitude - 79) < 1, `21 Jun noon ${jun.altitude}`);
assert(Math.abs(dec.altitude - 55) < 1, `21 Dec noon ${dec.altitude}`);
assert(jun.azimuth < 90 || jun.azimuth > 270, "June noon sun should be north");
assert(dec.azimuth > 90 && dec.azimuth < 270, "December noon sun should be south");
const overhead = [...Array(365).keys()].map((i) => i + 1).filter((d) => solarNoon(lat, lon, tz, d).altitude > 89.6).map(fmtDate);
console.log("21 Jun", jun.altitude.toFixed(1), "21 Dec", dec.altitude.toFixed(1), "overhead:", overhead.join(", "));
