
const productosOriginales = [
  {
    id: "101",
    nombre: "Bowl de acero inoxidable",
    descripcion: "Bowl de acero inoxidable 24 cm, plateado.",
    detalle: "Bowl de acero inoxidable 24 cm, plateado. Ideal para mezclar ingredientes en la cocina o para servir ensaladas y otros alimentos. Resistente y duradero, fácil de limpiar y apto para uso diario.",
    categoria: "cocina",
    precio: 10000,
    stock: 8,
    img: "assets/img/Bowl.jpg",
  },
  {
    id: "102",
    nombre: "Canasto ratán mediano",
    descripcion: "Práctico, decorativo y súper funcional.",
    detalle: "Canasto de ratán mediano, ideal para organizar y decorar cualquier espacio de tu hogar. Perfecto para almacenar ropa, juguetes, revistas u otros objetos, manteniendo todo en orden con estilo. Su diseño natural y elegante se adapta a cualquier ambiente.",
    categoria: "organizadores",
    precio: 20000,
    stock: 12,
    img: "assets/img/Canasto-ratan.jpg",
  },
  {
    id: "103",
    nombre: "Jabonera",
    descripcion: "Jabonera lisa - Varios colores.",
    detalle: "Jabonera lisa disponible en varios colores, perfecta para mantener tu jabón seco y al alcance de la mano en el baño o la cocina. Su diseño sencillo y funcional se adapta a cualquier estilo de decoración, añadiendo un toque de color y practicidad a tu espacio.",
    categoria: "baño",
    precio: 5000,
    stock: 12,
    img: "assets/img/Jabonera.jpg",
  },
  {
    id: "104",
    nombre: "Banqueta reforzada",
    descripcion: "Banqueta plástica reforzada apilable.",
    detalle: "Banqueta plástica reforzada apilable, ideal para uso en interiores y exteriores. Su diseño resistente soporta hasta 150 kg, proporcionando una solución práctica y cómoda para sentarse o alcanzar objetos en lugares altos. Fácil de limpiar y almacenar gracias a su capacidad de apilamiento.",
    categoria: "jardín",
    precio: 32000,
    stock: 12,
    img: "assets/img/Banqueta-reforzada.png",
  },
  {
    id: "105",
    nombre: "Cuchillos de cocina 6 pzs",
    descripcion: "Set de cuchillos con soporte.",
    detalle: "Set de cuchillos de cocina que incluye 6 piezas esenciales para diversas tareas culinarias, junto con un soporte para mantenerlos organizados y accesibles. Cada cuchillo está diseñado con hojas afiladas y mangos ergonómicos para un manejo cómodo y seguro. Ideal para cortar, picar y filetear con precisión en la cocina.",
    categoria: "cocina",
    precio: 28000,
    stock: 6,
    img: "assets/img/set-cuchillos.jpg",
  },
  {
    id: "106",
    nombre: "Organizador plástico con tapa",
    descripcion: "Caja organizadora apilable, 20 L.",
    detalle: "Caja organizadora plástica con tapa, capacidad de 20 litros, ideal para mantener tus pertenencias ordenadas y protegidas. Su diseño apilable permite ahorrar espacio, siendo perfecta para almacenar ropa, juguetes, herramientas u otros objetos en el hogar o la oficina. Fabricada con materiales duraderos y fácil de limpiar.",
    categoria: "organizadores",
    precio: 18000,
    stock: 10,
    img: "assets/img/contenedor-20lt.jpg",
  },
  {
    id: "107",
    nombre: "Dispenser de jabón",
    descripcion: "Dispenser recargable de 300 ml.",
    detalle: "Dispenser de jabón recargable con capacidad de 300 ml, ideal para mantener el jabón líquido siempre a mano en el baño o la cocina. Su diseño moderno y funcional permite una fácil dispensación del jabón, ayudando a mantener la higiene y el orden en tu espacio. Fabricado con materiales duraderos y fácil de rellenar.",
    categoria: "baño",
    precio: 7500,
    stock: 15,
    img: "assets/img/Dispenser-jabon.jpg",
  },
  {
    id: "108",
    nombre: "Maceta de cemento mediana",
    descripcion: "Ø 28 cm, apta exterior.",
    detalle: "Maceta de cemento mediana con un diámetro de 28 cm, apta para uso en exteriores. Su diseño robusto y moderno es ideal para plantar flores, suculentas u otras plantas, añadiendo un toque de estilo a tu jardín, balcón o terraza. Resistente a las inclemencias del tiempo, esta maceta es perfecta para cualquier espacio al aire libre.",  
    categoria: "jardín",
    precio: 22000,
    stock: 9,
    img: "assets/img/maceta-cemento.png",
  },
];

// Cargar productos desde localStorage o usar los originales
function cargarProductos() {
  const guardados = localStorage.getItem("productosStock");
  if (guardados) return JSON.parse(guardados);
  // Si no hay guardados, usa los originales
  return productosOriginales;
}

export const productos = cargarProductos();

// Guardar productos en localStorage
export function guardarProductos() {
  localStorage.setItem("productosStock", JSON.stringify(productos));
}

