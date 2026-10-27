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
