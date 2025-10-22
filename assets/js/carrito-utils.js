import { productos, guardarProductos } from "./data.js";

/* -------------------------
   Utilidades de carrito
   ------------------------- */
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
}

export function syncCartCount() {
  const count = getCart().reduce((acc, it) => acc + it.cantidad, 0);
  document
    .querySelectorAll("#cartCount")
    .forEach((el) => (el.textContent = count));
}

// Normaliza el stock a número (o null si no es válido)
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

// Productos
export function findProduct(id) {
  const p = productos.find((x) => String(x.id) === String(id));
  normalizeStock(p);
  return p;
}

/* -------------------------
   Toast mínimo (visual)
   ------------------------- */
function ensureToastHost() {
  let box = document.getElementById("toastBox");
  if (!box) {
    box = document.createElement("div");
    box.id = "toastBox";
    Object.assign(box.style, {
      position: "fixed",
      right: "12px",
      bottom: "12px",
      display: "flex",
      flexDirection: "column",
      gap: "8px",
      zIndex: 9999,
    });
    document.body.appendChild(box);
  }
  return box;
}

export function toast(msg, type = "success") {
  const box = ensureToastHost();
  const n = document.createElement("div");
  n.textContent = msg;
  Object.assign(n.style, {
    padding: "10px 12px",
    borderRadius: "8px",
    background: type === "warning" ? "#fff4e5" : "#d1f7c4",
    border: "1px solid " + (type === "warning" ? "#e0b84d" : "#86d27c"),
    boxShadow: "0 6px 18px rgba(0,0,0,.15)",
    fontSize: "14px",
    color: "#000",
  });
  box.appendChild(n);
  setTimeout(() => n.remove(), 1800);
}

/* -------------------------
   Operaciones de carrito
   ------------------------- */
export function addToCart(id, qty = 1) {
  const p = findProduct(id);
  console.log("[addToCart] start", { id, qty, producto: p });
  if (!p) {
    toast("Producto no encontrado", "warning");
    console.log("[addToCart] producto no encontrado");
    return { ok: false, error: "Producto no encontrado" };
  }

  const stockNum = p.stock == null ? null : Number(p.stock);
  console.log(
    "[addToCart] stockNum:",
    stockNum,
    "tipo original:",
    typeof p.stock
  );

  if (stockNum !== null && Number.isFinite(stockNum) && stockNum <= 0) {
    // mostramos toast (visible) y devolvemos error
    toast("No hay stock disponible", "warning");
    console.log("[addToCart] sin stock (<=0)");
    return { ok: false, error: "No hay stock disponible" };
  }

  if (stockNum !== null && Number.isFinite(stockNum) && stockNum < qty) {
    toast("No hay stock suficiente", "warning");
    console.log("[addToCart] stock insuficiente", stockNum);
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
  toast("Producto agregado correctamente", "success");
  console.log("[addToCart] done, producto after:", p);
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
    if (p && typeof p.stock === "number" && p.stock < delta)
      return { ok: false, error: "No hay stock suficiente" };
    if (p && typeof p.stock === "number") {
      p.stock -= delta;
      if (p.stock < 0) p.stock = 0;
    }
  } else if (delta < 0) {
    if (p && typeof p.stock === "number") p.stock += -delta;
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
  if (p && typeof p.stock === "number") p.stock += it.cantidad;
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
    if (p && typeof p.stock === "number") p.stock += it.cantidad;
  });
  localStorage.removeItem(KEY);
  guardarProductos();
  syncCartCount();
}

/* -------------------------
   Totales y render carrito
   ------------------------- */
export function cartTotal() {
  return getCart().reduce((acc, it) => acc + it.precio * it.cantidad, 0);
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
    return;
  }

  if (vacio) vacio.hidden = true;
  if (tabla) tabla.hidden = false;

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

  if (totalEl) totalEl.textContent = cartTotal().toLocaleString("es-AR");
  syncCartCount();
}

/* -------------------------
   Eventos de la página carrito
   ------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  const carritoBody = document.getElementById("carritoBody");
  if (carritoBody) {
    carritoBody.addEventListener("click", (e) => {
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

  // render inicial
  renderCarrito();
  syncCartCount();
});
