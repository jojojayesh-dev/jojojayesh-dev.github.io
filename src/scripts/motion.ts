// Motion layer (THEME.md: Framed · Earthen · Unhurried). Native IntersectionObserver + CSS, no libraries.
// Below the first section, each heading, paragraph, figure and data row reveals once as it enters:
// pictures open like a frame (clip-path), text rises 16px. Things entering together stagger 70ms apart.
// Content is only hidden under html.js, so nothing stays hidden if this script never runs.
const UNITS = "h2, h3, p, figure, dl > div, details, .sun-study, .compare, li";
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

const sections = [...[...document.querySelectorAll<HTMLElement>("main section")].slice(1), ...document.querySelectorAll<HTMLElement>("footer")];
const units = sections.flatMap((s) => [...s.querySelectorAll<HTMLElement>(UNITS)]);
const set = new Set(units);
// keep only the outermost unit, so a figure's caption does not animate separately from its figure
const outer = units.filter((u) => { for (let p = u.parentElement; p; p = p.parentElement) if (set.has(p)) return false; return true; });

for (const u of outer) u.dataset.r = u.matches("figure") && u.querySelector("img") ? "frame" : "up";

if (reduce || !("IntersectionObserver" in window)) {
  outer.forEach((u) => u.classList.add("in"));
} else {
  const io = new IntersectionObserver((entries) => {
    entries.filter((e) => e.isIntersecting).forEach((e, i) => {
      const el = e.target as HTMLElement;
      el.style.setProperty("--d", `${Math.min(i, 6) * 70}ms`);
      el.classList.add("in");
      io.unobserve(el);
    });
  }, { threshold: 0 });
  outer.forEach((u) => io.observe(u));
  // safety net: never leave anything hidden for print, or once the reader has reached the end
  const showAll = () => outer.forEach((u) => u.classList.add("in"));
  addEventListener("beforeprint", showAll);
  addEventListener("scroll", () => { if (innerHeight + scrollY >= document.body.scrollHeight - 4) showAll(); }, { passive: true });
}
