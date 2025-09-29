// assets/js/index.js
import { productos } from "./data.js";

// Toma n productos aleatorios, preferentemente en stock
function tomarAleatorios(arr, n = 3) { 
  const src = [...arr];
  const enStock = src.filter((p) => p.stock > 0);
  const base = enStock.length >= n ? enStock : src;

  // Aleatorio de productos - Algoritmo de Fisher-Yates
  for (let i = base.length - 1; i > 0; i--) { 
    const j = Math.floor(Math.random() * (i + 1));
    [base[i], base[j]] = [base[j], base[i]];
  }
  return base.slice(0, n);
}

// Crea la tarjeta HTML para un producto destacado
function cardDestacado(p) { 
  const div = document.createElement("div");
  div.className = "producto destacado";
  div.innerHTML = `
    <img src="${p.img}" alt="${p.nombre}" loading="lazy" />
    <h3>${p.nombre}</h3>
    <p class="precio">$ ${p.precio.toLocaleString("es-AR")}</p>
    <a href="pages/detalle.html?id=${p.id}" class="btn-detalle" target="_blank">Ver detalle</a>
  ` ;  
  return div;
}

// Inicializa la sección de productos destacados en la página principal
function initIndex() {
  const cont = document.querySelector("#destacados .cards");
  if (!cont) return;

  // Aseguramos que el contenedor use tu grilla reutilizable
  cont.classList.add("grid");

  const destacados = tomarAleatorios(productos, 3);
  cont.innerHTML = "";
  destacados.forEach((p) => cont.appendChild(cardDestacado(p)));
}

// Inicializa al cargar la página
document.addEventListener("DOMContentLoaded", initIndex); 
