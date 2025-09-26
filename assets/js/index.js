// assets/js/index.js
import { productos } from "./data.js";

function tomarAleatorios(arr, n = 3) {
  const src = [...arr];
  const enStock = src.filter((p) => p.stock > 0);
  const base = enStock.length >= n ? enStock : src;

  // shuffle
  for (let i = base.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [base[i], base[j]] = [base[j], base[i]];
  }
  return base.slice(0, n);
}

function cardDestacado(p) {
  const div = document.createElement("div");
  // Usamos tus clases de estilo:
  div.className = "producto destacado";
  div.innerHTML = `
    <img src="${p.img}" alt="${p.nombre}" loading="lazy" />
    <h3>${p.nombre}</h3>
    <p class="precio">$ ${p.precio.toLocaleString("es-AR")}</p>
    <a class="btn-detalle" href="./pages/producto.html?id=${p.id}" aria-label="Ver detalles de ${p.nombre}">
      Ver detalles
    </a>
  `;
  return div;
}

function initIndex() {
  const cont = document.querySelector("#destacados .cards");
  if (!cont) return;

  // Aseguramos que el contenedor use tu grilla reutilizable
  cont.classList.add("grid");

  const destacados = tomarAleatorios(productos, 3);
  cont.innerHTML = "";
  destacados.forEach((p) => cont.appendChild(cardDestacado(p)));
}

document.addEventListener("DOMContentLoaded", initIndex);
