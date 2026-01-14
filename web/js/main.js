import {initializeFormController} from "./formController.js";
import {esModoOscuro} from "./ui.js";

// El tema ya se aplicó en el script inline en head
// Agregar la clase para habilitar transiciones después de la carga inicial
document.body.classList.add('theme-loaded');


// Exponer la función de cambio de modo como global para que los `onclick` inline la encuentren
window.cambiaModoColor = () => {
    const isDark = document.documentElement.classList.toggle('dark-mode');
    // Guarda el estado en localStorage
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
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
