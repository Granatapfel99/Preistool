const JSON_FILE =
  "https://drive.google.com/uc?export=download&id=1MSQd7q7X6T7Oe8eFOJ7AATKebk94mMk1";

let items = [];
let lastUpdateRaw = "";

fetchData();
setInterval(fetchData, 30000); // alle 30 Sekunden

document.getElementById("filter").addEventListener("input", render);

function fetchData() {
  fetch(JSON_FILE + "&t=" + Date.now())
    .then(r => r.json())
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

function updateTimestamp() {
  if (!lastUpdateRaw) return;

  const d = new Date(lastUpdateRaw.replace(" ", "T"));
  const mins = Math.round((Date.now() - d.getTime()) / 60000);

  document.getElementById("update").innerText =
    mins <= 1
      ? "Gerade aktualisiert"
      : "Aktualisiert vor " + mins + " Minuten";
}

function render() {
  const f = document.getElementById("filter").value.toLowerCase();
  const list = document.getElementById("list");
  list.innerHTML = "";

  items
    .filter(i =>
      i.name.toLowerCase().includes(f) ||
      i.kategorie.toLowerCase().includes(f)
    )
    .forEach((i, idx) => {

      const abw = i.abweichung_zum_vorschlag === "ja";

      list.innerHTML += `
        <div class="item">
          <div><b>${i.name}</b> (${i.kategorie})</div>

          <div class="price">
            ${Number(i.verkaufspreis).toFixed(2)} €
          </div>

          <div class="${abw ? "warn" : "ok"}">
            ${abw ? "⚠ Abweichung zum Vorschlag" : "✓ Preis entspricht Vorschlag"}
          </div>

          <button onclick="toggle(${idx})">Details</button>

          <div class="details" id="d${idx}">
            Rohpreis: ${Number(i.rohpreis).toFixed(2)} €<br>
            EK netto: ${Number(i.ek_netto).toFixed(2)} €<br>
            EK brutto: ${Number(i.ek_brutto).toFixed(2)} €<br>
            Preisschild: ${Number(i.preisschild).toFixed(2)} €<br>
            Im Automat: ${i.im_automat}<br>
            Bestand: ${i.bestand} Stk
          </div>
        </div>
      `;
    });
}

function toggle(idx) {
  const el = document.getElementById("d" + idx);
  el.style.display = el.style.display === "block" ? "none" : "block";
}
