import { productos } from "./data.js";
import { addToCart, syncCartCount } from "./carrito-utils.js";

// Ajusta la ruta de la imagen según la ubicación del HTML
function rutaImg(img) { 
  if (img.startsWith("/")) return img;
  return location.pathname.includes("/pages/")
    ? "../" + img.replace(/^\.?\/*/, "")
    : img;
}

// Crea la tarjeta HTML para un producto
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

// Llenar el select de categorías
function llenarFiltroCategorias() {
  const filtro = document.getElementById("filtroCategoria");
  if (!filtro) return;
  const categorias = Array.from(new Set(productos.map(p => p.categoria)));
  filtro.innerHTML = `<option value="todas">Todas</option>` +
    categorias.map(cat => `<option value="${cat}">${cat}</option>`).join("");
}

// Renderiza la grilla de productos según filtro
function renderProductos(filtrarCategoria = "todas") {
  const cont = document.getElementById("gridProductos");
  cont.innerHTML = "";
  let lista = productos;
  if (filtrarCategoria !== "todas") {
    lista = productos.filter(p => p.categoria === filtrarCategoria);
  }
  lista.forEach((p) => cont.appendChild(cardProducto(p)));
}

// Maneja clicks en los botones de agregar al carrito
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
    // Vuelve a renderizar para actualizar stock y botones
    const filtro = document.getElementById("filtroCategoria");
    renderProductos(filtro.value);
  });
}

// Evento para el filtro
function manejarFiltro() {
  const filtro = document.getElementById("filtroCategoria");
  filtro.addEventListener("change", () => {
    renderProductos(filtro.value);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  llenarFiltroCategorias();
  renderProductos();
  manejarAgregarCarrito();
  manejarFiltro();
  syncCartCount();
});