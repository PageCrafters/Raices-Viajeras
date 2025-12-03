import {initializeFormController} from "./formController.js";

const cambiaModoColor = () => {
    document.documentElement.classList.toggle('dark-mode');
};

document.addEventListener('DOMContentLoaded', () => {
    // Inicializar el controlador del formulario
    initializeFormController();
})
