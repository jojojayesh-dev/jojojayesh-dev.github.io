// Pull each project's public files into src/content/projects/.
// The project repos are private; only paths their portfolio.yaml allows (minus deny) are copied.
// Local runs use your git credentials; CI passes PROJECTS_TOKEN (read-only Contents).
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import YAML from "yaml";

const CACHE = ".cache/repos";
const OUT = "src/content/projects";
const token = process.env.PROJECTS_TOKEN;
const match = (f, globs = []) => globs.some((g) => path.posix.matchesGlob(f, g));

function walk(dir, base = dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    if (d.name === ".git") return [];
    const p = path.join(dir, d.name);
    return d.isDirectory() ? walk(p, base) : [path.relative(base, p).split(path.sep).join("/")];
  });
}

// Case study text: YAML front matter + "## Heading" sections of plain paragraphs.
// shortcut: no inline markdown (links, bold); switch to a markdown parser when the text needs it.
function parseText(md) {
  md = md.replace(/\r\n/g, "\n");
  const fm = md.match(/^---\n([\s\S]*?)\n---/);
  const sections = md.slice(fm ? fm[0].length : 0).split(/^## /m).slice(1).map((block) => {
    const [heading, ...rest] = block.split("\n");
    return { heading: heading.trim(), paragraphs: rest.join("\n").split(/\n\s*\n/).map((p) => p.replace(/\s+/g, " ").trim()).filter(Boolean) };
  });
  return { ...(fm ? YAML.parse(fm[1]) : {}), sections };
}

// "Mean wind speed: 0.9 m/s" -> { "Mean wind speed": "0.9 m/s" }; kept as text so numbers are never retyped
function parseKeyNumbers(txt) {
  return Object.fromEntries(txt.split(/\r?\n/).filter((l) => l.includes(": ")).map((l) => {
    const i = l.indexOf(": ");
    return [l.slice(0, i).trim(), l.slice(i + 2).trim()];
  }));
}

const readJson = (dir, f, files) => (files.includes(f) ? JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")) : undefined);

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

for (const { repo, ref = "main" } of JSON.parse(fs.readFileSync("projects.json", "utf8"))) {
  const dir = path.join(CACHE, repo.split("/")[1]);
  fs.rmSync(dir, { recursive: true, force: true });
  const url = token ? `https://x-access-token:${token}@github.com/${repo}.git` : `https://github.com/${repo}.git`;
  execFileSync("git", ["clone", "--quiet", "--depth", "1", "--branch", ref, url, dir], { stdio: ["ignore", "ignore", "inherit"] });

  const cfgPath = path.join(dir, "portfolio.yaml");
  if (!fs.existsSync(cfgPath)) { console.warn(`skip ${repo}: no portfolio.yaml`); continue; }
  const cfg = YAML.parse(fs.readFileSync(cfgPath, "utf8"));
  if (!cfg.publish) { console.log(`skip ${repo}: publish is false`); continue; }

  const files = walk(dir).filter((f) => match(f, cfg.allow) && !match(f, cfg.deny));
  for (const f of files) {
    const to = path.join(OUT, cfg.slug, f);
    fs.mkdirSync(path.dirname(to), { recursive: true });
    fs.copyFileSync(path.join(dir, f), to);
  }

  // Derived public data: chosen fields only, never whole private files
  const project = YAML.parse(fs.readFileSync(path.join(dir, "project.yaml"), "utf8"));
  const kn = path.join(dir, "graphics/climate/key_numbers.txt");
  const { allow, deny, ...meta } = cfg;
  const rel = (f) => (f && files.includes(f) ? `./${cfg.slug}/${f}` : undefined);
  const entry = {
    ...meta,
    repo,
    cover: rel(cfg.cover),
    sections: cfg.sections.map((s) => (s.items ? { ...s, items: s.items.filter((i) => files.includes(i.src)).map((i) => ({ ...i, src: rel(i.src) })) } : s)),
    text: files.includes(cfg.text) ? parseText(fs.readFileSync(path.join(dir, cfg.text), "utf8")) : undefined,
    site: { label: project.site.label, latitude: project.site.latitude, longitude: project.site.longitude, area_sqm: project.site.area_sqm, elevation_m: project.site.elevation_m },
    climate: fs.existsSync(kn) && files.includes("graphics/climate/key_numbers.txt") ? parseKeyNumbers(fs.readFileSync(kn, "utf8")) : undefined,
    climateData: readJson(dir, "graphics/climate/climate.json", files),
    sitePlan: readJson(dir, "graphics/sunpath/site_plan.json", files),
    files,
  };
  fs.writeFileSync(path.join(OUT, `${cfg.slug}.json`), JSON.stringify(entry, null, 2));
  console.log(`${repo}@${ref}: ${files.length} public files`);
  for (const f of files) console.log(`  ${f}`);
}
