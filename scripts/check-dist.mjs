// Fail the build if anything private reached dist/. Runs after astro build, before deploy.
import fs from "node:fs";
import path from "node:path";

const BANNED = /\.(skp|skb|epw|dxf|3dm|dwg|zip)$|(^|\/)(reference|\.git)\/|PROJECT\.md$|THEME\.md$|key_numbers\.txt$/i;
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
const files = walk("dist").map((f) => f.split(path.sep).join("/"));
const bad = files.filter((f) => BANNED.test(f) || /ghp_|github_pat_/.test(fs.readFileSync(f, "latin1")));
if (bad.length) { console.error("Private files in dist:\n" + bad.join("\n")); process.exit(1); }
console.log(`dist clean: ${files.length} files checked`);
