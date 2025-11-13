import { productos, guardarProductos } from "./data.js";


const KEY = "carrito";

export function getCart() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) ?? [];
  } catch {
    return [];
  }
}

export function saveCart(cart) {
  localStorage.setItem(KEY, JSON.stringify(cart));
  syncCartCount();
  updateCartSummary();
}

export function syncCartCount() {
  const count = getCart().reduce((acc, it) => acc + it.cantidad, 0);
  document
    .querySelectorAll("#cartCount")
    .forEach((el) => (el.textContent = count));
}


function normalizeStock(p) {
  if (!p) return;
  if (p.stock == null) {
    p.stock = null;
    return;
  }
  if (typeof p.stock !== "number") {
    const n = Number(p.stock);
    p.stock = Number.isFinite(n) ? n : null;
  }
}

export function findProduct(id) {
  const p = productos.find((x) => String(x.id) === String(id));
  normalizeStock(p);
  return p;
}


function ensureToastHost() {
  let box = document.getElementById("toastBox");
  if (!box) {
    box = document.createElement("div");
    box.id = "toastBox";

    box.className = "toast-box"; 

    document.body.appendChild(box); 
  }
  return box;
}

export function toast(msg, type = "success", opts = {}) {
  const box = ensureToastHost();
  const n = document.createElement("div");
  n.className = "toast toast-" + (type === "warning" ? "warning" : "success");
  n.setAttribute("role", "status");
  n.setAttribute("aria-live", type === "warning" ? "assertive" : "polite");
  n.innerHTML = `
    <div class="toast-icon">${type === "warning" ? "⚠️" : "✓"}</div>
    <div class="toast-text">${String(msg)}</div>
    <button class="toast-close" aria-label="Cerrar">✕</button>
  `;
  const closeBtn = n.querySelector(".toast-close");
  let autoTimer = null;

  function close(animated = true) {
    if (autoTimer) clearTimeout(autoTimer);
    if (animated) {
      n.style.animation = "toast-out .12s ease-in forwards";
      setTimeout(() => n.remove(), 140);
    } else n.remove();
  }

  closeBtn.addEventListener("click", () => close());
  n.addEventListener("mouseenter", () => {
    if (autoTimer) clearTimeout(autoTimer);
  });
  n.addEventListener("mouseleave", () => {
    if (opts.duration !== 0)
      autoTimer = setTimeout(() => close(), opts.duration ?? 3500);
  });

  box.appendChild(n);
  if (opts.duration !== 0)
    autoTimer = setTimeout(() => close(), opts.duration ?? 3500);
  return n;
}


export function addToCart(id, qty = 1) {
  const p = findProduct(id);
  if (!p) {
    return { ok: false, error: "Producto no encontrado" };
  }

  const stockNum = p.stock == null ? null : Number(p.stock);

  if (stockNum !== null && Number.isFinite(stockNum) && stockNum <= 0) {
    return { ok: false, error: "No hay stock disponible" };
  }

  if (stockNum !== null && Number.isFinite(stockNum) && stockNum < qty) {
    toast("No hay stock suficiente", "warning");
    return { ok: false, error: "No hay stock suficiente" };
  }

  const cart = getCart();
  const existing = cart.find((it) => String(it.id) === String(id));
  if (existing) existing.cantidad += qty;
  else
    cart.push({ id: p.id, nombre: p.nombre, precio: p.precio, cantidad: qty });

  if (stockNum !== null && Number.isFinite(stockNum)) {
    p.stock = Math.max(0, stockNum - qty);
  }

  guardarProductos();
  saveCart(cart);

  return { ok: true };
}

export function changeQty(id, delta) {
  const cart = getCart();
  const it = cart.find((x) => String(x.id) === String(id));
  if (!it) return { ok: false, error: "Item no encontrado" };

  const p = findProduct(id);
  const nueva = it.cantidad + delta;

  if (nueva < 1) return { ok: false, toRemove: true };

  if (delta > 0) {
    const stockNum = p && p.stock != null ? Number(p.stock) : null;
    if (stockNum !== null && Number.isFinite(stockNum) && stockNum < delta)
      return { ok: false, error: "No hay stock suficiente" };
    if (p && stockNum !== null && Number.isFinite(stockNum)) {
      p.stock = Math.max(0, stockNum - delta);
    }
  } else if (delta < 0) {
    if (p && p.stock != null) p.stock = Number(p.stock) + Math.abs(delta);
  }

  it.cantidad = nueva;
  saveCart(cart);
  guardarProductos();
  return { ok: true };
}

export function removeFromCart(id) {
  const cart = getCart();
  const idx = cart.findIndex((x) => String(x.id) === String(id));
  if (idx === -1) return { ok: false };

  const it = cart[idx];
  const p = findProduct(id);
  if (p && p.stock != null) p.stock = Number(p.stock) + it.cantidad;
  cart.splice(idx, 1);

  saveCart(cart);
  guardarProductos();
  toast("Producto eliminado", "success");
  return { ok: true };
}

export function clearCart() {
  const cart = getCart();
  cart.forEach((it) => {
    const p = findProduct(it.id);
    if (p && p.stock != null) p.stock = Number(p.stock) + it.cantidad;
  });
  localStorage.removeItem(KEY);
  guardarProductos();
  syncCartCount();
  updateCartSummary();
}


export function cartTotal() {
  return getCart().reduce((acc, it) => acc + it.precio * it.cantidad, 0);
}

function itemsCount() {
  return getCart().reduce((acc, it) => acc + it.cantidad, 0);
}

function updateCartSummary() {
  const itemsEl = document.getElementById("summary-items");
  const totalSpan = document.getElementById("total"); // lo usás en el HTML del panel
  if (itemsEl) itemsEl.textContent = String(itemsCount());
  if (totalSpan) totalSpan.textContent = cartTotal().toLocaleString("es-AR");
}

function renderCarrito() {
  const body = document.getElementById("carritoBody");
  const vacio = document.getElementById("carritoVacio");
  const tabla = document.getElementById("carritoTabla");
  const totalEl = document.getElementById("total");

  if (!body) return;

  const cart = getCart();
  body.innerHTML = "";

  if (cart.length === 0) {
    if (vacio) vacio.hidden = false;
    if (tabla) tabla.hidden = true;
    if (totalEl) totalEl.textContent = "0";
    syncCartCount();
    updateCartSummary();
    return;
  }

  if (vacio) vacio.hidden = true;
  if (tabla) tabla.hidden = false;

  cart.forEach((item) => {
    const tr = document.createElement("tr");
    const prod = findProduct(item.id);
    const disp = prod && prod.stock != null ? Number(prod.stock) : null;
    const plusDisabledAttr = disp !== null && disp <= 0 ? "disabled" : "";

    tr.dataset.id = item.id;
    tr.dataset.price = item.precio;
    tr.dataset.stock = disp ?? "";

    tr.innerHTML = `
      <td>${item.nombre}</td>
      <td>$${item.precio.toLocaleString("es-AR")}</td>

      <td class="cantidad">
        <div class="qty">
          <button class="btn-menos" data-accion="menos" aria-label="Disminuir">−</button>
          <input class="qty-input" value="${item.cantidad}" readonly aria-label="Cantidad">
          <button class="btn-mas" data-accion="mas" ${plusDisabledAttr} aria-label="Aumentar">+</button>
          ${disp !== null ? `<small class="stock">Disp: ${disp}</small>` : ""}
        </div>
      </td>

      <td>$${(item.precio * item.cantidad).toLocaleString("es-AR")}</td>
      <td><button class="btn-eliminar" data-accion="eliminar" aria-label="Eliminar">🗑️</button></td>
    `;
    body.appendChild(tr);
  });

  if (totalEl) totalEl.textContent = cartTotal().toLocaleString("es-AR");
  syncCartCount();
  updateCartSummary();
}


document.addEventListener("DOMContentLoaded", () => {
  try {
    const carritoBody = document.getElementById("carritoBody");

    if (carritoBody) {
      carritoBody.addEventListener("click", (e) => {
        const btn = e.target.closest("button[data-accion]");
        if (!btn) return;

        const fila = btn.closest("tr[data-id]");
        const id = fila?.dataset.id;
        const acc = btn.dataset.accion;

        try {
          if (acc === "mas") {
            const r = changeQty(id, +1);
            if (!r.ok) {
              if (r.error) toast(r.error, "warning");
              return;
            }
            renderCarrito();
            return;
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
            return;
          }

          if (acc === "eliminar") {
            if (confirm("¿Eliminar este producto del carrito?")) {
              removeFromCart(id);
              renderCarrito();
            }
            return;
          }
        } catch (innerErr) {
          console.error("[carrito-body handler] error:", innerErr);
        }
      });
    }

    const vaciarBtn = document.getElementById("vaciarCarrito");
    if (vaciarBtn) {
      vaciarBtn.addEventListener("click", () => {
        if (!getCart().length) return;
        if (confirm("¿Está seguro de vaciar el carrito?")) {
          clearCart();
          renderCarrito();
          toast("Carrito vaciado", "success");
        }
      });
    }

    const finalizarBtn = document.getElementById("finalizarCompra");
    if (finalizarBtn) {
      finalizarBtn.addEventListener("click", () => {
        if (!getCart().length) {
          toast("Tu carrito está vacío", "warning");
          return;
        }
        toast("Simulación: finalizar compra", "success");
      });
    }

   
    renderCarrito();
    syncCartCount();
    updateCartSummary();
  } catch (e) {
    console.error("[carrito-utils] init error:", e);
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const finalizarBtn = document.getElementById('finalizarCompra');
  if (!finalizarBtn) return;

  finalizarBtn.addEventListener('click', (e) => {
    // Si quieres prevenir ir si el carrito está vacío, comprueba antes
    const itemsCount = Number(document.getElementById('cartCount')?.textContent || 0);
    if (itemsCount === 0) { alert('El carrito está vacío'); return; }

    // Redirigir a la página de confirmación (mismo directorio pages/)
    location.href = 'confirmacioncompra.html';

  });
});
