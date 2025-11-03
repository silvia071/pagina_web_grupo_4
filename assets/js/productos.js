import { productos } from "./data.js";
import { addToCart, syncCartCount, toast } from "./carrito-utils.js";

function rutaImg(img) {
  if (!img) return "";
  if (String(img).startsWith("/")) return img;
  return location.pathname.includes("/pages/")
    ? "../" + String(img).replace(/^\.?\/*/, "")
    : String(img);
}

function cardProducto(p) {
  const stockNum = p.stock == null ? null : Number(p.stock);
  const div = document.createElement("div");
  div.className = "producto";
  div.innerHTML = `
    <h3>${p.nombre}</h3>
    <img src="${rutaImg(p.img)}" alt="${p.nombre}" loading="lazy" />
    <p><strong>Precio: $${p.precio.toLocaleString("es-AR")}</strong></p>
    <p>${p.descripcion}</p>
    <p>Categoría: ${p.categoria} • Stock: ${stockNum ?? "—"}</p>
    <button class="btn-add" data-id="${p.id}" data-stock="${stockNum ?? ""}">
      ${stockNum === 0 ? "Sin stock" : "Agregar al carrito"}
    </button>
    <a href="detalle.html?id=${
      p.id
    }" class="btn-detalle" target="_blank"> Ver detalle</a>
  `;
  return div;
}

function llenarFiltroCategorias() {
  const filtro = document.getElementById("filtroCategoria");
  if (!filtro) return;
  const categorias = Array.from(new Set(productos.map((p) => p.categoria)));
  filtro.innerHTML =
    `<option value="todas">Todas</option>` +
    categorias.map((cat) => `<option value="${cat}">${cat}</option>`).join("");
}

function actualizarContador(cantidad) {
  const el = document.getElementById("contador");
  if (!el) return;
  el.textContent = `Mostrando ${cantidad} producto${cantidad === 1 ? "" : "s"}`;
}

function renderProductos(filtrarCategoria = "todas") {
  const cont = document.getElementById("gridProductos");
  if (!cont) return;
  cont.innerHTML = "";
  let lista = productos;
  if (filtrarCategoria !== "todas") {
    lista = productos.filter((p) => p.categoria === filtrarCategoria);
  }
  lista.forEach((p) => cont.appendChild(cardProducto(p)));
  actualizarContador(lista.length);
}

function manejarAgregarCarrito() {
  const cont = document.getElementById("gridProductos");
  if (!cont) return;
  cont.addEventListener("click", (e) => {
    const btn = e.target.closest(".btn-add");
    if (!btn) return;

    const stockAttr = btn.dataset.stock;
    const stockNum = stockAttr === "" ? null : Number(stockAttr);
    console.log(
      "[productos] click btn, id:",
      btn.dataset.id,
      "stockAttr:",
      stockAttr,
      "stockNum:",
      stockNum
    );

    const res = addToCart(btn.dataset.id, 1);
    console.log("[productos] addToCart resultado:", res);
    if (!res.ok) {
      toast(res.error || "Error al agregar", "warning");
      return;
    }
    toast("Producto agregado correctamente", "success");

    btn.textContent = "Agregado ✓";
    setTimeout(() => (btn.textContent = "Agregar al carrito"), 900);
    syncCartCount();
    const filtro = document.getElementById("filtroCategoria");
    renderProductos(filtro ? filtro.value : "todas");
  });
}

function manejarFiltro() {
  const filtro = document.getElementById("filtroCategoria");
  if (!filtro) return;
  filtro.addEventListener("change", () => {
    localStorage.setItem("filtroCategoriaSel", filtro.value);
    renderProductos(filtro.value);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  llenarFiltroCategorias();
  const filtro = document.getElementById("filtroCategoria");
  const guardada = localStorage.getItem("filtroCategoriaSel") || "todas";
  if (filtro) filtro.value = guardada;
  renderProductos(guardada);
  manejarAgregarCarrito();
  manejarFiltro();
  syncCartCount();
});

// fromRow y toRow con producto real del catálogo

class Producto {
  constructor(id, nombre, precio, stock) {
    this.id = id;
    this.nombre = nombre;
    this.precio = Number(precio);
    // preserva null/undefined; si viene valor, lo numera
    this.stock = stock == null ? null : Number(stock);
  }

  static fromRow(row) {
    return new Producto(row.id, row.nombre, row.precio, row.stock);
  }

  
  toRow() {
    return {
      id: this.id,
      nombre: this.nombre,
      precio: this.precio,
      stock: this.stock
    };
  }
}

// Simulamos la fila que vendría de la BD 
const row = {
  id: "101",
  nombre: "Bowl de acero inoxidable",
  descripcion: "Bowl de acero inoxidable 24 cm, plateado.",
  detalle:
    "Bowl de acero inoxidable 24 cm, plateado. Ideal para mezclar ingredientes en la cocina o para servir ensaladas y otros alimentos. Resistente y duradero, fácil de limpiar y apto para uso diario.",
  categoria: "cocina",
  precio: 10000,
  stock: 8,
  img: "assets/img/Bowl.jpg"
};

// Creamos el objeto Producto desde la fila
const producto = Producto.fromRow(row);


const originalSnap = producto.toRow(); 
console.log("Producto ", originalSnap);

// Modificamos el stock (solo si hay stock numérico)
if (producto.stock != null && producto.stock > 0) {
  producto.stock -= 1;
}


const actualizadoSnap = producto.toRow();
console.log(actualizadoSnap);




