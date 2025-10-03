import { productos } from "./data.js";

function getIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

function mostrarDetalle() {
  const id = getIdFromUrl();
  const producto = productos.find(p => String(p.id) === String(id));
  const cont = document.getElementById("detalleProducto");
  if (!producto) {
    cont.innerHTML = "<p>Producto no encontrado.</p>";
    return;
  }
  cont.innerHTML = `
    <h2>${producto.nombre}</h2>
    <img src="../${producto.img}" alt="${producto.nombre}" style="max-width:300px;" />
    <p><strong>Precio:</strong> $${producto.precio.toLocaleString("es-AR")}</p>
    <p><strong>Detalle:</strong> ${producto.detalle}</p> <!-- Aquí la larga -->
    <p><strong>Categoría:</strong> ${producto.categoria}</p>
    <p><strong>Stock:</strong> ${producto.stock}</p>
  `;
}

document.addEventListener("DOMContentLoaded", mostrarDetalle);