// Utilidades de carrito
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
}
export function syncCartCount() {
  const count = getCart().reduce((acc, it) => acc + it.cantidad, 0);
  document
    .querySelectorAll("#cartCount")
    .forEach((el) => (el.textContent = count));
}

// Productos
export function findProduct(id) {
  return productos.find((p) => String(p.id) === String(id));
}

// Toast mínimo
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
    background: type === "warning" ? "#ffe9b3" : "#d1f7c4",
    border: "1px solid " + (type === "warning" ? "#e0b84d" : "#86d27c"),
    boxShadow: "0 6px 18px rgba(0,0,0,.15)",
    fontSize: "14px",
  });
  box.appendChild(n);
  setTimeout(() => n.remove(), 1600);
}

// Agregar al carrito (desde Productos)
export function addToCart(id, qty = 1) {
  const p = findProduct(id);
  if (!p) return { ok: false, error: "Producto no encontrado" };
  if (typeof p.stock === "number" && p.stock < qty)
    return { ok: false, error: "No hay stock suficiente" };

  const cart = getCart();
  const existing = cart.find((it) => String(it.id) === String(id));
  if (existing) existing.cantidad += qty;
  else
    cart.push({ id: p.id, nombre: p.nombre, precio: p.precio, cantidad: qty });

  if (typeof p.stock === "number") p.stock -= qty; // descuenta stock
  guardarProductos();
  saveCart(cart);
  toast("Producto agregado correctamente", "success");
  return { ok: true };
}

// Cambiar cantidad ±1
export function changeQty(id, delta) {
  const cart = getCart();
  const it = cart.find((x) => String(x.id) === String(id));
  if (!it) return { ok: false, error: "Item no encontrado" };

  const p = findProduct(id);
  const nueva = it.cantidad + delta;

  // si queda en 0, que la página pregunte confirmar eliminación
  if (nueva < 1) return { ok: false, toRemove: true };

  if (delta > 0) {
    if (p && typeof p.stock === "number" && p.stock < delta)
      return { ok: false, error: "No hay stock suficiente" };
    if (p && typeof p.stock === "number") p.stock -= delta;
  } else if (delta < 0) {
    if (p && typeof p.stock === "number") p.stock += -delta;
  }

  it.cantidad = nueva;
  saveCart(cart);
  guardarProductos();
  return { ok: true };
}

// Eliminar ítem
export function removeFromCart(id) {
  const cart = getCart();
  const idx = cart.findIndex((x) => String(x.id) === String(id));
  if (idx === -1) return { ok: false };

  const it = cart[idx];
  const p = findProduct(id);
  if (p && typeof p.stock === "number") p.stock += it.cantidad; // se devuelve stock
  cart.splice(idx, 1);

  saveCart(cart);
  guardarProductos();
  toast("Producto eliminado", "success");
  return { ok: true };
}

// Vaciar carrito completo
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

// Total $
export function cartTotal() {
  return getCart().reduce((acc, it) => acc + it.precio * it.cantidad, 0);
}

document.addEventListener("DOMContentLoaded", syncCartCount);
