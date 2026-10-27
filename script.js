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
