import {initializeFormController} from "./formController.js";

// Exponer la función de cambio de modo como global para que los `onclick` inline la encuentren
window.cambiaModoColor = () => {
    document.documentElement.classList.toggle('dark-mode');
};

// Función para mostrar/ocultar contraseña
window.togglePassword = (fieldId, buttonId) => {
    const field = document.getElementById(fieldId);
    const boton = document.getElementById(buttonId);
    const emoji= boton.querySelector('.fa-regular');
    if (field) {
        if (field.type === 'password') {
            emoji.classList.toggle('fa-face-dizzy');
            emoji.classList.toggle('fa-face-flushed');
            field.type = 'text';
        } else {
            emoji.classList.toggle('fa-face-dizzy');
            emoji.classList.toggle('fa-face-flushed');
            field.type = 'password';
        }
    }
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
