// Código completo y limpio para detalles.js

import { addToCart, findProduct } from "./carrito-utils.js";

function getIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

function showInlineMsg(container, text, type = "warning") {
  if (!container) return;
  let el = container.querySelector("#detalleMsg");
  if (!el) {
    el = document.createElement("div");
    el.id = "detalleMsg";
    el.setAttribute("aria-live", "polite");
    container.appendChild(el);
  }
  el.textContent = text;
  Object.assign(el.style, {
    display: "inline-block",
    padding: "8px 10px",
    marginTop: "8px",
    borderRadius: "6px",
    background: type === "warning" ? "#fff4e5" : "#d1f7c4",
    border: "1px solid " + (type === "warning" ? "#e0b84d" : "#86d27c"),
    color: "#000",
  });
  clearTimeout(el._hideTimer);
  el._hideTimer = setTimeout(() => {
    el.textContent = "";
    el.style.cssText = "";
  }, 3500);
}

function mostrarDetalle() {
  const id = getIdFromUrl();
  const producto = findProduct(id); // obtiene stock normalizado y actual
  const cont = document.getElementById("detalleProducto");
  if (!cont) return;

  if (!producto) {
    cont.innerHTML = "<p>Producto no encontrado.</p>";
    return;
  }

  cont.innerHTML = `
    <button id="btnVolver" class="btn-back" aria-label="Volver">← Volver</button>
    <h2>${producto.nombre}</h2>
    <img src="../${producto.img}" alt="${
    producto.nombre
  }" style="max-width:300px;" />
    <p><strong>Precio:</strong> $${producto.precio.toLocaleString("es-AR")}</p>
    <p><strong>Detalle:</strong> ${producto.detalle}</p>
    <p><strong>Categoría:</strong> ${producto.categoria}</p>
    <p><strong>Stock:</strong> <span class="stockVal">${
      producto.stock ?? "—"
    }</span></p>
    <div class="agregar" style="margin-top:10px;">
      <label for="qty">Cantidad:</label>
      <input id="qty" type="number" min="1" value="1" style="width:64px; margin-left:8px;" />
      <button id="btnAgregar" class="btn-add" style="margin-left:12px;">Agregar al carrito</button>
    </div>
  `;

  // back button
  const btnVolver = document.getElementById("btnVolver");
  if (btnVolver) {
    btnVolver.addEventListener("click", () => {
      if (history.length > 1) {
        history.back();
        return;
      }
      try {
        const ref = document.referrer;
        if (ref) {
          const refOrigin = new URL(ref).origin;
          if (refOrigin === location.origin) {
            window.location.href = ref;
            return;
          }
        }
      } catch (e) {}
      window.location.href = "index.html";
    });
  }

  // handlers para agregar
  const btnAgregar = document.getElementById("btnAgregar");
  const qtyInput = document.getElementById("qty");
  const stockEl = cont.querySelector(".stockVal");

  // desactivar si no hay stock numérico
  if (btnAgregar && typeof producto.stock === "number" && producto.stock <= 0) {
    btnAgregar.disabled = true;
  }

  if (btnAgregar) {
    btnAgregar.addEventListener("click", () => {
      const qty = Math.max(1, parseInt(qtyInput.value, 10) || 1);
      const res = addToCart(producto.id, qty);

      if (!res.ok) {
        // mostrar mensaje en pantalla (inline)
        showInlineMsg(cont, res.error ?? "Error al agregar", "warning");
        return;
      }

      // éxito: re-renderizar para mostrar stock actualizado (findProduct leerá stock nuevo)
      mostrarDetalle();
    });
  }
}

document.addEventListener("DOMContentLoaded", mostrarDetalle);
