---
name: add-case-study
description: Add one of Jayesh's project repos to the portfolio site as a new case study. Use when he says "add <project> to the portfolio", "/add-case-study <repo>", or a project is ready to publish.
---

# Add a case study

Run from the root of `jojojayesh-dev.github.io`.

1. **Which repo and branch.** Take `jojojayesh-dev/<repo>` from the request; default branch `main`. If unclear, list his repos with `gh repo list jojojayesh-dev` and ask.
2. **Check the project repo is ready**, in its local clone under `%USERPROFILE%\Projects\<repo>`:
   - `portfolio.yaml` exists (every repo from `arch-project-template` has one) and says `publish: true`.
   - `allow` lists only what may be public. Never widen it to `**`. The brief PDF, `.skp`, `.epw` and anything under `reference/` stay denied.
   - `research/portfolio-text.md` exists, first person, every number traceable to `PROJECT.md` or `graphics/climate/key_numbers.txt`. Search it for "you"/"your": there must be none.
   - Images: AI-assisted ones carry `ai: true`; alt text is written in his voice.
   - If `graphics/climate/climate.json` is missing, run `python tools/climate/web_data.py` with the project's `.venv` and commit the output.
   - If anything is missing, stop and list it. Do not write case study text without asking him 2–4 multiple-choice questions on tone and length first.
3. **Register and build:** `node scripts/add-project.mjs jojojayesh-dev/<repo> [branch]`. It adds the entry to `projects.json`, pulls the allowed files, builds (the schema validates `portfolio.yaml`) and runs the leak check. Fix any error it prints at the source, in the project repo, never by editing `src/content/`.
4. **Look at it:** `npm run preview`, open `/work/<slug>/`, then run the design-taste-frontend inspector on it at 1440/768/390 (`--allow hairline,palette-cream,no-footage`, the brand rules from THEME.md). Fix every real FAIL.
5. **Auto-rebuild:** the project repo needs the `SITE_DISPATCH_TOKEN` Actions secret (a fine-grained token with Contents: Read and write on `jojojayesh-dev.github.io`). Check with `gh secret list -R jojojayesh-dev/<repo>`. If it is missing, give him the command to run himself: `gh secret set SITE_DISPATCH_TOKEN -R jojojayesh-dev/<repo>`. Never ask for the token value.
6. **The website token** `PROJECTS_TOKEN` must be able to read the new repo: GitHub → Settings → Developer settings → Fine-grained tokens → `portfolio-sync` → Edit → add the repo under Repository access. He does this himself.
7. **Ship:** commit `projects.json` ("Add case study: <title>"), push, watch the deploy with `gh run watch`, then open the live `/work/<slug>/` and confirm it loads. Reply with the live link and anything still open.
