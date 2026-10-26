// Register a project repo as a case study, then pull it and build to prove it works.
//   node scripts/add-project.mjs jojojayesh-dev/<repo> [branch]
// Fails loudly at the first problem: repo unreachable, no portfolio.yaml, publish false, schema errors, leaked files.
import { execFileSync } from "node:child_process";
import fs from "node:fs";

const [repo, ref = "main"] = process.argv.slice(2);
if (!/^[\w.-]+\/[\w.-]+$/.test(repo ?? "")) {
  console.error("usage: node scripts/add-project.mjs owner/repo [branch]");
  process.exit(1);
}
const run = (cmd, args) => execFileSync(cmd, args, { stdio: "inherit", shell: process.platform === "win32" });

// 1. the branch must exist and be readable with the current git login
try {
  execFileSync("git", ["ls-remote", "--exit-code", "--heads", `https://github.com/${repo}.git`, ref], { stdio: "ignore" });
} catch {
  console.error(`cannot read branch "${ref}" of ${repo}: check the name, the branch, and that your GitHub login can see it`);
  process.exit(1);
}

// 2. add (or update the branch of) the entry in projects.json
const list = JSON.parse(fs.readFileSync("projects.json", "utf8"));
const at = list.findIndex((p) => p.repo === repo);
if (at >= 0) list[at].ref = ref; else list.push({ repo, ref });
fs.writeFileSync("projects.json", JSON.stringify(list, null, 2) + "\n");
console.log(`${at >= 0 ? "updated" : "added"} ${repo}@${ref} in projects.json`);

// 3. pull every project, build (the Zod schema checks portfolio.yaml), and check nothing private shipped
run("node", ["scripts/sync-projects.mjs"]);
const slugs = fs.readdirSync("src/content/projects").filter((f) => f.endsWith(".json"));
const mine = slugs.map((f) => JSON.parse(fs.readFileSync(`src/content/projects/${f}`, "utf8"))).find((p) => p.repo === repo);
if (!mine) {
  console.error(`${repo} was not published: check that portfolio.yaml exists and says publish: true`);
  process.exit(1);
}
run("npm", ["run", "build"]);
run("node", ["scripts/check-dist.mjs"]);
console.log(`\nready: /work/${mine.slug}/  (preview with: npm run preview)`);
