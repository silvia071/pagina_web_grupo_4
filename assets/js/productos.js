import { productos } from "./data.js";
import { addToCart, syncCartCount } from "./carrito-utils.js";

function rutaImg(img) { 
  if (img.startsWith("/")) return img;
  return location.pathname.includes("/pages/")
    ? "../" + img.replace(/^\.?\/*/, "")
    : img;
}

function cardProducto(p) {
  const div = document.createElement("div");
  div.className = "producto";
  div.innerHTML = `
    <h3>${p.nombre}</h3>
    <img src="${rutaImg(p.img)}" alt="${p.nombre}" loading="lazy" />
    <p><strong>Precio: $${p.precio.toLocaleString("es-AR")}</strong></p>
    <p>${p.descripcion}</p>
    <p>Categoría: ${p.categoria} • Stock: ${p.stock}</p>
    <button class="btn-add" data-id="${p.id}" ${p.stock === 0 ? "disabled" : ""}>Agregar al carrito</button>
    <a href="detalle.html?id=${p.id}" class="btn-detalle" target="_blank"> Ver detalle</a>
  `;
  return div;
}

function llenarFiltroCategorias() {
  const filtro = document.getElementById("filtroCategoria");
  if (!filtro) return;
  const categorias = Array.from(new Set(productos.map(p => p.categoria)));
  filtro.innerHTML = `<option value="todas">Todas</option>` +
    categorias.map(cat => `<option value="${cat}">${cat}</option>`).join("");
}

function actualizarContador(cantidad) {
  const el = document.getElementById("contador");
  if (!el) return;
  el.textContent = `Mostrando ${cantidad} producto${cantidad === 1 ? "" : "s"}`;
}

function renderProductos(filtrarCategoria = "todas") {
  const cont = document.getElementById("gridProductos");
  cont.innerHTML = "";
  let lista = productos;
  if (filtrarCategoria !== "todas") {
    lista = productos.filter(p => p.categoria === filtrarCategoria);
  }
  lista.forEach((p) => cont.appendChild(cardProducto(p)));
  actualizarContador(lista.length);
}

function manejarAgregarCarrito() {
  const cont = document.getElementById("gridProductos");
  cont.addEventListener("click", (e) => {
    const btn = e.target.closest(".btn-add");
    if (!btn) return;
    const res = addToCart(btn.dataset.id, 1);
    if (!res.ok) return alert(res.error);
    btn.textContent = "Agregado ✓";
    setTimeout(() => (btn.textContent = "Agregar al carrito"), 900); 
    syncCartCount();
    const filtro = document.getElementById("filtroCategoria");
    renderProductos(filtro.value);
  });
}

function manejarFiltro() {
  const filtro = document.getElementById("filtroCategoria");
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
