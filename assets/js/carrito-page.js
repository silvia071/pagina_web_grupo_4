import {
  getCart,
  cartTotal,
  syncCartCount,
  changeQty,
  removeFromCart,
  clearCart,
  findProduct,
  toast,
} from "./carrito-utils.js";

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
    const prod = findProduct(item.id);
    const disp = typeof prod?.stock === "number" ? prod.stock : null;
    const plusDisabled = disp !== null && disp <= 0 ? "disabled" : "";

    tr.dataset.id = item.id;
    tr.innerHTML = `
      <td>${item.nombre}</td>
      <td>$${item.precio.toLocaleString("es-AR")}</td>
      <td class="qty">
        <button class="btn-menos" data-accion="menos" aria-label="Disminuir">−</button>
        <input class="qty-input" value="${
          item.cantidad
        }" readonly aria-label="Cantidad">
        <button class="btn-mas" data-accion="mas" ${plusDisabled} aria-label="Aumentar">+</button>
        ${disp !== null ? `<small class="disp">Disp: ${disp}</small>` : ""}
      </td>
      <td>$${(item.precio * item.cantidad).toLocaleString("es-AR")}</td>
      <td><button class="btn-eliminar" data-accion="eliminar" aria-label="Eliminar">🗑️</button></td>
    `;
    body.appendChild(tr);
  });

  totalEl.textContent = cartTotal().toLocaleString("es-AR");
  syncCartCount();
}

// Delegación de eventos (+/−/eliminar)
document.getElementById("carritoBody").addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-accion]");
  if (!btn) return;

  const fila = btn.closest("tr[data-id]");
  const id = fila?.dataset.id;
  const acc = btn.dataset.accion;

  if (acc === "mas") {
    const r = changeQty(id, +1);
    if (!r.ok) {
      if (r.error) toast(r.error, "warning");
      return;
    }
    renderCarrito();
  }

  if (acc === "menos") {
    const r = changeQty(id, -1);
    if (r?.toRemove) {
      if (confirm("¿Eliminar este producto del carrito?")) {
        removeFromCart(id);
        renderCarrito();
      }
      return;
    }
    if (!r.ok) {
      if (r.error) toast(r.error, "warning");
      return;
    }
    renderCarrito();
  }

  if (acc === "eliminar") {
    if (confirm("¿Eliminar este producto del carrito?")) {
      removeFromCart(id);
      renderCarrito();
    }
  }
});

// Botones: Vaciar / Finalizar
document.getElementById("vaciarCarrito").addEventListener("click", () => {
  if (!getCart().length) return;
  if (confirm("¿Está seguro de vaciar el carrito?")) {
    clearCart();
    renderCarrito();
    toast("Carrito vaciado", "success");
  }
});

document.getElementById("finalizarCompra").addEventListener("click", () => {
  if (!getCart().length) {
    toast("Tu carrito está vacío", "warning");
    return;
  }
  // Redirigí a tu checkout
  toast("Simulación: finalizar compra", "success");
});

document.addEventListener("DOMContentLoaded", renderCarrito);
