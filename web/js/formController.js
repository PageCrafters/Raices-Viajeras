import * as ui from './ui.js';
import * as v from "./validaciones.js";

/**
 * Función para inicializar el controlador del formulario de registro.
 */
export function initializeFormController() {
    const form = document.getElementById('form-registro');
    const nombreInput = document.getElementById('nombre');
    const correoInput = document.getElementById('correo');
    const contrasenaInput = document.getElementById('contrasenia');
    const confirmarContrasenaInput = document.getElementById('confirmar_contrasenia');
    const tipoViajeSelect = document.getElementById('tipo_viaje');
    const privacidadCheckbox = document.getElementById('politica_privacidad');

/*
    // Comprobación de elementos críticos
    if (!form) {
        console.error('initializeFormController: elemento #form-registro no encontrado. Abortando inicialización.');
        return;
    }

    if (!nombreInput || !correoInput || !contrasenaInput || !confirmarContrasenaInput || !tipoViajeSelect || !privacidadCheckbox) {
        console.error('initializeFormController: uno o más campos del formulario no se encontraron. Revise los IDs en el HTML.');
        // Mostrar cuáles faltan para facilitar la depuración
        const missing = [];
        if (!nombreInput) missing.push('nombre');
        if (!correoInput) missing.push('correo');
        if (!contrasenaInput) missing.push('contrasenia');
        if (!confirmarContrasenaInput) missing.push('confirmar_contrasenia');
        if (!tipoViajeSelect) missing.push('tipo_viaje');
        if (!privacidadCheckbox) missing.push('politica_privacidad');
        console.warn('IDs faltantes:', missing.join(', '));
        return;
    }
*/

    // Validación en tiempo real para el campo nombre
    nombreInput.addEventListener('input', () => {
        const df = ui.obtenerDatosFormulario();
        const nombre = df.nombre.trim();
        if (!v.validarNombre(nombre)) {
            ui.mostrarError('error-nombre', 'El nombre debe contener solo letras y un máximo de 2 palabras.');
        } else {
            ui.mostrarError('error-nombre', '');
        }
    });

    // Validación en tiempo real para el campo correo
    correoInput.addEventListener('input', () => {
        const df = ui.obtenerDatosFormulario();

        const correo = df.correo.trim();
        if (!v.validarCorreo(correo)) {
            ui.mostrarError('error-correo', 'El correo electrónico no tiene un formato válido.');
        } else {
            ui.mostrarError('error-correo', '');
        }
    });

    // Validación en tiempo real para el campo contraseña
    contrasenaInput.addEventListener('input', () => {
        const df = ui.obtenerDatosFormulario();

        const contrasena = df.contrasena;
        const confirmarContrasena = df.confirmarContrasena;

        if (!v.validarContrasena(contrasena)) {
            ui.mostrarError('error-contrasena', 'La contraseña debe tener al menos 8 caracteres, incluyendo mayúsculas, minúsculas, números y caracteres especiales.');
        } else {
            ui.mostrarError('error-contrasena', '');
        }
        if (!v.comprobarContrasenas(contrasena, confirmarContrasena)) {
            ui.mostrarError('error-confirmar-contrasena', 'Las contraseñas no coinciden.');
        } else {
            ui.mostrarError('error-confirmar-contrasena', '');
        }
    });

    // Validación en tiempo real para el campo confirmar contraseña
    confirmarContrasenaInput.addEventListener('input', () => {
        const df = ui.obtenerDatosFormulario();

        const contrasena = df.contrasena;
        const confirmarContrasena = df.confirmarContrasena;
        if (!v.comprobarContrasenas(contrasena, confirmarContrasena)) {
            ui.mostrarError('error-confirmar-contrasena', 'Las contraseñas no coinciden.');
        } else {
            ui.mostrarError('error-confirmar-contrasena', '');
        }
    });

    // Validación en tiempo real para el campo tipo de viaje
    tipoViajeSelect.addEventListener('change', () => {
        const df = ui.obtenerDatosFormulario();

        const tipoViaje = df.tipoViaje;
        if (!v.validarTipoViaje(tipoViaje)) {
            ui.mostrarError('error-tipo-viaje', 'Debe seleccionar un tipo de viaje.');
        } else {
            ui.mostrarError('error-tipo-viaje', '');
        }
    });

    // Validación en tiempo real para el checkbox de política de privacidad
    privacidadCheckbox.addEventListener('change', () => {
        const df = ui.obtenerDatosFormulario();

        if (!df.privacidad) {
            ui.mostrarError('error-privacidad', 'Debe aceptar la política de privacidad.');
        } else {
            ui.mostrarError('error-privacidad', '');
        }
    });

    // Manejo del evento submit del formulario
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        ui.ocultarErrores();

        const datos = ui.obtenerDatosFormulario();
        if (v.validarNombre(datos.nombre) && v.validarCorreo(datos.correo) && v.validarContrasena(datos.contrasena) && v.comprobarContrasenas(datos.contrasena, datos.confirmarContrasena) && v.validarTipoViaje(datos.tipoViaje) && datos.privacidad) {
            ui.mostrarMensajeExito('¡Registro exitoso!');
            ui.limpiarFormulario();
        }
    });
}