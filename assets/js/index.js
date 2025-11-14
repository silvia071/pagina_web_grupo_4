const DATA_URL = `${location.origin}/assets/data.json`;

async function cargarCatalogo() {
  try {
    const cache = localStorage.getItem("productosStock");
    if (cache) {
      const arr = JSON.parse(cache);
      if (Array.isArray(arr) && arr.length) return arr;
    }
  } catch {}

  const res = await fetch(DATA_URL, { cache: "no-store" });
  if (!res.ok) throw new Error(`Error ${res.status} al leer ${DATA_URL}`);
  const data = await res.json();

  try {
    localStorage.setItem("productosStock", JSON.stringify(data));
  } catch {}
  return data;
}

function tomarAleatorios(arr, n = 3) {
  const src = Array.isArray(arr) ? [...arr] : [];
  const enStock = src.filter((p) => Number(p?.stock) > 0);
  const base = enStock.length >= n ? enStock : src;
  for (let i = base.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [base[i], base[j]] = [base[j], base[i]];
  }
  return base.slice(0, n);
}

function rutaImg(img) {
  if (!img) return "";
  if (String(img).startsWith("/")) return img;
  return String(img).replace(/^\.?\/*/, "");
  ("assets/...");
}

function precioARS(n) {
  const num = Number(n);
  if (Number.isNaN(num)) return "—";
  try {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0,
    }).format(num);
  } catch {
    return `$ ${num.toLocaleString("es-AR")}`;
  }
}

function cardDestacado(p) {
  const div = document.createElement("div");
  div.className = "producto destacado";
  div.innerHTML = `
    <img src="${rutaImg(p.img)}" alt="${p.nombre}" loading="lazy" />
    <h3>${p.nombre}</h3>
  `;
  return div;
}

async function initIndex() {
  const cont = document.querySelector("#destacados .cards");
  const msg = document.getElementById("detalleMsg"); // opcional
  if (!cont) return;

  cont.classList.add("grid");
  cont.innerHTML = "";

  try {
    const catalogo = await cargarCatalogo();
    const destacados = tomarAleatorios(catalogo, 3);

    if (!destacados.length) {
      cont.innerHTML = "<p>No hay productos para mostrar.</p>";
      return;
    }

    destacados.forEach((p) => cont.appendChild(cardDestacado(p)));
    msg && (msg.textContent = "");
  } catch (err) {
    console.error("[index] No se pudo cargar el catálogo:", err);
    cont.innerHTML = "<p>No se pudo cargar los productos destacados.</p>";
    msg && (msg.textContent = "No se pudo cargar el catálogo local.");
  }
}


document.addEventListener("DOMContentLoaded", initIndex);
