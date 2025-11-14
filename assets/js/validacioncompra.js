document.addEventListener("DOMContentLoaded", function () {
  console.log("validacioncompra.js v2 cargado"); 

  const form = document.getElementById("form-confirmacion");
  if (!form) return;



  const MENSAJE_COMPRA =
    "¡Muchas gracias por tu compra! En un plazo de 48 horas recibirás tu pedido. Pronto nos pondremos en contacto para coordinar la entrega.";

  const errorMessages = {
    name: {
      valueMissing: "Por favor ingresa tu nombre",
      patternMismatch: "El nombre solo debe contener letras y espacios",
      tooShort: "El nombre debe tener al menos 3 caracteres",
      tooLong: "El nombre no debe exceder los 50 caracteres",
    },
    direccion: {
      valueMissing: "Por favor ingresa tu dirección",
      patternMismatch: "La dirección ingresada no es válida",
      tooShort: "La dirección debe tener al menos 3 caracteres",
      tooLong: "La dirección no debe exceder los 150 caracteres",
    },
    email: {
      valueMissing: "Por favor ingresa tu correo electrónico",
      typeMismatch: "Por favor ingresa un correo electrónico válido",
    },
  };



const setInvalid = (input, msg) => {
  input.classList.remove("is-valid");
  input.classList.add("is-invalid");
  input.setAttribute("aria-invalid", "true");
  const err = document.getElementById(input.id + "Error");
  if (err) err.textContent = msg || "Campo inválido.";
};

const setValid = (input) => {
  input.classList.remove("is-invalid");
  input.classList.add("is-valid");
  input.setAttribute("aria-invalid", "false");
  const err = document.getElementById(input.id + "Error");
  if (err) err.textContent = "";
};

const nombreRegex = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ ]{3,50}$/;
const direccionRegex = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9 ,.#-]{3,150}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const validarNombre = (input) => {
  const v = input.value.trim();
  if (v.length < 3) {
    setInvalid(input, "El nombre debe tener al menos 3 caracteres.");
    return false;
  }
  if (!nombreRegex.test(v)) {
    setInvalid(input, "Solo letras y espacios.");
    return false;
  }
  setValid(input);
  return true;
};

const validarDireccion = (input) => {
  const v = input.value.trim();
  if (v.length < 3) {
    setInvalid(input, "La dirección debe tener al menos 3 caracteres.");
    return false;
  }
  if (!direccionRegex.test(v)) {
    setInvalid(input, "Dirección inválida.");
    return false;
  }
  setValid(input);
  return true;
};

const validarEmail = (input) => {
  const v = input.value.trim();
  if (v === "") {
    setInvalid(input, "El correo es obligatorio.");
    return false;
  }
  if (!emailRegex.test(v)) {
    setInvalid(input, "Correo inválido.");
    return false;
  }
  setValid(input);
  return true;
};

const vaciarCarrito = () => {
  localStorage.removeItem("carrito");
  const cartCount = document.getElementById("cartCount");
  if (cartCount) {
    cartCount.textContent = "0";
  }
};

 form.addEventListener("submit", function (event) {
  event.preventDefault();

  const nombre = document.getElementById("nombre");
  const direccion = document.getElementById("direccion");
  const email = document.getElementById("email");

  const okNombre = validarNombre(nombre);
  const okDireccion = validarDireccion(direccion);
  const okEmail = validarEmail(email);

  if (!okNombre || !okDireccion || !okEmail) {
    return;
  }

  alert("¡Muchas gracias por tu compra! En 48 horas recibirás tu pedido.");
  vaciarCarrito();
  form.reset();
  [nombre, direccion, email].forEach((el) => {
    el.classList.remove("is-valid", "is-invalid");
    el.setAttribute("aria-invalid", "false");
  });
});


form.querySelectorAll("input").forEach((input) => {
  input.addEventListener("input", () => {
    if (input.id === "nombre") validarNombre(input);
    if (input.id === "direccion") validarDireccion(input);
    if (input.id === "email") validarEmail(input);
  });
});
}); 
