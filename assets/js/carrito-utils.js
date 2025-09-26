// assets/js/carrito-utils.js
import { productos } from "./data.js";
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
export function findProduct(id) {
  return productos.find((p) => String(p.id) === String(id));
}
export function addToCart(id, qty = 1) {
  const p = findProduct(id);
  if (!p) return { ok: false, error: "Producto no encontrado" };
  const cart = getCart();
  const existing = cart.find((it) => String(it.id) === String(id));
  const currentQty = existing ? existing.cantidad : 0;
  const newQty = currentQty + qty;
  if (newQty > p.stock) return { ok: false, error: "No hay stock suficiente" };
  if (existing) existing.cantidad = newQty;
  else
    cart.push({ id: p.id, nombre: p.nombre, precio: p.precio, cantidad: qty });
  saveCart(cart);
  return { ok: true };
}
export function cartTotal() {
  return getCart().reduce((acc, it) => acc + it.precio * it.cantidad, 0);
}
document.addEventListener("DOMContentLoaded", syncCartCount);
