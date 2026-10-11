// ADD NEW PAGES HERE. Every page that loads nav.js gets the updated menu.
// external: true  -> opens in a new tab (other GitHub Pages sites)
// external: false -> a page inside this repository (use a relative path)
const LINKS = [
    { label: "valentine's website", href: "https://grishma-a.github.io/valentines-website/index.html", external: true },
    { label: "nbf day", href: "https://grishma-a.github.io/nbfday/index.html", external: true },
    { label: "27 months", href: "27months.html", external: false },
    // { label: "Next page", href: "next-page.html", external: false },
];

// Your heart image. Put the file at images/heart.png (change the name here if different).
// If the file is missing, a drawn heart is used instead.
const HEART_SRC = "images/heart.png";

let heartCount = 0;
function heartSvg() {
    const id = "hg" + heartCount++;
    return `<svg viewBox="0 0 100 90" aria-hidden="true">
  <defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#f7b9c6"/><stop offset="1" stop-color="#d4636f"/></linearGradient></defs>
  <path d="M50 86 C10 56 2 36 2 24 C2 11 12 3 25 3 C36 3 45 9 50 18 C55 9 64 3 75 3 C88 3 98 11 98 24 C98 36 90 56 50 86Z" fill="url(#${id})"/>
  <path d="M20 17 C13 19 9 25 10 32" stroke="#fff" stroke-opacity=".7" stroke-width="5" stroke-linecap="round" fill="none"/>
</svg>`;
}
function useFallbackHeart(img) {
    const t = document.createElement("div");
    t.innerHTML = heartSvg();
    img.replaceWith(t.firstElementChild);
}
function heartMarkup() {
    return `<img class="heart-img" src="${HEART_SRC}" alt="" onerror="useFallbackHeart(this)">`;
}

function buildFloaty() {
    const layer = document.createElement("div");
    layer.className = "floaty";
    layer.setAttribute("aria-hidden", "true");
    const glyphs = ["♥", "♡", "♥", "✿"];
    const colors = ["#f4aebd", "#d4636f", "#f7c6cf", "#e08790"];
    for (let i = 0; i < 16; i++) {
        const s = document.createElement("span");
        s.textContent = glyphs[i % glyphs.length];
        s.style.color = colors[i % colors.length];
        s.style.left = Math.random() * 100 + "%";
        s.style.fontSize = 14 + Math.random() * 26 + "px";
        s.style.animationDuration = 12 + Math.random() * 14 + "s";
        s.style.animationDelay = -Math.random() * 20 + "s";
        layer.appendChild(s);
    }
    document.body.prepend(layer);
}

function buildNav() {
    const here = location.pathname.split("/").pop() || "index.html";
    const nav = document.createElement("nav");
    nav.className = "nav";
    nav.id = "site-nav";
    nav.setAttribute("aria-label", "Our pages");
    nav.innerHTML = `<h2>chibby x grishi</h2><p class="sub">2024 - present</p><ul>
    <li><a href="index.html" ${here === "index.html" ? 'aria-current="page"' : ""}>home</a></li>
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

function burst(x, y) {
    const colors = ["#d4636f", "#f4aebd", "#e08790"];
    for (let i = 0; i < 16; i++) {
        const h = document.createElement("span");
        h.className = "burst";
        h.textContent = i % 3 ? "♥" : "✦";
        h.style.color = colors[i % colors.length];
        const angle = (Math.PI * 2 * i) / 16, dist = 80 + Math.random() * 90;
        h.style.left = x + "px"; h.style.top = y + "px";
        h.style.fontSize = 14 + Math.random() * 16 + "px";
        h.style.setProperty("--dx", Math.cos(angle) * dist + "px");
        h.style.setProperty("--dy", Math.sin(angle) * dist + "px");
        h.style.setProperty("--r", Math.random() * 120 - 60 + "deg");
        document.body.appendChild(h);
        setTimeout(() => h.remove(), 1000);
    }
}

buildFloaty();
const nav = buildNav();

// Small heart button on inner pages
const toggle = document.querySelector(".nav-toggle");
if (toggle) {
    toggle.innerHTML = heartMarkup();
    toggle.addEventListener("click", () => setOpen(nav, !nav.classList.contains("open")));
}

// Big heart on the home page unlocks the nav
const bigHeart = document.querySelector(".heart-btn");
if (bigHeart) {
    bigHeart.innerHTML = heartMarkup();
    const home = document.querySelector(".home");
    bigHeart.addEventListener("click", () => {
        const unlocked = home.classList.contains("unlocked");
        if (!unlocked) {
            home.classList.add("unlocked");
            const r = bigHeart.getBoundingClientRect();
            burst(r.left + r.width / 2, r.top + r.height / 2);
        }
        setOpen(nav, unlocked ? !nav.classList.contains("open") : true);
        bigHeart.setAttribute("aria-expanded", "true");
    });
}



document.addEventListener("keydown", e => { if (e.key === "Escape") setOpen(nav, false); });