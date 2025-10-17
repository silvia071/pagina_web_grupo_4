// assets/js/validacion-contacto.js
(() => {
  "use strict";

  // ======= FUNCIONES AUXILIARES =======
  const $ = (sel, ctx = document) => ctx.querySelector(sel);

  const setInvalid = (input, msg) => {
    input.classList.remove("is-valid");
    input.classList.add("is-invalid");
    input.setAttribute("aria-invalid", "true");
    const err = $("#" + input.id + "Error");
    if (err) err.textContent = msg || "Campo inválido.";
  };

  const setValid = (input) => {
    input.classList.remove("is-invalid");
    input.classList.add("is-valid");
    input.setAttribute("aria-invalid", "false");
    const err = $("#" + input.id + "Error");
    if (err) err.textContent = "";
  };

  const showSuccess = (msg) => {
    const box = $("#formAlert");
    if (!box) return;
    box.textContent = msg || "¡Formulario enviado con éxito!";
    box.classList.remove("d-none");
    setTimeout(() => box.classList.add("d-none"), 5000);
  };

  const hideSuccess = () => {
    const box = $("#formAlert");
    if (!box) return;
    box.classList.add("d-none");
  };

  // ======= REGLAS DE VALIDACIÓN =======
  const nombreRegex = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ ]{3,50}$/;
  const emailRegex  = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  const validarNombre = (input) => {
    const v = input.value.trim();
    if (v.length < 3) {
      setInvalid(input, "El nombre debe tener al menos 3 caracteres.");
      return false;
    }
    if (!nombreRegex.test(v)) {
      setInvalid(input, "Solo letras y espacios (sin números ni símbolos).");
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
      setInvalid(input, "Ingresá un correo válido (ej: nombre@dominio.com).");
      return false;
    }
    setValid(input);
    return true;
  };

  const validarMensaje = (input) => {
    const v = input.value.trim();
    if (v.length < 10) {
      setInvalid(input, "El mensaje debe tener mínimo 10 caracteres.");
      return false;
    }
    setValid(input);
    return true;
  };

  // ======= FUNCIÓN PRINCIPAL DE LA CONSIGNA =======
  function validarFormulario(event) {
    event.preventDefault(); // Detenemos el envío

    const form = $("#contactForm");
    const name = $("#name", form);
    const email = $("#email", form);
    const message = $("#message", form);

    // Ocultamos alert verde si estaba visible
    hideSuccess();

    const okName = validarNombre(name);
    const okEmail = validarEmail(email);
    const okMessage = validarMensaje(message);

    // Si hay errores -> no mostrar éxito
    if (!okName || !okEmail || !okMessage) {
      form.classList.add("was-validated");
      return;
    }

    // Si todo está correcto -> mostrar éxito
    showSuccess("¡Gracias! Tu mensaje fue enviado correctamente.");

    // Limpiar campos y clases
    form.reset();
    form.classList.remove("was-validated");
    [name, email, message].forEach((el) => {
      el.classList.remove("is-valid", "is-invalid");
      el.setAttribute("aria-invalid", "false");
    });
  }

  // ======= INICIALIZACIÓN =======
  document.addEventListener("DOMContentLoaded", () => {
    const form = $("#contactForm");
    const alertBox = $("#formAlert");

  // Eliminar el alert de éxito para que no aparezca nunca (estaba mostrándose continuamente)
  if (alertBox) alertBox.remove();

    if (!form) return;

    const name = $("#name", form);
    const email = $("#email", form);
    const message = $("#message", form);

    // Validación en tiempo real
    name.addEventListener("input", () => { hideSuccess(); validarNombre(name); });
    email.addEventListener("input", () => { hideSuccess(); validarEmail(email); });
    message.addEventListener("input", () => { hideSuccess(); validarMensaje(message); });

    // Capturar evento submit
    form.addEventListener("submit", validarFormulario);
  });
})();




