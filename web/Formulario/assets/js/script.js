const registerButton = document.getElementById('btn_registrarse');
const loginButton = document.getElementById('btn_iniciar-sesion');
const loginRegisterContainer = document.querySelector('.contenedor_login-register');
const loginForm = document.querySelector('.formulario_login');
const registerForm = document.querySelector('.formulario_register');
const loginBackBox = document.querySelector('.caja_trasera-login');
const registerBackBox = document.querySelector('.caja_trasera-registro');

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
window.addEventListener('resize', applyInitialMode);
applyInitialMode();
