/*
import { productos } from "./data.js";
import { addToCart, syncCartCount, toast } from "./carrito-utils.js";

function rutaImg(img) {
  if (!img) return "";
  if (String(img).startsWith("/")) return img;
  return location.pathname.includes("/pages/")
    ? "../" + String(img).replace(/^\.?\/, "")
    : String(img);
}

function cardProducto(p) {
  const stockNum = p.stock == null ? null : Number(p.stock);
  const div = document.createElement("div");
  div.className = "producto";
  div.innerHTML = `
    <h3>${p.nombre}</h3>
    <img src="${rutaImg(p.img)}" alt="${p.nombre}" loading="lazy" />
    <p><strong>Precio: $${p.precio.toLocaleString("es-AR")}</strong></p>
    <p>${p.descripcion}</p>
    <p>Categoría: ${p.categoria} • Stock: ${stockNum ?? "—"}</p>
    <button class="btn-add" data-id="${p.id}" data-stock="${stockNum ?? ""}">
      ${stockNum === 0 ? "Sin stock" : "Agregar al carrito"}
    </button>
    <a href="detalle.html?id=${
      p.id
    }" class="btn-detalle" target="_blank"> Ver detalle</a>
  `;
  return div;
}

function llenarFiltroCategorias() {
  const filtro = document.getElementById("filtroCategoria");
  if (!filtro) return;
  const categorias = Array.from(new Set(productos.map((p) => p.categoria)));
  filtro.innerHTML =
    `<option value="todas">Todas</option>` +
    categorias.map((cat) => `<option value="${cat}">${cat}</option>`).join("");
}

function actualizarContador(cantidad) {
  const el = document.getElementById("contador");
  if (!el) return;
  el.textContent = `Mostrando ${cantidad} producto${cantidad === 1 ? "" : "s"}`;
}

function renderProductos(filtrarCategoria = "todas") {
  const cont = document.getElementById("gridProductos");
  if (!cont) return;
  cont.innerHTML = "";
  let lista = productos;
  if (filtrarCategoria !== "todas") {
    lista = productos.filter((p) => p.categoria === filtrarCategoria);
  }
  lista.forEach((p) => cont.appendChild(cardProducto(p)));
  actualizarContador(lista.length);
}

function manejarAgregarCarrito() {
  const cont = document.getElementById("gridProductos");
  if (!cont) return;
  cont.addEventListener("click", (e) => {
    const btn = e.target.closest(".btn-add");
    if (!btn) return;

    const stockAttr = btn.dataset.stock;
    const stockNum = stockAttr === "" ? null : Number(stockAttr);
    console.log(
      "[productos] click btn, id:",
      btn.dataset.id,
      "stockAttr:",
      stockAttr,
      "stockNum:",
      stockNum
    );

    const res = addToCart(btn.dataset.id, 1);
    console.log("[productos] addToCart resultado:", res);
    if (!res.ok) {
      toast(res.error || "Error al agregar", "warning");
      return;
    }
    toast("Producto agregado correctamente", "success");

    btn.textContent = "Agregado ✓";
    setTimeout(() => (btn.textContent = "Agregar al carrito"), 900);
    syncCartCount();
    const filtro = document.getElementById("filtroCategoria");
    renderProductos(filtro ? filtro.value : "todas");
  });
}

function manejarFiltro() {
  const filtro = document.getElementById("filtroCategoria");
  if (!filtro) return;
  filtro.addEventListener("change", () => {
    localStorage.setItem("filtroCategoriaSel", filtro.value);
    renderProductos(filtro.value);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  llenarFiltroCategorias();
  const filtro = document.getElementById("filtroCategoria");
  const guardada = localStorage.getItem("filtroCategoriaSel") || "todas";
  if (filtro) filtro.value = guardada;
  renderProductos(guardada);
  manejarAgregarCarrito();
  manejarFiltro();
  syncCartCount();
});
*/

// productos.js — Catálogo desde eBay Browse API
// Reemplaza el archivo anterior. No usa "productos" locales.
// Necesita un token OAuth válido en localStorage.EBAY_TOKEN o window.EBAY_TOKEN.

// productos.js — eBay Browse API con diagnóstico + fallback
import { addToCart, syncCartCount, toast } from "./carrito-utils.js";

const EBAY_API = "https://api.ebay.com/buy/browse/v1";
const DEFAULT_LIMIT = 24;

// Cambiá a true si querés que, si eBay falla, se muestren productos de prueba
const USE_FALLBACK = true;

const CATS = [
  { key: "todas", label: "Todas", q: "home" },
  { key: "organizacion", label: "Organización", q: "home organizer storage" },
  { key: "cocina", label: "Cocina", q: "kitchen utensils cookware" },
  { key: "decoracion", label: "Decoración", q: "home decor" },
  { key: "jardin", label: "Jardín", q: "garden outdoor" },
  { key: "herramientas", label: "Herramientas", q: "tools hand power" },
];

function getToken() {
  // Guardalo así en consola: localStorage.setItem('EBAY_TOKEN','eyJhbGciOi...')
  return window.EBAY_TOKEN || localStorage.getItem("EBAY_TOKEN") || "";
}

const fmt = (value, currency) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: currency || "USD",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

function rutaImg(img) {
  if (!img) return "";
  if (String(img).startsWith("/")) return img;
  return location.pathname.includes("/pages/")
    ? "../" + String(img).replace(/^\.?\/*/, "")
    : String(img);
}

function mapItem(x, catLabel) {
  const priceVal = x.price?.value ?? x.currentBidPrice?.value ?? 0;
  const priceCur = x.price?.currency ?? x.currentBidPrice?.currency ?? "USD";
  const img =
    x.image?.imageUrl ||
    (Array.isArray(x.thumbnailImages) && x.thumbnailImages[0]?.imageUrl) ||
    "";

  return {
    id: x.itemId || x.item_id || x.legacyItemId || x.title,
    nombre: x.title,
    precio: Number(priceVal),
    moneda: priceCur,
    descripcion: x.shortDescription || "",
    categoria: catLabel || x.categoryPath || "",
    img,
    stock: null,
  };
}

async function buscarEbay({ q = "home", limit = DEFAULT_LIMIT }) {
  const token = getToken();
  if (!token) {
    throw new Error(
      "Falta EBAY_TOKEN (Bearer). Guardalo con localStorage.setItem('EBAY_TOKEN','...'). " +
        "El token debe tener el scope buy.browse.readonly y ser de producción para https://api.ebay.com"
    );
  }

  const url = new URL(`${EBAY_API}/item_summary/search`);
  url.searchParams.set("q", q);
  url.searchParams.set("limit", String(limit));

  const r = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!r.ok) {
    const raw = await r.text();
    // eBay suele responder JSON con detalles; lo mostramos en consola
    console.error("eBay error body:", raw);
    throw new Error(`eBay HTTP ${r.status}. Revísá consola para el detalle.`);
  }
  const data = await r.json();
  console.debug("eBay data:", data);
  return data;
}

// Fallback de cortesía (DummyJSON) para no dejar el sitio vacío si eBay falla
async function buscarFallback(limit = 24) {
  const r = await fetch(`https://dummyjson.com/products?limit=${limit}`);
  const data = await r.json();
  return data.products.map((p) => ({
    id: `FAKE-${p.id}`,
    nombre: p.title,
    precio: Number(p.price),
    moneda: "USD",
    descripcion: p.description,
    categoria: p.category,
    img: p.thumbnail,
    stock: null,
  }));
}

// ---------- UI ----------
function cardProducto(p) {
  const div = document.createElement("div");
  div.className = "producto";
  div.innerHTML = `
    <h3>${p.nombre}</h3>
    <img src="${rutaImg(p.img)}" alt="${p.nombre}" loading="lazy" />
    <p><strong>Precio: ${fmt(p.precio, p.moneda)}</strong></p>
    <p>${p.descripcion || ""}</p>
    <p>Categoría: ${p.categoria || "—"} • Stock: ${p.stock ?? "—"}</p>
    <button class="btn-add" data-id="${p.id}">Agregar al carrito</button>
    <a href="detalle.html?id=${encodeURIComponent(
      p.id
    )}" class="btn-detalle" target="_blank">Ver detalle</a>
  `;
  return div;
}

function llenarFiltroCategorias() {
  const filtro = document.getElementById("filtroCategoria");
  if (!filtro) return;
  filtro.innerHTML = CATS.map(
    (c) => `<option value="${c.key}">${c.label}</option>`
  ).join("");
}

function actualizarContador(n) {
  const el = document.getElementById("contador");
  if (el) el.textContent = `Mostrando ${n} producto${n === 1 ? "" : "s"}`;
}

let productosCache = [];

async function cargarProductos(catKey = "todas") {
  const cont = document.getElementById("gridProductos");
  if (!cont) return;
  cont.innerHTML = "Cargando…";

  try {
    const cat = CATS.find((c) => c.key === catKey) || CATS[0];
    const data = await buscarEbay({ q: cat.q, limit: DEFAULT_LIMIT });
    const items = data.itemSummaries || data.item_summaries || [];
    productosCache = items.map((x) => mapItem(x, cat.label));
    renderProductos();
  } catch (err) {
    console.error("[eBay] Error en carga:", err);
    toast(err.message || "No se pudieron cargar productos de eBay", "warning");

    if (USE_FALLBACK) {
      try {
        const fake = await buscarFallback(DEFAULT_LIMIT);
        productosCache = fake;
        renderProductos();
        const info = document.createElement("p");
        info.style.color = "#b36b00";
        info.textContent =
          "Mostrando datos de prueba (fallback) por error al consultar eBay.";
        cont.prepend(info);
      } catch (ferr) {
        console.error("[Fallback] Error:", ferr);
        cont.innerHTML =
          "No se pudieron cargar productos (eBay y fallback fallaron).";
      }
    } else {
      cont.innerHTML = "No se pudieron cargar productos de eBay.";
    }
  }
}

function renderProductos() {
  const cont = document.getElementById("gridProductos");
  if (!cont) return;
  cont.innerHTML = "";
  productosCache.forEach((p) => cont.appendChild(cardProducto(p)));
  actualizarContador(productosCache.length);
}

function manejarAgregarCarrito() {
  const cont = document.getElementById("gridProductos");
  if (!cont) return;
  cont.addEventListener("click", (e) => {
    const btn = e.target.closest(".btn-add");
    if (!btn) return;
    const res = addToCart(btn.dataset.id, 1);
    if (!res.ok) {
      toast(res.error || "Error al agregar", "warning");
      return;
    }
    toast("Producto agregado correctamente", "success");
    btn.textContent = "Agregado ✓";
    setTimeout(() => (btn.textContent = "Agregar al carrito"), 900);
    syncCartCount();
  });
}

function manejarFiltro() {
  const filtro = document.getElementById("filtroCategoria");
  if (!filtro) return;
  filtro.addEventListener("change", () => {
    const sel = filtro.value;
    localStorage.setItem("filtroCategoriaSel", sel);
    cargarProductos(sel);
  });
}

// ---------- INIT ----------
document.addEventListener("DOMContentLoaded", () => {
  llenarFiltroCategorias();
  const filtro = document.getElementById("filtroCategoria");
  const guardada = localStorage.getItem("filtroCategoriaSel") || "todas";
  if (filtro) filtro.value = guardada;

  cargarProductos(guardada);
  manejarAgregarCarrito();
  manejarFiltro();
  syncCartCount();
});
