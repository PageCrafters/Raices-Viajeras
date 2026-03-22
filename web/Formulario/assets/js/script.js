import {
    validarCampoObligatorio,
    validarNombre,
    validarCorreo,
    validarContrasena,
    comprobarContrasenas,
    validarGenero,
    validarFechaNacimiento,
    validarCheckboxObligatorio,
    validarCheckboxOpcional
} from '../../../js/validaciones.js';

const registerButton = document.getElementById('btn_registrarse');
const loginButton = document.getElementById('btn_iniciar-sesion');
const loginRegisterContainer = document.querySelector('.contenedor_login-register');
const loginForm = document.querySelector('.formulario_login');
const registerForm = document.querySelector('.formulario_register');
const loginBackBox = document.querySelector('.caja_trasera-login');
const registerBackBox = document.querySelector('.caja_trasera-registro');

const loginEmailInput = document.getElementById('correo_login');
const loginPasswordInput = document.getElementById('pwd_login');
const rememberMeInput = document.getElementById('remember_me');

const registerNameInput = document.getElementById('nombre_completo');
const registerEmailInput = document.getElementById('correo');
const registerPasswordInput = document.getElementById('pwd');
const registerConfirmInput = document.getElementById('pwdConfirm');
const registerGenderInputs = Array.from(document.querySelectorAll('input[name="genero"]'));
const registerGenderGroup = document.querySelector('.radio-group');
const registerBirthDateInput = document.getElementById('fechaNacimiento');
const registerBirthDateBlock = document.querySelector('.auth-date-block');
const privacyInput = document.getElementById('politica_privacidad');
const privacyGroup = privacyInput?.closest('.form-check') || null;
const magazineInput = document.getElementById('revista');

/**
 * Ajusta el panel del acceso al ancho actual.
 *
 * En movil deja una sola cara visible para que el slider no se monte.
 *
 * @returns {void}
 */
function syncResponsiveLayout() {
    if (window.innerWidth > 850) {
        if (loginBackBox) {
            loginBackBox.style.display = 'block';
        }

        if (registerBackBox) {
            registerBackBox.style.display = 'block';
        }

        return;
    }

    if (registerBackBox) {
        registerBackBox.style.display = 'block';
        registerBackBox.style.opacity = '1';
    }

    if (loginBackBox) {
        loginBackBox.style.display = 'none';
    }

    if (loginForm) {
        loginForm.style.display = 'block';
        loginForm.style.opacity = '1';
        loginForm.style.zIndex = '2';
    }

    if (registerForm) {
        registerForm.style.display = 'none';
        registerForm.style.opacity = '0';
        registerForm.style.zIndex = '1';
    }

    if (loginRegisterContainer) {
        loginRegisterContainer.style.left = '0px';
    }
}

/**
 * Muestra el formulario de login y deja el registro oculto del todo.
 *
 * @returns {void}
 */
function showLogin() {
    document.body.dataset.authMode = 'login';

    if (window.innerWidth > 850) {
        if (registerForm) {
            registerForm.style.display = 'none';
            registerForm.style.opacity = '0';
            registerForm.style.zIndex = '1';
        }

        if (loginRegisterContainer) {
            loginRegisterContainer.style.left = '10px';
        }

        if (loginForm) {
            loginForm.style.display = 'block';
            loginForm.style.opacity = '1';
            loginForm.style.zIndex = '2';
        }

        if (registerBackBox) {
            registerBackBox.style.opacity = '1';
        }

        if (loginBackBox) {
            loginBackBox.style.opacity = '0';
        }

        return;
    }

    if (registerForm) {
        registerForm.style.display = 'none';
        registerForm.style.opacity = '0';
        registerForm.style.zIndex = '1';
    }

    if (loginRegisterContainer) {
        loginRegisterContainer.style.left = '0px';
    }

    if (loginForm) {
        loginForm.style.display = 'block';
        loginForm.style.opacity = '1';
        loginForm.style.zIndex = '2';
    }

    if (registerBackBox) {
        registerBackBox.style.display = 'block';
        registerBackBox.style.opacity = '1';
    }

    if (loginBackBox) {
        loginBackBox.style.display = 'none';
    }
}

/**
 * Muestra el formulario de registro moviendo el panel blanco a la derecha.
 *
 * @returns {void}
 */
function showRegister() {
    document.body.dataset.authMode = 'registro';

    if (window.innerWidth > 850) {
        if (registerForm) {
            registerForm.style.display = 'block';
            registerForm.style.opacity = '1';
            registerForm.style.zIndex = '2';
        }

        if (loginRegisterContainer) {
            loginRegisterContainer.style.left = '420px';
        }

        if (loginForm) {
            loginForm.style.display = 'none';
            loginForm.style.opacity = '0';
            loginForm.style.zIndex = '1';
        }

        if (registerBackBox) {
            registerBackBox.style.opacity = '0';
        }

        if (loginBackBox) {
            loginBackBox.style.opacity = '1';
        }

        return;
    }

    if (registerForm) {
        registerForm.style.display = 'block';
        registerForm.style.opacity = '1';
        registerForm.style.zIndex = '2';
    }

    if (loginRegisterContainer) {
        loginRegisterContainer.style.left = '0px';
    }

    if (loginForm) {
        loginForm.style.display = 'none';
        loginForm.style.opacity = '0';
        loginForm.style.zIndex = '1';
    }

    if (registerBackBox) {
        registerBackBox.style.display = 'none';
    }

    if (loginBackBox) {
        loginBackBox.style.display = 'block';
        loginBackBox.style.opacity = '1';
    }
}

/**
 * Lee el modo inicial desde la URL.
 *
 * @returns {'login'|'registro'} Modo con el que debe arrancar la pagina.
 */
function getInitialMode() {
    const params = new URLSearchParams(window.location.search);
    const mode = (params.get('modo') || 'login').toLowerCase();

    return mode === 'registro' ? 'registro' : 'login';
}

/**
 * Actualiza la URL sin recargar al cambiar de lado.
 *
 * @param {'login'|'registro'} mode Modo que se quiere reflejar en la query.
 * @returns {void}
 */
function syncUrl(mode) {
    const url = new URL(window.location.href);
    url.searchParams.set('modo', mode);
    window.history.replaceState({}, '', url);
}

/**
 * Enseña u oculta el mensaje de error de un campo concreto.
 *
 * @param {string} errorId Id del nodo donde se pinta el error.
 * @param {string} message Texto que se quiere mostrar.
 * @returns {void}
 */
function setErrorMessage(errorId, message) {
    const errorElement = document.getElementById(errorId);
    if (!errorElement) {
        return;
    }

    errorElement.textContent = message;
    errorElement.classList.toggle('is-visible', message !== '');
}

/**
 * Marca un input normal como valido o invalido sin depender del navegador.
 *
 * @param {HTMLInputElement|null} input Campo que se quiere marcar.
 * @param {boolean} isInvalid Estado final del campo.
 * @returns {void}
 */
function setInputInvalidState(input, isInvalid) {
    if (!(input instanceof HTMLInputElement)) {
        return;
    }

    input.classList.toggle('is-invalid', isInvalid);
    input.setAttribute('aria-invalid', isInvalid ? 'true' : 'false');
}

/**
 * Marca un grupo visual como invalido, por ejemplo genero o privacidad.
 *
 * @param {HTMLElement|null} group Bloque visual del grupo.
 * @param {boolean} isInvalid Estado final del grupo.
 * @returns {void}
 */
function setGroupInvalidState(group, isInvalid) {
    if (!(group instanceof HTMLElement)) {
        return;
    }

    group.classList.toggle('auth-group-invalid', isInvalid);
}

/**
 * Intenta enfocar el primer control que ha fallado.
 *
 * @param {HTMLElement|null} element Elemento al que se quiere mover el foco.
 * @returns {void}
 */
function focusElement(element) {
    if (element && typeof element.focus === 'function') {
        element.focus();
    }
}

/**
 * Valida el correo del login.
 *
 * @returns {boolean} `true` si el campo esta correcto.
 */
function validateLoginEmail() {
    const value = loginEmailInput?.value.trim() || '';
    let message = '';

    if (!validarCampoObligatorio(value)) {
        message = 'Escribe tu correo electrónico.';
    } else if (!validarCorreo(value)) {
        message = 'El correo electrónico no es válido.';
    }

    setErrorMessage('error-correo_login', message);
    setInputInvalidState(loginEmailInput, message !== '');
    return message === '';
}

/**
 * Valida la contrasena del login.
 *
 * En acceso solo compruebo que exista, sin imponer la regla del alta.
 *
 * @returns {boolean} `true` si el campo esta correcto.
 */
function validateLoginPassword() {
    const value = loginPasswordInput?.value || '';
    let message = '';

    if (!validarCampoObligatorio(value)) {
        message = 'Escribe tu contraseña.';
    }

    setErrorMessage('error-pwd_login', message);
    setInputInvalidState(loginPasswordInput, message !== '');
    return message === '';
}

/**
 * Normaliza el checkbox de recordar sesion.
 *
 * @returns {boolean} `true` si el valor del control es utilizable.
 */
function validateRememberMe() {
    return validarCheckboxOpcional(rememberMeInput?.checked ?? false);
}

/**
 * Valida el nombre del registro.
 *
 * @returns {boolean} `true` si el campo esta correcto.
 */
function validateRegisterName() {
    const value = registerNameInput?.value.trim() || '';
    let message = '';

    if (!validarCampoObligatorio(value)) {
        message = 'Escribe tu nombre completo.';
    } else if (!validarNombre(value)) {
        message = 'El nombre no tiene un formato valido.';
    }

    setErrorMessage('error-nombre_completo', message);
    setInputInvalidState(registerNameInput, message !== '');
    return message === '';
}

/**
 * Valida el correo del registro.
 *
 * @returns {boolean} `true` si el campo esta correcto.
 */
function validateRegisterEmail() {
    const value = registerEmailInput?.value.trim() || '';
    let message = '';

    if (!validarCampoObligatorio(value)) {
        message = 'Escribe tu correo electrónico.';
    } else if (!validarCorreo(value)) {
        message = 'El correo electrónico no es válido.';
    }

    setErrorMessage('error-correo', message);
    setInputInvalidState(registerEmailInput, message !== '');
    return message === '';
}

/**
 * Valida la contrasena del registro con la misma regla del backend.
 *
 * @returns {boolean} `true` si el campo esta correcto.
 */
function validateRegisterPassword() {
    const value = registerPasswordInput?.value || '';
    let message = '';

    if (!validarCampoObligatorio(value)) {
        message = 'Escribe una contraseña.';
    } else if (!validarContrasena(value)) {
        message = 'La contraseña debe tener 8 caracteres, mayúscula, minúscula, número y símbolo.';
    }

    setErrorMessage('error-pwd', message);
    setInputInvalidState(registerPasswordInput, message !== '');
    return message === '';
}

/**
 * Valida la confirmacion de contrasena del registro.
 *
 * @returns {boolean} `true` si el campo esta correcto.
 */
function validateRegisterPasswordConfirm() {
    const passwordValue = registerPasswordInput?.value || '';
    const confirmValue = registerConfirmInput?.value || '';
    let message = '';

    if (!validarCampoObligatorio(confirmValue)) {
        message = 'Confirma tu contraseña.';
    } else if (!comprobarContrasenas(passwordValue, confirmValue)) {
        message = 'Las contraseñas no coinciden.';
    }

    setErrorMessage('error-passwordConfirm', message);
    setInputInvalidState(registerConfirmInput, message !== '');
    return message === '';
}

/**
 * Valida el grupo de genero del registro.
 *
 * @returns {boolean} `true` si hay una opcion valida marcada.
 */
function validateRegisterGender() {
    const selectedValue = registerGenderInputs.find((input) => input.checked)?.value || '';
    const isValid = validarGenero(selectedValue);

    setErrorMessage('error-genero', isValid ? '' : 'Selecciona un género.');
    setGroupInvalidState(registerGenderGroup, !isValid);
    registerGenderInputs.forEach((input) => {
        input.setAttribute('aria-invalid', isValid ? 'false' : 'true');
    });

    return isValid;
}

/**
 * Valida la fecha de nacimiento del registro.
 *
 * @returns {boolean} `true` si la fecha es correcta.
 */
function validateRegisterBirthDate() {
    const value = registerBirthDateInput?.value || '';
    let message = '';

    if (!validarCampoObligatorio(value)) {
        message = 'Escribe tu fecha de nacimiento.';
    } else if (!validarFechaNacimiento(value)) {
        message = 'La fecha de nacimiento no es válida.';
    }

    setErrorMessage('error-fechaNacimiento', message);
    setInputInvalidState(registerBirthDateInput, message !== '');
    setGroupInvalidState(registerBirthDateBlock, message !== '');
    return message === '';
}

/**
 * Valida el check obligatorio de privacidad.
 *
 * @returns {boolean} `true` si esta aceptado.
 */
function validateRegisterPrivacy() {
    const isValid = validarCheckboxObligatorio(privacyInput?.checked ?? false);

    setErrorMessage('error-politica_privacidad', isValid ? '' : 'Debes aceptar la política de privacidad.');
    setInputInvalidState(privacyInput, !isValid);
    setGroupInvalidState(privacyGroup, !isValid);
    return isValid;
}

/**
 * Normaliza el checkbox opcional de revista.
 *
 * @returns {boolean} `true` si el valor del control es utilizable.
 */
function validateRegisterMagazine() {
    return validarCheckboxOpcional(magazineInput?.checked ?? false);
}

/**
 * Ejecuta todas las validaciones del login y decide si se puede enviar.
 *
 * @param {boolean} focusFirstInvalid Si vale `true`, mueve el foco al primer error.
 * @returns {boolean} `true` cuando el formulario ya puede enviarse.
 */
function validateLoginForm(focusFirstInvalid = false) {
    const results = [
        { valid: validateLoginEmail(), target: loginEmailInput },
        { valid: validateLoginPassword(), target: loginPasswordInput }
    ];

    validateRememberMe();

    if (focusFirstInvalid) {
        const firstInvalid = results.find((item) => !item.valid);
        if (firstInvalid) {
            focusElement(firstInvalid.target);
        }
    }

    return results.every((item) => item.valid);
}

/**
 * Ejecuta todas las validaciones del registro y decide si se puede enviar.
 *
 * @param {boolean} focusFirstInvalid Si vale `true`, mueve el foco al primer error.
 * @returns {boolean} `true` cuando el formulario ya puede enviarse.
 */
function validateRegisterForm(focusFirstInvalid = false) {
    const results = [
        { valid: validateRegisterName(), target: registerNameInput },
        { valid: validateRegisterEmail(), target: registerEmailInput },
        { valid: validateRegisterPassword(), target: registerPasswordInput },
        { valid: validateRegisterPasswordConfirm(), target: registerConfirmInput },
        { valid: validateRegisterGender(), target: registerGenderInputs[0] || null },
        { valid: validateRegisterBirthDate(), target: registerBirthDateInput },
        { valid: validateRegisterPrivacy(), target: privacyInput }
    ];

    validateRegisterMagazine();

    if (focusFirstInvalid) {
        const firstInvalid = results.find((item) => !item.valid);
        if (firstInvalid) {
            focusElement(firstInvalid.target);
        }
    }

    return results.every((item) => item.valid);
}

/**
 * Enlaza los botones con el comportamiento visual del slider.
 *
 * @returns {void}
 */
function bindModeButtons() {
    if (registerButton) {
        registerButton.addEventListener('click', () => {
            showRegister();
            syncUrl('registro');
        });
    }

    if (loginButton) {
        loginButton.addEventListener('click', () => {
            showLogin();
            syncUrl('login');
        });
    }
}

/**
 * Conecta cada campo con su validacion en caliente.
 *
 * @returns {void}
 */
function bindValidationEvents() {
    loginEmailInput?.addEventListener('input', validateLoginEmail);
    loginPasswordInput?.addEventListener('input', validateLoginPassword);
    rememberMeInput?.addEventListener('change', validateRememberMe);

    registerNameInput?.addEventListener('input', validateRegisterName);
    registerEmailInput?.addEventListener('input', validateRegisterEmail);
    registerPasswordInput?.addEventListener('input', () => {
        validateRegisterPassword();
        validateRegisterPasswordConfirm();
    });
    registerConfirmInput?.addEventListener('input', validateRegisterPasswordConfirm);
    registerGenderInputs.forEach((input) => {
        input.addEventListener('change', validateRegisterGender);
    });
    registerBirthDateInput?.addEventListener('input', validateRegisterBirthDate);
    registerBirthDateInput?.addEventListener('change', validateRegisterBirthDate);
    privacyInput?.addEventListener('change', validateRegisterPrivacy);
    magazineInput?.addEventListener('change', validateRegisterMagazine);
}

/**
 * Engancha la validacion al envio real de los formularios.
 *
 * @returns {void}
 */
function bindSubmitValidation() {
    loginForm?.addEventListener('submit', (event) => {
        if (!validateLoginForm(true)) {
            event.preventDefault();
        }
    });

    registerForm?.addEventListener('submit', (event) => {
        if (!validateRegisterForm(true)) {
            event.preventDefault();
        }
    });
}

/**
 * Reaplica el modo correcto al entrar o al redimensionar la ventana.
 *
 * @returns {void}
 */
function applyInitialMode() {
    syncResponsiveLayout();

    if (getInitialMode() === 'registro') {
        showRegister();
        return;
    }

    showLogin();
}

bindModeButtons();
bindValidationEvents();
bindSubmitValidation();
window.addEventListener('resize', applyInitialMode);
applyInitialMode();
