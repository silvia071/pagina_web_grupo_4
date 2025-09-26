// assets/js/carrito-page.js
import { getCart, cartTotal, syncCartCount } from "./carrito-utils.js";

function renderCarrito() {
  const body = document.getElementById("carritoBody");
  const vacio = document.getElementById("carritoVacio");
  const tabla = document.getElementById("carritoTabla");
  const totalEl = document.getElementById("total");

  const cart = getCart();
  body.innerHTML = "";

  if (cart.length === 0) {
    vacio.hidden = false;
    tabla.hidden = true;
    totalEl.textContent = "0";
    syncCartCount();
    return;
  }

  vacio.hidden = true;
  tabla.hidden = false;

  cart.forEach((item) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${item.nombre}</td>
      <td>$${item.precio.toLocaleString("es-AR")}</td>
      <td>${item.cantidad}</td>
      <td>$${(item.precio * item.cantidad).toLocaleString("es-AR")}</td>
    `;
    body.appendChild(tr);
  });

  totalEl.textContent = cartTotal().toLocaleString("es-AR");
  syncCartCount();
}
document.addEventListener("DOMContentLoaded", renderCarrito);
