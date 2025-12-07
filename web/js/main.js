import {initializeFormController} from "./formController.js";

// Exponer la función de cambio de modo como global para que los `onclick` inline la encuentren
window.cambiaModoColor = () => {
    document.documentElement.classList.toggle('dark-mode');
};

// Función para mostrar/ocultar contraseña
window.togglePassword = (fieldId) => {
    const field = document.getElementById(fieldId);
    if (field) {
        if (field.type === 'password') {
            field.type = 'text';
        } else {
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
