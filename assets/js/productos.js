// productos.js - usando fetch a data.json (sin import de data.js)
import {
  addToCart,
  syncCartCount,
  toast,
  findProduct,
} from "./carrito-utils.js";

const DATA_URL = "../assets/data.json";
let productos = [];

async function cargarProductos() {
  try {
    const res = await fetch(DATA_URL, { cache: "no-store" });
    if (!res.ok) throw new Error(`Error ${res.status} al leer ${DATA_URL}`);
    productos = await res.json();

    // opcional: cache para detalle.html
    try {
      localStorage.setItem("productosStock", JSON.stringify(productos));
    } catch {}
  } catch (err) {
    console.error("[productos] No se pudo cargar el catálogo:", err);
    productos = [];
    const msg = document.getElementById("detalleMsg");
    if (msg) msg.textContent = "No se pudo cargar el catálogo local.";
  }
}

function rutaImg(img) {
  if (!img) return "";
  if (String(img).startsWith("/")) return img;
  return location.pathname.includes("/pages/")
    ? "../" + String(img).replace(/^\.?\/*/, "")
    : String(img);
}

function cardProducto(p) {
  const stockNum = p.stock == null ? null : Number(p.stock);
  const div = document.createElement("div");
  div.className = "producto";
  div.innerHTML = `
    <h3>${p.nombre}</h3>
    <img src="${rutaImg(p.img)}" alt="${p.nombre}" loading="lazy" />
    <p><strong>Precio: $${Number(p.precio).toLocaleString("es-AR")}</strong></p>
    <p>${p.descripcion}</p>
    <p>Categoría: ${p.categoria} • Stock: ${stockNum ?? "—"}</p>
    <button class="btn-add" data-id="${p.id}" data-stock="${stockNum ?? ""}">
       ${
         typeof stockNum === "number" && stockNum <= 0
           ? "Sin stock"
           : "Agregar al carrito"
       }
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
  lista.forEach((pBase) => {
    const pReal = (() => {
      try {
        return findProduct?.(pBase.id) || pBase;
      } catch {
        return pBase;
      }
    })();
    // mantené todos los campos del JSON, pero reemplazá stock (y cualquier otro que te calcule findProduct)
    const pUI = { ...pBase, ...pReal };
    cont.appendChild(cardProducto(pUI));
  });
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

    const res = addToCart(btn.dataset.id, 1);
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

document.addEventListener("DOMContentLoaded", async () => {
  // 1) cargar JSON
  await cargarProductos();

  // 2) inicializar UI
  llenarFiltroCategorias();
  const filtro = document.getElementById("filtroCategoria");
  const guardada = localStorage.getItem("filtroCategoriaSel") || "todas";
  if (filtro) filtro.value = guardada;
  renderProductos(guardada);

  // 3) eventos
  manejarAgregarCarrito();
  manejarFiltro();
  syncCartCount();
});
