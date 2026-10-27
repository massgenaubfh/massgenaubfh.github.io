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
let plisseeGesehen = false;
try { plisseeGesehen = sessionStorage.getItem("plissee") === "1"; sessionStorage.setItem("plissee", "1"); } catch (e) {}
if (seite && document.body.hasAttribute("data-plissee") && !plisseeGesehen && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
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

// Anfrage-Assistent: vier Schritte, Empfehlung, Nachricht per WhatsApp oder E-Mail
const form = document.getElementById("assistent");
if (form) {
  const schritte = [...form.querySelectorAll(".schritt")];
  const balken = form.querySelector(".fortschritt span");
  const info = form.querySelector(".schritt-info");
  const fehler = form.querySelector(".fehler");
  const weiter = form.querySelector(".weiter");
  const zurueck = form.querySelector(".zurueck");
  const ergebnis = form.querySelector(".ergebnis");
  const wunschBlock = form.querySelector(".wunsch");
  const andererOrt = form.querySelector(".anderer-ort");
  let aktuell = 0;

  const wert = (name) => (form.querySelector(`[name="${name}"]:checked`) || {}).value || "";
  const feld = (name) => form.elements[name].value.trim();
  const mitPlissee = () => wert("produkt").includes("Plissee");

  // Produkt aus dem Link übernehmen, z. B. anfrage.html?produkt=plissee
  const vorwahl = new URLSearchParams(location.search).get("produkt");
  const passend = { fliegengitter: "Fliegengitter", plissee: "Plissee" }[vorwahl];
  if (passend) form.querySelector(`[name="produkt"][value="${passend}"]`).checked = true;
  const ortVorwahl = new URLSearchParams(location.search).get("ort");
  const ortFeld = ortVorwahl && form.querySelector(`[name="ort"][value="${CSS.escape(ortVorwahl)}"]`);
  if (ortFeld) ortFeld.checked = true;
  const ortName = new URLSearchParams(location.search).get("ortname");
  if (ortName) form.elements.ortname.value = ortName;

  function zeige(i) {
    aktuell = i;
    schritte.forEach((s, k) => (s.hidden = k !== i));
    wunschBlock.hidden = !mitPlissee();
    andererOrt.hidden = wert("ort") !== "anderer Ort";
    balken.style.width = ((i + 1) / schritte.length) * 100 + "%";
    info.textContent = `Schritt ${i + 1} von ${schritte.length}`;
    zurueck.hidden = i === 0;
    weiter.hidden = i < 2;   // Schritt 1 und 2 gehen beim Antippen automatisch weiter
    weiter.textContent = i === schritte.length - 1 ? "Empfehlung anzeigen" : "Weiter";
    fehler.hidden = true;
  }

  function pruefe(i) {
    if (i === 0 && !wert("produkt")) return "Bitte wählen Sie aus, was Sie brauchen.";
    if (i === 1 && !wert("einsatz")) return "Bitte wählen Sie aus, wofür es gedacht ist.";
    if (i === 1 && mitPlissee() && !wert("wunsch")) return "Bitte wählen Sie aus, was Ihnen beim Plissee wichtig ist.";
    if (i === 2 && !form.elements.unbekannt.checked) {
      const b = +feld("breite"), h = +feld("hoehe");
      if (!(b >= 10 && b <= 1000 && h >= 10 && h <= 1000)) return "Bitte geben Sie Breite und Höhe in Zentimetern an, oder setzen Sie den Haken, wenn Sie die Maße noch nicht kennen.";
    }
    if (i === 3 && !wert("ort")) return "Bitte wählen Sie Ihren Ort aus.";
    if (i === 3 && wert("ort") === "anderer Ort" && !feld("ortname")) return "Bitte geben Sie Ihren Ort an.";
    return "";
  }

  function empfehlung() {
    const einsatz = wert("einsatz"), punkte = [];
    let titel = "";
    if (wert("produkt") !== "Plissee") {
      const gitter = {
        "Fenster": "Fliegengitter mit festem Rahmen, passgenau im Fenster",
        "Balkon- oder Terrassentür": "Fliegengitter-Tür oder platzsparendes Plissee-Fliegengitter",
        "Schiebetür / große Fensterfront": "Plissee-Fliegengitter oder Schiebe-Fliegengitter für große Öffnungen",
      }[einsatz] || "Fliegengitter nach Maß, passend zu Ihrer Einbausituation";
      punkte.push(gitter);
      titel = "Ihr Fliegengitter nach Maß";
    }
    if (mitPlissee()) {
      const stoff = {
        "Sichtschutz": "Plissee mit lichtdurchlässigem Stoff: hell, aber blickdicht",
        "Abdunkeln": "Plissee mit abdunkelndem Stoff für erholsamen Schlaf",
        "Wärmeschutz": "Wabenplissee mit Luftkammern gegen Hitze und Kälte",
      }[wert("wunsch")] || "Plissee nach Maß, Stoff wählen wir gemeinsam aus";
      punkte.push(stoff);
      titel = titel ? "Fliegengitter und Plissee nach Maß" : "Ihr Plissee nach Maß";
    }
    punkte.push("Exakt nach Maß gefertigt und fachgerecht montiert");
    return { titel, punkte };
  }

  function angaben() {
    const ort = wert("ort") === "anderer Ort" ? feld("ortname") : wert("ort");
    const masse = form.elements.unbekannt.checked ? "noch unbekannt" : `ca. ${feld("breite")} × ${feld("hoehe")} cm`;
    const liste = [["Produkt", wert("produkt")], ["Für", wert("einsatz")]];
    if (mitPlissee()) liste.push(["Wunsch", wert("wunsch")]);
    liste.push(["Maße", masse], ["Anzahl", feld("anzahl") || "1"], ["Ort", ort]);
    if (feld("name")) liste.push(["Name", feld("name")]);
    if (feld("nachricht")) liste.push(["Nachricht", feld("nachricht")]);
    return liste;
  }

  function zeigeErgebnis() {
    const { titel, punkte } = empfehlung();
    const liste = angaben();
    form.querySelector(".empfehlung-titel").textContent = titel;
    form.querySelector(".empfehlung-liste").innerHTML = "";
    punkte.forEach((p) => { const li = document.createElement("li"); li.textContent = p; form.querySelector(".empfehlung-liste").append(li); });
    const dl = document.createElement("dl");
    liste.forEach(([k, v]) => { const dt = document.createElement("dt"); dt.textContent = k; const dd = document.createElement("dd"); dd.textContent = v; dl.append(dt, dd); });
    form.querySelector(".zusammenfassung").replaceChildren(dl);
    const text = "Hallo, ich habe den Anfrage-Assistenten auf Ihrer Website genutzt und hätte gern eine kostenlose Beratung:\n\n"
      + liste.map(([k, v]) => `• ${k}: ${v}`).join("\n")
      + `\n\nEmpfehlung laut Assistent: ${punkte.slice(0, -1).join("; ")}\n\nVielen Dank!`;
    form.querySelector(".senden-wa").href = "https://wa.me/4915229551963?text=" + encodeURIComponent(text);
    form.querySelector(".senden-mail").href = "mailto:info@massgenau-mehr.com?subject=" + encodeURIComponent("Anfrage: " + wert("produkt")) + "&body=" + encodeURIComponent(text);
    schritte.forEach((s) => (s.hidden = true));
    form.querySelector(".assistent-nav").hidden = true;
    info.textContent = "Fertig!";
    balken.style.width = "100%";
    fehler.hidden = true;
    ergebnis.hidden = false;
    scrollTo({ top: form.getBoundingClientRect().top + scrollY - 80, behavior: "smooth" });
  }

  weiter.addEventListener("click", () => {
    const meldung = pruefe(aktuell);
    if (meldung) { fehler.textContent = meldung; fehler.hidden = false; return; }
    if (aktuell < schritte.length - 1) zeige(aktuell + 1);
    else zeigeErgebnis();
  });
  zurueck.addEventListener("click", () => zeige(aktuell - 1));
  form.querySelector(".neu-start").addEventListener("click", () => {
    ergebnis.hidden = true;
    form.querySelector(".assistent-nav").hidden = false;
    zeige(0);
  });
  form.addEventListener("change", () => {
    wunschBlock.hidden = !mitPlissee();
    andererOrt.hidden = wert("ort") !== "anderer Ort";
    const ohne = form.elements.unbekannt.checked;
    form.elements.breite.disabled = form.elements.hoehe.disabled = ohne;
    fehler.hidden = true;
  });
  let timer;
  form.addEventListener("click", (e) => {
    const eingabe = e.target.closest(".option input");
    if (!eingabe) return;
    clearTimeout(timer);
    let fertig = false;
    if (aktuell === 0) fertig = true;
    if (aktuell === 1) {
      fertig = wert("einsatz") && (!mitPlissee() || wert("wunsch"));
      // Beim Plissee nach dem Einsatzort zur zweiten Frage scrollen
      if (!fertig && eingabe.name === "einsatz") {
        wunschBlock.hidden = false;
        setTimeout(() => wunschBlock.scrollIntoView({ behavior: "smooth", block: "center" }), 150);
      }
    }
    if (!fertig) return;
    timer = setTimeout(() => {
      zeige(aktuell + 1);
      const oben = form.getBoundingClientRect().top;
      if (oben < 70 || oben > innerHeight * 0.5) scrollTo({ top: oben + scrollY - 80, behavior: "smooth" });
    }, 280);
  });
  form.addEventListener("submit", (e) => e.preventDefault());
  zeige(0);
}

// Interaktive Einsatzgebiet-Karte (lädt OpenFreeMap erst nach Zustimmung)
const karte = document.getElementById("karte");
if (karte) {
  const laden = () => new Promise((fertig, fehler) => {
    if (window.maplibregl) return fertig();
    const css = document.createElement("link");
    css.rel = "stylesheet";
    css.href = "vendor/maplibre/maplibre-gl.css";
    document.head.append(css);
    const js = document.createElement("script");
    js.src = "vendor/maplibre/maplibre-gl.js";
    js.onload = fertig;
    js.onerror = fehler;
    document.head.append(js);
  });

  // Entfernung in km (Haversine)
  const entfernung = (a, b) => {
    const r = Math.PI / 180, dLat = (b[0] - a[0]) * r, dLon = (b[1] - a[1]) * r;
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(a[0] * r) * Math.cos(b[0] * r) * Math.sin(dLon / 2) ** 2;
    return 6371 * 2 * Math.asin(Math.sqrt(h));
  };

  // Dunkles Kartendesign passend zur CI: Farben der Grundkarte umfärben
  let original = null;
  const faerben = (map) => {
    const dunkel = document.documentElement.dataset.theme !== "light";
    if (!original) original = map.getStyle().layers.map((l) => ({ id: l.id, type: l.type, paint: { ...(l.paint || {}) } }));
    original.forEach(({ id, type, paint }) => {
      const setze = (k, v) => { try { map.setPaintProperty(id, k, v); } catch (e) {} };
      const zurueck = (k) => setze(k, paint[k] ?? null);
      if (id.startsWith("ma-")) return;
      if (type === "background") dunkel ? setze("background-color", "#041a21") : zurueck("background-color");
      if (type === "fill") dunkel ? setze("fill-color", /water/.test(id) ? "#0b3a44" : "#06252e") : zurueck("fill-color");
      if (type === "line") dunkel ? setze("line-color", /water|river/.test(id) ? "#14596a" : /boundary/.test(id) ? "#2b5560" : "#1c4652") : zurueck("line-color");
      if (type === "symbol") {
        dunkel ? setze("text-color", "#b9c4ca") : zurueck("text-color");
        dunkel ? setze("text-halo-color", "#031218") : zurueck("text-halo-color");
      }
    });
  };

  const starten = async () => {
    await laden();
    karte.classList.add("geladen");
    const flaeche = document.createElement("div");
    flaeche.className = "karte-flaeche";
    karte.append(flaeche);
    const [zLat, zLon] = karte.dataset.zentrum.split(",").map(Number);
    const radius = Number(karte.dataset.radius);
    const orte = JSON.parse(karte.dataset.orte);

    // Kreis als Fläche (64 Punkte)
    const kreis = [];
    for (let i = 0; i <= 64; i++) {
      const w = (i / 64) * 2 * Math.PI;
      kreis.push([zLon + (radius / (111.32 * Math.cos(zLat * Math.PI / 180))) * Math.sin(w), zLat + (radius / 111.2) * Math.cos(w)]);
    }
    const lons = kreis.map((p) => p[0]), lats = kreis.map((p) => p[1]);

    const map = new maplibregl.Map({
      container: flaeche,
      style: "https://tiles.openfreemap.org/styles/positron",
      bounds: [[Math.min(...lons), Math.min(...lats)], [Math.max(...lons), Math.max(...lats)]],
      fitBoundsOptions: { padding: 16 },
      cooperativeGestures: true,
      attributionControl: { compact: true },
      locale: {
        "CooperativeGesturesHandler.WindowsHelpText": "Strg + Mausrad zum Zoomen",
        "CooperativeGesturesHandler.MacHelpText": "⌘ + Mausrad zum Zoomen",
        "CooperativeGesturesHandler.MobileHelpText": "Mit zwei Fingern verschieben",
        "NavigationControl.ZoomIn": "Vergrößern",
        "NavigationControl.ZoomOut": "Verkleinern",
      },
    });
    karte._map = map;
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-left");

    map.on("load", () => {
      faerben(map);
      // Quellenhinweis zugeklappt starten (Info-Knopf klappt ihn auf)
      const attrib = flaeche.querySelector(".maplibregl-ctrl-attrib");
      if (attrib) attrib.classList.remove("maplibregl-compact-show");
      map.addSource("ma-gebiet", { type: "geojson", data: { type: "Feature", geometry: { type: "Polygon", coordinates: [kreis] } } });
      map.addLayer({ id: "ma-gebiet-flaeche", type: "fill", source: "ma-gebiet", paint: { "fill-color": "#0a8590", "fill-opacity": 0.12 } });
      map.addLayer({ id: "ma-gebiet-rand", type: "line", source: "ma-gebiet", paint: { "line-color": "#4ab3bf", "line-width": 2.5, "line-dasharray": [3, 2] } });
    });
    const themeKnopf = document.querySelector(".theme-btn");
    if (themeKnopf) themeKnopf.addEventListener("click", () => { if (map.isStyleLoaded()) faerben(map); });

    const anfrage = (ort) => {
      const bekannt = ["Heilbronn", "Neckarsulm", "Bad Friedrichshall"].includes(ort);
      return `anfrage.html?ort=${encodeURIComponent(bekannt ? ort : "anderer Ort")}${bekannt ? "" : "&ortname=" + encodeURIComponent(ort)}`;
    };
    const status = (km) => km <= radius
      ? '<span class="im-gebiet">✓ Im Einsatzgebiet</span>'
      : '<span class="ausserhalb">Knapp außerhalb, fragen Sie gern trotzdem an</span>';
    const popup = (html) => new maplibregl.Popup({ offset: 14, maxWidth: "260px" }).setHTML(html);

    const zentrum = document.createElement("div");
    zentrum.className = "k-marker";
    zentrum.setAttribute("aria-label", "Firmensitz Bad Friedrichshall");
    new maplibregl.Marker({ element: zentrum }).setLngLat([zLon, zLat])
      .setPopup(popup(`<strong>Bad Friedrichshall</strong><br>Unser Firmensitz<br><a class="more" href="${anfrage("Bad Friedrichshall")}">Jetzt anfragen</a>`))
      .addTo(map);

    orte.forEach(([name, lat, lon, wichtig]) => {
      const km = Math.round(entfernung([zLat, zLon], [lat, lon]));
      const el = document.createElement("button");
      el.type = "button";
      el.className = "k-ortpunkt" + (wichtig ? " wichtig" : "");
      el.setAttribute("aria-label", name);
      new maplibregl.Marker({ element: el }).setLngLat([lon, lat])
        .setPopup(popup(`<strong>${name}</strong><br>ca. ${km} km von Bad Friedrichshall<br>${status(km)}<br><a class="more" href="${anfrage(name)}">In ${name} anfragen</a>`))
        .addTo(map);
      el.setAttribute("aria-label", name);   // MapLibre setzt sonst "Map marker"
      el.title = name;
    });

    map.on("click", (ev) => {
      if (ev.originalEvent.target.closest(".k-ortpunkt, .k-marker")) return;   // Ortspunkte haben eigene Popups
      const km = Math.round(entfernung([zLat, zLon], [ev.lngLat.lat, ev.lngLat.lng]));
      popup(`<strong>ca. ${km} km</strong> von Bad Friedrichshall<br>${status(km)}<br><a class="more" href="anfrage.html">Jetzt anfragen</a>`)
        .setLngLat(ev.lngLat).addTo(map);
    });
  };

  let immer = false;
  try { immer = localStorage.getItem("karte") === "immer"; } catch (e) {}
  karte.querySelector(".karte-laden").addEventListener("click", () => {
    if (karte.querySelector(".karte-merken").checked) { try { localStorage.setItem("karte", "immer"); } catch (e) {} }
    starten().catch(() => { karte.querySelector(".karte-hinweis p").textContent = "Die Karte konnte gerade nicht geladen werden. Bitte versuchen Sie es später noch einmal."; });
  });
  if (immer) starten();
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
