// Mobiles Menü
const btn = document.querySelector(".menu-btn");
const menu = document.getElementById("menu");
if (btn && menu) {
  btn.addEventListener("click", () => {
    const offen = menu.classList.toggle("open");
    btn.setAttribute("aria-expanded", offen);
    btn.setAttribute("aria-label", offen ? "Menü schließen" : "Menü öffnen");
  });
}

// Hell/Dunkel umschalten
const themeBtn = document.querySelector(".theme-btn");
const themeMeta = document.querySelector('meta[name="theme-color"]');
function setzeDesign(hell) {
  if (hell) document.documentElement.dataset.theme = "light";
  else delete document.documentElement.dataset.theme;
  if (themeMeta) themeMeta.content = hell ? "#ffffff" : "#031218";
  if (themeBtn) themeBtn.setAttribute("aria-label", hell ? "Dunkles Design einschalten" : "Helles Design einschalten");
}
if (themeBtn) {
  setzeDesign(document.documentElement.dataset.theme === "light");
  themeBtn.addEventListener("click", () => {
    const hell = document.documentElement.dataset.theme !== "light";
    setzeDesign(hell);
    try { localStorage.setItem("theme", hell ? "light" : "dark"); } catch (e) {}
  });
}

// Plissee-Intro: öffnet sich beim Scrollen nach oben
const seite = document.querySelector(".seite");
if (seite && document.body.hasAttribute("data-plissee") && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
  document.documentElement.classList.add("plissee-an");
  const plissee = document.createElement("div");
  plissee.className = "plissee";
  plissee.setAttribute("aria-hidden", "true");
  plissee.innerHTML = '<div class="kopf"></div><div class="stoff"><div class="info"><img src="logo.svg" alt="" width="84" height="64"><strong>Maßgenau &amp; Mehr</strong><span>Fliegengitter &amp; Plissees nach Maß</span><em>Zum Öffnen scrollen</em></div></div><div class="schiene"><span class="griff"></span></div>';
  seite.appendChild(plissee);          // innerhalb der Seite, damit das Menü darüber liegt
  const stoff = plissee.querySelector(".stoff");
  const info = plissee.querySelector(".info");
  const SCHIENEN = 30;          // Kopf- und Unterschiene zusammen
  const FALTE = 22;             // Faltenhöhe im geschlossenen Zustand
  let weg = 0, hoehe = 0, breite = 0, geplant = false;

  function zeichne() {
    const f = Math.min(1, Math.max(0, scrollY / weg));
    const offen = 1 - Math.pow(1 - f, 1.6);
    const falten = (hoehe - SCHIENEN) / FALTE;
    const stoffHoehe = (hoehe - SCHIENEN) * (1 - offen) + falten * 2.5 * offen;
    plissee.style.height = Math.round(stoffHoehe + SCHIENEN) + "px";
    stoff.style.setProperty("--falte", Math.max(2.5, stoffHoehe / falten) + "px");
    info.style.opacity = Math.max(0, 1 - f * 3);
    plissee.style.opacity = f < 0.85 ? 1 : Math.max(0, (1 - f) / 0.15);
    plissee.style.visibility = f >= 1 ? "hidden" : "visible";
  }
  function messen() {
    if (innerWidth === breite) return;   // Höhenänderung durch die Adressleiste am Handy ignorieren
    breite = innerWidth;
    const navH = document.querySelector(".nav").offsetHeight;
    document.documentElement.style.setProperty("--nav-h", navH + "px");
    const leiste = document.querySelector(".cta-leiste");
    const leisteH = leiste && getComputedStyle(leiste).display !== "none" ? leiste.offsetHeight : 0;
    hoehe = innerHeight - navH - leisteH - 10;   // zwischen Menü und Kontaktleiste, mit Platz für den Griff
    weg = Math.round(innerHeight * 0.85);
    document.documentElement.style.setProperty("--oeffnen", weg + "px");
    zeichne();
  }
  addEventListener("scroll", () => {
    if (geplant) return;
    geplant = true;
    requestAnimationFrame(() => { geplant = false; zeichne(); });
  }, { passive: true });
  addEventListener("resize", messen);
  messen();

  // Sprungmarken auf derselben Seite: Öffnungsweg mit einrechnen
  document.addEventListener("click", (e) => {
    const link = e.target.closest('a[href^="#"]');
    const ziel = link && document.querySelector(link.getAttribute("href"));
    if (!ziel) return;
    e.preventDefault();
    const abstand = ziel.getBoundingClientRect().top - seite.getBoundingClientRect().top;
    scrollTo({ top: weg + abstand - 72, behavior: "smooth" });
  });
}

// Einblenden beim Scrollen
const teile = document.querySelectorAll(".rise");
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver((eintraege) => {
    eintraege.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
    });
  }, { rootMargin: "0px 0px -8% 0px" });
  teile.forEach((t) => io.observe(t));
} else {
  teile.forEach((t) => t.classList.add("in"));
}
