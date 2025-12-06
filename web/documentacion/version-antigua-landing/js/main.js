import {initializeFormController} from "./formController.js";

// Exponer la función de cambio de modo como global para que los `onclick` inline la encuentren
window.cambiaModoColor = () => {
    document.documentElement.classList.toggle('dark-mode');
};

// Inicialización segura: si el DOM ya está listo, ejecutar inmediatamente; si no, esperar al evento
function init() {
    initializeFormController();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
