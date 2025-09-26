// assets/js/productos.js
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
    <button class="btn-add" data-id="${p.id}">Agregar al carrito</button>
  `;
  return div;
}

function renderProductos() {
  const cont = document.getElementById("gridProductos");
  cont.innerHTML = "";
  productos.forEach((p) => cont.appendChild(cardProducto(p)));
  cont.addEventListener("click", (e) => {
    const btn = e.target.closest(".btn-add");
    if (!btn) return;
    const res = addToCart(btn.dataset.id, 1);
    if (!res.ok) return alert(res.error);
    btn.textContent = "Agregado ✓";
    setTimeout(() => (btn.textContent = "Agregar al carrito"), 900);
    syncCartCount();
  });
}

document.addEventListener("DOMContentLoaded", renderProductos);
