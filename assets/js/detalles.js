/*
// Código completo y limpio para detalles.js

import { addToCart, findProduct } from "./carrito-utils.js";

function getIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

function showInlineMsg(container, text, type = "warning") {
  if (!container) return;
  let el = container.querySelector("#detalleMsg");
  if (!el) {
    el = document.createElement("div");
    el.id = "detalleMsg";
    el.setAttribute("aria-live", "polite");
    container.appendChild(el);
  }
  el.textContent = text;
  Object.assign(el.style, {
    display: "inline-block",
    padding: "8px 10px",
    marginTop: "8px",
    borderRadius: "6px",
    background: type === "warning" ? "#fff4e5" : "#d1f7c4",
    border: "1px solid " + (type === "warning" ? "#e0b84d" : "#86d27c"),
    color: "#000",
  });
  clearTimeout(el._hideTimer);
  el._hideTimer = setTimeout(() => {
    el.textContent = "";
    el.style.cssText = "";
  }, 3500);
}

function mostrarDetalle() {
  const id = getIdFromUrl();
  const producto = findProduct(id); // obtiene stock normalizado y actual
  const cont = document.getElementById("detalleProducto");
  if (!cont) return;

  if (!producto) {
    cont.innerHTML = "<p>Producto no encontrado.</p>";
    return;
  }

  cont.innerHTML = `
    <button id="btnVolver" class="btn-back" aria-label="Volver">← Volver</button>
    <h2>${producto.nombre}</h2>
    <img src="../${producto.img}" alt="${
    producto.nombre
  }" style="max-width:300px;" />
    <p><strong>Precio:</strong> $${producto.precio.toLocaleString("es-AR")}</p>
    <p><strong>Detalle:</strong> ${producto.detalle}</p>
    <p><strong>Categoría:</strong> ${producto.categoria}</p>
    <p><strong>Stock:</strong> <span class="stockVal">${
      producto.stock ?? "—"
    }</span></p>
    <div class="agregar" style="margin-top:10px;">
      <label for="qty">Cantidad:</label>
      <input id="qty" type="number" min="1" value="1" style="width:64px; margin-left:8px;" />
      <button id="btnAgregar" class="btn-add" style="margin-left:12px;">Agregar al carrito</button>
    </div>
  `;

  // back button
  const btnVolver = document.getElementById("btnVolver");
  if (btnVolver) {
    btnVolver.addEventListener("click", () => {
      if (history.length > 1) {
        history.back();
        return;
      }
      try {
        const ref = document.referrer;
        if (ref) {
          const refOrigin = new URL(ref).origin;
          if (refOrigin === location.origin) {
            window.location.href = ref;
            return;
          }
        }
      } catch (e) {}
      window.location.href = "index.html";
    });
  }

  // handlers para agregar
  const btnAgregar = document.getElementById("btnAgregar");
  const qtyInput = document.getElementById("qty");
  const stockEl = cont.querySelector(".stockVal");

  // desactivar si no hay stock numérico
  if (btnAgregar && typeof producto.stock === "number" && producto.stock <= 0) {
    btnAgregar.disabled = true;
  }

  if (btnAgregar) {
    btnAgregar.addEventListener("click", () => {
      const qty = Math.max(1, parseInt(qtyInput.value, 10) || 1);
      const res = addToCart(producto.id, qty);

      if (!res.ok) {
        // mostrar mensaje en pantalla (inline)
        showInlineMsg(cont, res.error ?? "Error al agregar", "warning");
        return;
      }

      // éxito: re-renderizar para mostrar stock actualizado (findProduct leerá stock nuevo)
      mostrarDetalle();
    });
  }
}

document.addEventListener("DOMContentLoaded", mostrarDetalle);
*/
// detalle.js — eBay Browse API (item/{id})
import { addToCart } from "./carrito-utils.js";

// Config
const EBAY_API = "https://api.ebay.com/buy/browse/v1"; // usar sandbox si corresponde
const CURRENCY_FALLBACK = "USD";

// Helpers
function getIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

function getToken() {
  return window.EBAY_TOKEN || localStorage.getItem("EBAY_TOKEN") || "";
}

const fmtMoney = (value, currency) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: currency || CURRENCY_FALLBACK,
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

function showInlineMsg(container, text, type = "warning") {
  if (!container) return;
  let el = container.querySelector("#detalleMsg");
  if (!el) {
    el = document.createElement("div");
    el.id = "detalleMsg";
    el.setAttribute("aria-live", "polite");
    container.appendChild(el);
  }
  el.textContent = text;
  Object.assign(el.style, {
    display: "inline-block",
    padding: "8px 10px",
    marginTop: "8px",
    borderRadius: "6px",
    background: type === "warning" ? "#fff4e5" : "#d1f7c4",
    border: "1px solid " + (type === "warning" ? "#e0b84d" : "#86d27c"),
    color: "#000",
  });
  clearTimeout(el._hideTimer);
  el._hideTimer = setTimeout(() => {
    el.textContent = "";
    el.style.cssText = "";
  }, 3500);
}

function bestImage(item) {
  // Orden de preferencia: image.imageUrl -> images[0] -> thumbnailImages[0]
  if (item.image?.imageUrl) return item.image.imageUrl;
  if (Array.isArray(item.images) && item.images[0]?.imageUrl) return item.images[0].imageUrl;
  if (Array.isArray(item.thumbnailImages) && item.thumbnailImages[0]?.imageUrl) return item.thumbnailImages[0].imageUrl;
  return "";
}

function mapItemDetail(x) {
  // eBay puede devolver distintos campos de precio (fijo, oferta, etc.)
  const priceVal = x.price?.value ?? x.currentBidPrice?.value ?? 0;
  const priceCur = x.price?.currency ?? x.currentBidPrice?.currency ?? CURRENCY_FALLBACK;

  // Descripción: el endpoint item no siempre trae texto largo; si necesitás más, usarías la Browse Marketing API.
  const shortDesc =
    x.shortDescription ||
    (Array.isArray(x.localizedAspects) ? x.localizedAspects.map(a => `${a.name}: ${a.value}`).join(" · ") : "") ||
    "";

  const catPath = x.categoryPath || (Array.isArray(x.categories) ? x.categories.map(c => c.categoryName).join(" / ") : "");

  return {
    id: x.itemId || x.legacyItemId || x.title,
    nombre: x.title || "Producto",
    precio: Number(priceVal),
    moneda: priceCur,
    detalle: shortDesc,
    categoria: catPath,
    img: bestImage(x),
    stock: null, // Browse no expone stock como número simple
  };
}

async function fetchItemDetail(itemId) {
  const token = getToken();
  if (!token) {
    throw new Error("Falta EBAY_TOKEN. Guardalo con localStorage.setItem('EBAY_TOKEN','...') y scope buy.browse.readonly");
  }
  const url = `${EBAY_API}/item/${encodeURIComponent(itemId)}`;
  const r = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  if (!r.ok) {
    const body = await r.text();
    console.error("eBay item error:", r.status, body);
    throw new Error(`eBay HTTP ${r.status}. Revisá consola para detalle.`);
  }
  return r.json();
}

function wireBackButton() {
  const btnVolver = document.getElementById("btnVolver");
  if (!btnVolver) return;
  btnVolver.addEventListener("click", () => {
    if (history.length > 1) {
      history.back();
      return;
    }
    try {
      const ref = document.referrer;
      if (ref) {
        const refOrigin = new URL(ref).origin;
        if (refOrigin === location.origin) {
          window.location.href = ref;
          return;
        }
      }
    } catch {}
    window.location.href = "index.html";
  });
}

function render(producto) {
  const cont = document.getElementById("detalleProducto");
  if (!cont) return;

  cont.innerHTML = `
    <button id="btnVolver" class="btn-back" aria-label="Volver">← Volver</button>
    <h2>${producto.nombre}</h2>
    <img src="${producto.img}" alt="${producto.nombre}" style="max-width:300px;" />
    <p>Precio: ${fmtMoney(producto.precio, producto.moneda)}</p>
    <p>Detalle: ${producto.detalle || "—"}</p>
    <p>Categoría: ${producto.categoria || "—"}</p>
    <p>Stock: <span class="stockVal">${producto.stock ?? "—"}</span></p>
    <div class="agregar" style="margin-top:10px;">
      <label for="qty">Cantidad:</label>
      <input id="qty" type="number" min="1" value="1" style="width:64px; margin-left:8px;" />
      <button id="btnAgregar" class="btn-add" style="margin-left:12px;">Agregar al carrito</button>
    </div>
  `;

  wireBackButton();

  const btnAgregar = document.getElementById("btnAgregar");
  const qtyInput = document.getElementById("qty");

  if (btnAgregar) {
    btnAgregar.addEventListener("click", () => {
      const qty = Math.max(1, parseInt(qtyInput.value, 10) || 1);
      const res = addToCart(producto.id, qty);
      if (!res?.ok) {
        showInlineMsg(cont, res?.error ?? "Error al agregar", "warning");
        return;
      }
      showInlineMsg(cont, "Producto agregado correctamente", "success");
    });
  }
}

async function init() {
  const cont = document.getElementById("detalleProducto");
  if (!cont) return;

  const id = getIdFromUrl();
  if (!id) {
    cont.innerHTML = "<p>Falta ?id= en la URL.</p>";
    return;
  }

  cont.innerHTML = "<p>Cargando…</p>";

  try {
    const raw = await fetchItemDetail(id);
    const p = mapItemDetail(raw);
    render(p);
  } catch (err) {
    console.error(err);
    cont.innerHTML = "<p>No se pudo cargar el producto.</p>";
  }
}

document.addEventListener("DOMContentLoaded", init);
