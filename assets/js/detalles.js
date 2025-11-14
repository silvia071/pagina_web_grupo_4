import {
  addToCart,
  findProduct,
  toast,
  syncCartCount,
} from "./carrito-utils.js";

const DATA_URL = `${location.origin}/assets/data.json`;

function getIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

function rutaImg(img) {
  if (!img) return "";
  if (String(img).startsWith("/")) return img;
  return location.pathname.includes("/pages/")
    ? "../" + String(img).replace(/^\.?\/*/, "")
    : String(img);
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
  el.className =
    type === "warning" ? "inline-msg warning" : "inline-msg success";

  clearTimeout(el._hideTimer);
  el._hideTimer = setTimeout(() => {
    el.classList.add("hide");
    setTimeout(() => el.remove(), 500);
  }, 2500);
}

async function cargarCatalogoLocal() {
  try {
    const cache = localStorage.getItem("productosStock");
    if (cache) {
      const arr = JSON.parse(cache);
      if (Array.isArray(arr) && arr.length) return arr;
    }
  } catch {}
  const res = await fetch(DATA_URL, { cache: "no-store" });
  if (!res.ok) throw new Error(`Error ${res.status} al leer ${DATA_URL}`);
  const data = await res.json();
  try {
    localStorage.setItem("productosStock", JSON.stringify(data));
  } catch {}
  return data;
}

async function obtenerProducto(id) {
  try {
    const p = findProduct?.(id);
    if (p) return p;
  } catch {}
  const catalogo = await cargarCatalogoLocal();
  return catalogo.find((x) => String(x.id) === String(id)) || null;
}

async function mostrarDetalle() {
  const id = getIdFromUrl();
  const cont = document.getElementById("detalleProducto");
  if (!cont) return;

  let producto = null;
  try {
    producto = await obtenerProducto(id);
  } catch {}
  if (!producto) {
    cont.innerHTML = "<p>Producto no encontrado.</p>";
    return;
  }

  const stockNum = producto.stock == null ? null : Number(producto.stock);

  cont.innerHTML = `
    <h2>${producto.nombre}</h2>
    <img src="${rutaImg(producto.img)}" alt="${
    producto.nombre
  }" style="max-width:300px;" />
    <p><strong>Precio:</strong> $${Number(producto.precio).toLocaleString(
      "es-AR"
    )}</p>
    <p><strong>Detalle:</strong> ${producto.detalle}</p>
    <p><strong>Categoría:</strong> ${producto.categoria}</p>
    <p><strong>Stock:</strong> <span class="stockVal">${
      stockNum ?? "—"
    }</span></p>

    <div class="fila-cantidad">
      <span>Cantidad:</span>
      <button type="button" class="qty-btn" data-delta="-1">−</button>
      <input id="qty" type="number" min="1" value="1" />
      <button type="button" class="qty-btn" data-delta="1">+</button>
    </div>

    <div class="acciones">
      <button
        id="btnAgregar"
        class="btn-accion btn-add-detalle"
        type="button"
      >
        ${
          typeof stockNum === "number" && stockNum <= 0
            ? "Sin stock"
            : "Agregar al carrito"
        }
      </button>

      <button
        id="btnVolver"
        type="button"
        class="btn-accion btn-volver"
      >
        Volver
      </button>
    </div>
  `;

  // Botón volver
  document.getElementById("btnVolver")?.addEventListener("click", () => {
    if (history.length > 1) return history.back();
    const ref = document.referrer;
    try {
      if (ref && new URL(ref).origin === location.origin)
        return (location.href = ref);
    } catch {}
    location.href = location.pathname.includes("/pages/")
      ? "productos.html"
      : "pages/productos.html";
  });

  const btnAgregar = document.getElementById("btnAgregar");
  const qtyInput = document.getElementById("qty");

  // Botones + y − de cantidad
  const qtyBtns = cont.querySelectorAll(".qty-btn");
  qtyBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const delta = Number(btn.dataset.delta) || 0;
      let valor = parseInt(qtyInput.value, 10) || 1;
      valor += delta;
      if (valor < 1) valor = 1;

      // limitar por stock visible si es numérico
      const visibleTxt = cont.querySelector(".stockVal")?.textContent ?? "";
      const visible = Number(visibleTxt);
      if (Number.isFinite(visible)) {
        valor = Math.min(valor, Math.max(1, visible));
      }

      qtyInput.value = String(valor);
    });
  });

  if (btnAgregar && typeof stockNum === "number" && stockNum <= 0) {
    btnAgregar.disabled = true;
  }

  if (btnAgregar) {
    btnAgregar.addEventListener("click", () => {
      const qty = Math.max(1, parseInt(qtyInput.value, 10) || 1);

      const visibleTxt = cont.querySelector(".stockVal")?.textContent ?? "";
      const visible = Number(visibleTxt);
      const tieneStockVisible = Number.isFinite(visible);

      const disponible = tieneStockVisible ? visible : qty;
      const tomar = tieneStockVisible ? Math.min(qty, disponible) : qty;

      if (tieneStockVisible && disponible <= 0) {
        btnAgregar.disabled = true;
        btnAgregar.textContent = "Sin stock";
        showInlineMsg(cont, "Producto sin stock", "warning");
        toast?.("Producto sin stock", "warning");
        return;
      }

      const res = addToCart(producto.id, tomar);
      if (!res.ok) {
        showInlineMsg(cont, res.error ?? "Error al agregar", "warning");
        toast?.(res.error ?? "Error al agregar", "warning");
        return;
      }

      showInlineMsg(cont, `Agregado al carrito (×${tomar}) ✓`, "success");
      toast?.(`Agregado al carrito (×${tomar}) ✓`, "success");
      syncCartCount?.();

      if (tieneStockVisible) {
        const nuevo = Math.max(0, disponible - tomar);
        const stockEl = cont.querySelector(".stockVal");
        if (stockEl) stockEl.textContent = String(nuevo);

        if (nuevo <= 0) {
          btnAgregar.disabled = true;
          btnAgregar.textContent = "Sin stock";
          showInlineMsg(cont, "Producto sin stock", "warning");
          toast?.("Producto sin stock", "warning");
        }
      }

      qtyInput.value = "1";
    });
  }
}

document.addEventListener("DOMContentLoaded", mostrarDetalle);
