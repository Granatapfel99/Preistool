const JSON_FILE =
  "https://script.google.com/macros/s/AKfycbxv6YW4iFXqTrxIB5J-5BxWQ1E8Jt3I4Wa9R__i_eHdYh3suRvpT8EJWxRGFyoaFgfw/exec";

let items = [];
let lastUpdateRaw = "";

/* ===== Zahl sicher parsen (kein NaN, Komma erlaubt) ===== */
function num(v) {
  if (v === null || v === undefined || v === "") return 0;
  return Number(String(v).replace(",", ".")) || 0;
}

/* ===== Initial laden ===== */
fetchData();
setInterval(fetchData, 30000); // alle 30 Sekunden

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
            ${num(i.verkaufspreis).toFixed(2)} €
          </div>

          <div class="${abw ? "warn" : "ok"}">
            ${abw ? "⚠ Abweichung zum Vorschlag" : "✓ Preis entspricht Vorschlag"}
          </div>

          <button onclick="toggle(${idx})">Details</button>

          <div class="details" id="d${idx}">
            Rohpreis: ${num(i.rohpreis).toFixed(2)} €<br>
            EK netto: ${num(i.ek_netto).toFixed(2)} €<br>
            EK brutto: ${num(i.ek_brutto).toFixed(2)} €<br>
            Preisschild: ${num(i.preisschild).toFixed(2)} €<br>
            Im Automat: ${i.im_automat}<br>
            Bestand: ${i.bestand} Stk
          </div>
        </div>
      `;
    });
}

/* ===== Details ein/aus ===== */
function toggle(idx) {
  const el = document.getElementById("d" + idx);
  el.style.display = el.style.display === "block" ? "none" : "block";
}



