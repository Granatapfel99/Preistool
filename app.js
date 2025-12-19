const JSON_FILE =
  "https://script.googleusercontent.com/macros/echo?user_content_key=AehSKLi-ho_Xmi_5smKYF5QW2gNbyqKQsqUrChxx2rs-2CSSYLxMTfrbVZQIRtP8pWZi4qWnrNWYkqW6nbAMNzhP34yDtjNHuWYttLCKGNs2sRy483HTfIfqrCRUxO1vuuNM5TP_8Aij7nqfSXAN13iZfVVMQXBvjmdMIo6ws9aMR9Lgq0jqM18RSRmQ7kC7IBSt8EbgUHO7USoKRSAzmo9maVRp4fpeEmDAv4mHUTO12eJRgcqs-fQeVbQFGupi3EYx5HyZkeohpU4rzXlHOLJqoCVI7wq0gQ&lib=MrmxPIqH4sSvTYrMaY0FRoptJDvP0MYyG";

let items = [];
let lastUpdateRaw = "";

/* ===== Zahl sicher parsen ===== */
function num(v) {
  if (v === null || v === undefined || v === "") return 0;
  return Number(String(v).replace(",", ".")) || 0;
}

/* =====================================================
   DARKMODE – Toggle + Speicherung
   ===================================================== */
const darkBtn = document.getElementById("darkToggle");
const body = document.body;

// beim Laden Zustand setzen
if (localStorage.getItem("darkmode") === "on") {
  body.classList.add("dark");
  darkBtn.textContent = "☀️";
}

// Klick auf Button
darkBtn.addEventListener("click", () => {
  body.classList.toggle("dark");

  const isDark = body.classList.contains("dark");
  localStorage.setItem("darkmode", isDark ? "on" : "off");
  darkBtn.textContent = isDark ? "☀️" : "🌙";
});

/* =====================================================
   Initial laden
   ===================================================== */
fetchData();
setInterval(fetchData, 30000);

document.getElementById("filter").addEventListener("input", render);

/* ===== Daten laden ===== */
function fetchData() {
  fetch(JSON_FILE + "&t=" + Date.now())
    .then(r => {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    })
    .then(j => {
      items = j.items || [];
      lastUpdateRaw = j.lastUpdate || "";
      updateTimestamp();
      updateCount();
      render();
    })
    .catch(err => {
      console.error(err);
      document.getElementById("update").innerText =
        "Fehler beim Laden der Daten";
    });
}

/* ===== Zeitstempel ===== */
function updateTimestamp() {
  if (!lastUpdateRaw) return;

  const d = new Date(lastUpdateRaw.replace(" ", "T"));
  const mins = Math.round((Date.now() - d.getTime()) / 60000);

  document.getElementById("update").innerText =
    mins <= 1
      ? "Gerade aktualisiert"
      : "Aktualisiert vor " + mins + " Minuten";
}

/* ===== Artikelanzahl ===== */
function updateCount() {
  const el = document.getElementById("count");
  if (!el) return;

  el.innerText = items.length > 0
    ? items.length + " Artikel gepflegt"
    : "";
}

/* ===== Rendern ===== */
function render() {
  const f = document.getElementById("filter").value.toLowerCase();
  const list = document.getElementById("list");
  list.innerHTML = "";

  items
    .filter(i =>
      (i.name || "").toLowerCase().includes(f) ||
      (i.kategorie || "").toLowerCase().includes(f)
    )
    .forEach((i, idx) => {

      const abw = i.abweichung_zum_vorschlag === "ja";

      list.innerHTML += `
        <div class="item">
          <div><b>${i.name}</b> (${i.kategorie})</div>

          <div class="price">
            <b>Errechneter Preis: ${num(i.verkaufspreis).toFixed(2)} €</b>
          </div>

          <div class="${abw ? "warn" : "ok"}">
            ${abw ? "⚠ Abweichung zum Vorschlag" : "✓ Preis entspricht Vorschlag"}
          </div>

          <button onclick="toggle(${idx})">Details</button>

          <div class="details" id="d${idx}">
            Rohpreis: ${num(i.rohpreis).toFixed(2)} €<br>
            EK netto: ${num(i.ek_netto).toFixed(2)} €<br>
            EK brutto: ${num(i.ek_brutto).toFixed(2)} €<br>
            Vorschlagspreis: ${num(i.preisschild).toFixed(2)} €<br>
            Im Automat: ${i.im_automat}<br>
            Bestand: ${i.bestand} Stk
          </div>
        </div>
      `;
    });
}

/* ===== Details Toggle ===== */
function toggle(idx) {
  const el = document.getElementById("d" + idx);
  el.style.display = el.style.display === "block" ? "none" : "block";
}
