// ADD NEW PAGES HERE. Every page that loads nav.js gets the updated menu.
// external: true  -> opens in a new tab (other GitHub Pages sites)
// external: false -> a page inside this repository (use a relative path)
const LINKS = [
  { label: "Valentine's Website", href: "https://grishma-a.github.io/valentines-website/index.html", external: true },
  { label: "NBF Day", href: "https://grishma-a.github.io/nbfday/index.html", external: true },
  { label: "27 Months", href: "27months.html", external: false },
  // { label: "Next page", href: "next-page.html", external: false },
];

const HEART_SVG = `<svg viewBox="0 0 100 90" aria-hidden="true">
  <path d="M50 86 C10 56 2 36 2 24 C2 11 12 3 25 3 C36 3 45 9 50 18 C55 9 64 3 75 3 C88 3 98 11 98 24 C98 36 90 56 50 86Z" fill="#ff4d79"/>
  <path d="M22 16 C14 18 10 24 11 31" stroke="#fff" stroke-opacity=".55" stroke-width="5" stroke-linecap="round" fill="none"/>
</svg>`;

function buildNav() {
  const here = location.pathname.split("/").pop() || "index.html";
  const nav = document.createElement("nav");
  nav.className = "nav";
  nav.id = "site-nav";
  nav.setAttribute("aria-label", "Our pages");
  nav.innerHTML = `<h2>Our love</h2><ul>
    <li><a href="index.html" ${here === "index.html" ? 'aria-current="page"' : ""}>Home</a></li>
    ${LINKS.map(l => {
      const current = !l.external && l.href === here ? 'aria-current="page"' : "";
      const ext = l.external ? 'class="ext" target="_blank" rel="noopener noreferrer"' : "";
      return `<li><a href="${l.href}" ${ext} ${current}>${l.label}</a></li>`;
    }).join("")}
  </ul>`;
  document.body.prepend(nav);
  return nav;
}

function setOpen(nav, open) {
  nav.classList.toggle("open", open);
  document.body.classList.toggle("nav-open", open);
  const t = document.querySelector(".nav-toggle");
  if (t) t.setAttribute("aria-expanded", String(open));
}

const nav = buildNav();

// Small heart button on inner pages (the home page uses the big heart instead)
const toggle = document.querySelector(".nav-toggle");
if (toggle) {
  toggle.innerHTML = HEART_SVG;
  toggle.addEventListener("click", () => setOpen(nav, !nav.classList.contains("open")));
}

// Home page: big heart unlocks the nav
const bigHeart = document.querySelector(".heart-btn");
if (bigHeart) {
  bigHeart.innerHTML = HEART_SVG;
  const home = document.querySelector(".home");
  bigHeart.addEventListener("click", () => {
    const unlocked = home.classList.contains("unlocked");
    if (!unlocked) home.classList.add("unlocked");
    setOpen(nav, unlocked ? !nav.classList.contains("open") : true);
    bigHeart.setAttribute("aria-expanded", "true");
  });
}

document.addEventListener("keydown", e => { if (e.key === "Escape") setOpen(nav, false); });