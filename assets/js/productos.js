/// productos.js - usando fetch a data.json (sin import de data.js)
import {
  addToCart,
  syncCartCount,
  toast,
  findProduct,
} from "./carrito-utils.js";

const DATA_URL = "../assets/data.json";
let productos = [];

// Cartel dentro de la tarjeta de producto (similar al de detalle)
function showMsgProducto(card, texto, type = "success") {
  if (!card) return;

  let box = card.querySelector(".card-msg");
  if (!box) {
    box = document.createElement("div");
    box.className = "card-msg inline-msg";
    card.appendChild(box); // al final de la card, debajo de los botones
  }

  box.textContent = texto;
  box.classList.remove("warning", "success", "hide");
  box.classList.add(type === "warning" ? "warning" : "success");

  clearTimeout(box._timer);
  box._timer = setTimeout(() => {
    box.classList.add("hide");
  }, 2000);
}

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

    <div class="acciones">
      <button
        class="btn-accion btn-add"
        data-id="${p.id}"
        data-stock="${stockNum ?? ""}"
      >
        ${
          typeof stockNum === "number" && stockNum <= 0
            ? "Sin stock"
            : "Agregar al carrito"
        }
      </button>

      <a
        href="detalle.html?id=${p.id}"
        class="btn-accion btn-detalle"
        target="_blank"
      >
        Ver detalle
      </a>
    </div>
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

    const card = btn.closest(".producto");
    const stockAttr = btn.dataset.stock;
    const stockNum = stockAttr === "" ? null : Number(stockAttr);

    // caso: ya sabemos que no hay stock
    if (typeof stockNum === "number" && stockNum <= 0) {
      toast("Producto sin stock", "warning");
      showMsgProducto(card, "Producto sin stock", "warning");
      return;
    }

    const res = addToCart(btn.dataset.id, 1);
    if (!res.ok) {
      const msg = res.error || "Error al agregar";
      toast(msg, "warning");
      if (msg.toLowerCase().includes("stock")) {
        showMsgProducto(card, "Producto sin stock", "warning");
      } else {
        showMsgProducto(card, msg, "warning");
      }
      return;
    }

    // éxito
    toast("Producto agregado correctamente", "success");
    showMsgProducto(card, "Agregado al carrito", "success");
    syncCartCount();

    btn.textContent = "Agregado ✓";

    setTimeout(() => {
      btn.textContent = "Agregar al carrito";
      const filtro = document.getElementById("filtroCategoria");
      renderProductos(filtro ? filtro.value : "todas");
    }, 900);
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
