// Menú hamburguesa accesible, sin tocar tus otros JS
document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.querySelector(".menu-toggle");
  const menu = document.getElementById("mainmenu");
  if (!toggle || !menu) return;

  const mq = window.matchMedia("(max-width: 56.25rem)");
  const close = () => {
    toggle.setAttribute("aria-expanded", "false");
    menu.hidden = true;
  };
  const open = () => {
    toggle.setAttribute("aria-expanded", "true");
    menu.hidden = false;
  };

  // Estado inicial según tamaño
  const sync = () => {
    if (mq.matches) {
      if (toggle.getAttribute("aria-expanded") !== "true") menu.hidden = true;
    } else {
      menu.hidden = false;
      toggle.setAttribute("aria-expanded", "false");
    }
  };
  sync();

  toggle.addEventListener("click", () => {
    toggle.getAttribute("aria-expanded") === "true" ? close() : open();
  });

  // Cerrar al elegir un link (mejor UX)
  menu.addEventListener("click", (e) => {
    if (e.target.closest("a") && mq.matches) close();
  });

  // Esc para cerrar
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && mq.matches) close();
  });

  mq.addEventListener("change", sync);
});
