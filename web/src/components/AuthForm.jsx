import { useEffect, useRef, useState } from 'react';
import "../../Formulario/assets/css/style.css";

// Validaciones desde la carpeta original (se migrará más adelante)
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
} from '../../js/validaciones.js';

export default function AuthForm() {
    useEffect(() => {
        document.body.classList.add('auth-page');
        return () => document.body.classList.remove('auth-page');
    }, []);

    // Estado del modo (login / registro) 
    const [mode, setMode] = useState(() => {
        const params = new URLSearchParams(window.location.search);
        return params.get('modo') === 'registro' ? 'registro' : 'login';
    });

    // Estado errores login 
    const [loginErrors, setLoginErrors] = useState({ correo: '', pwd: '' });

    // Estado errores registro 
    const [registerErrors, setRegisterErrors] = useState({
        nombre: '', correo: '', pwd: '', pwdConfirm: '',
        genero: '', fecha: '', privacidad: ''
    });

    // Estado campos login 
    const [loginFields, setLoginFields] = useState({ correo: '', pwd: '', remember: false });

    // Estado campos registro 
    const [registerFields, setRegisterFields] = useState({
        nombre: '', correo: '', pwd: '', pwdConfirm: '',
        genero: '', fecha: '', privacidad: false, revista: false
    });

    // Redirect seguro 
    const getRedirect = () => {
        const params = new URLSearchParams(window.location.search);
        const value = (params.get('redirect') || '').trim();
        if (!value || !value.startsWith('/Raices-Viajeras/')) return '';
        if (/^[a-z][a-z0-9+\-.]*:/i.test(value) || value.startsWith('//')) return '';
        return value;
    };

    const redirect = getRedirect();

    // Sync URL al cambiar modo 
    useEffect(() => {
        const url = new URL(window.location.href);
        url.searchParams.set('modo', mode);
        if (redirect) url.searchParams.set('redirect', redirect);
        else url.searchParams.delete('redirect');
        window.history.replaceState({}, '', url);
        document.body.dataset.authMode = mode;
    }, [mode]);

    // Responsive: reaplica modo al redimensionar 
    useEffect(() => {
        const handler = () => setMode(m => m); // fuerza re-render
        window.addEventListener('resize', handler);
        return () => window.removeEventListener('resize', handler);
    }, []);

    const isDesktop = window.innerWidth > 850;

    // Posición del slider 
    const sliderLeft = isDesktop
        ? (mode === 'registro' ? '420px' : '10px')
        : '0px';

    //  Helpers de error 
    const setLoginError = (field, msg) =>
        setLoginErrors(prev => ({ ...prev, [field]: msg }));

    const setRegisterError = (field, msg) =>
        setRegisterErrors(prev => ({ ...prev, [field]: msg }));

    // Validaciones login 
    const validateLoginEmail = (val = loginFields.correo) => {
        const v = val.trim();
        let msg = '';
        if (!validarCampoObligatorio(v)) msg = 'Escribe tu correo electrónico.';
        else if (!validarCorreo(v)) msg = 'El correo electrónico no es válido.';
        setLoginError('correo', msg);
        return msg === '';
    };

    const validateLoginPwd = (val = loginFields.pwd) => {
        let msg = '';
        if (!validarCampoObligatorio(val)) msg = 'Escribe tu contraseña.';
        setLoginError('pwd', msg);
        return msg === '';
    };

    const validateLoginFormAll = () => {
        const a = validateLoginEmail();
        const b = validateLoginPwd();
        return a && b;
    };

    // Validaciones registro 
    const validateRegNombre = (val = registerFields.nombre) => {
        const v = val.trim();
        let msg = '';
        if (!validarCampoObligatorio(v)) msg = 'Escribe tu nombre completo.';
        else if (!validarNombre(v)) msg = 'El nombre no tiene un formato válido.';
        setRegisterError('nombre', msg);
        return msg === '';
    };

    const validateRegCorreo = (val = registerFields.correo) => {
        const v = val.trim();
        let msg = '';
        if (!validarCampoObligatorio(v)) msg = 'Escribe tu correo electrónico.';
        else if (!validarCorreo(v)) msg = 'El correo electrónico no es válido.';
        setRegisterError('correo', msg);
        return msg === '';
    };

    const validateRegPwd = (val = registerFields.pwd) => {
        let msg = '';
        if (!validarCampoObligatorio(val)) msg = 'Escribe una contraseña.';
        else if (!validarContrasena(val)) msg = 'La contraseña debe tener 8 caracteres, mayúscula, minúscula, número y símbolo.';
        setRegisterError('pwd', msg);
        return msg === '';
    };

    const validateRegPwdConfirm = (pwd = registerFields.pwd, confirm = registerFields.pwdConfirm) => {
        let msg = '';
        if (!validarCampoObligatorio(confirm)) msg = 'Confirma tu contraseña.';
        else if (!comprobarContrasenas(pwd, confirm)) msg = 'Las contraseñas no coinciden.';
        setRegisterError('pwdConfirm', msg);
        return msg === '';
    };

    const validateRegGenero = (val = registerFields.genero) => {
        const isValid = validarGenero(val);
        setRegisterError('genero', isValid ? '' : 'Selecciona un género.');
        return isValid;
    };

    const validateRegFecha = (val = registerFields.fecha) => {
        let msg = '';
        if (!validarCampoObligatorio(val)) msg = 'Escribe tu fecha de nacimiento.';
        else if (!validarFechaNacimiento(val)) msg = 'La fecha de nacimiento no es válida.';
        setRegisterError('fecha', msg);
        return msg === '';
    };

    const validateRegPrivacidad = (val = registerFields.privacidad) => {
        const isValid = validarCheckboxObligatorio(val);
        setRegisterError('privacidad', isValid ? '' : 'Debes aceptar la política de privacidad.');
        return isValid;
    };

    const validateRegisterFormAll = () => {
        const results = [
            validateRegNombre(),
            validateRegCorreo(),
            validateRegPwd(),
            validateRegPwdConfirm(),
            validateRegGenero(),
            validateRegFecha(),
            validateRegPrivacidad()
        ];
        return results.every(Boolean);
    };

    // Submit login
    const handleLoginSubmit = (e) => {
        if (!validateLoginFormAll()) {
            e.preventDefault();
        }
    };

    // Submit registro 
    const handleRegisterSubmit = (e) => {
        if (!validateRegisterFormAll()) {
            e.preventDefault();
        }
    };

    // Visibilidad de cajas traseras según modo y tamaño 
    const loginBackVisible = isDesktop ? true : mode === 'registro';
    const registerBackVisible = isDesktop ? true : mode === 'login';
    const loginBackOpacity = isDesktop ? (mode === 'login' ? 0 : 1) : 1;
    const registerBackOpacity = isDesktop ? (mode === 'registro' ? 0 : 1) : 1;

    return (
        <main className="auth-main">
            <div className="contenedor" id="auth-slider">

                {/* Caja trasera */}
                <div className="caja_trasera">
                    <div
                        className="caja_trasera-login"
                        style={{
                            display: loginBackVisible ? 'block' : 'none',
                            opacity: loginBackOpacity
                        }}
                    >
                        <h3>¿Ya tienes una cuenta?</h3>
                        <p>Inicia sesión para entrar en la web y recuperar tu cesta.</p>
                        <button type="button" onClick={() => setMode('login')}>
                            Iniciar sesión
                        </button>
                    </div>

                    <div
                        className="caja_trasera-registro"
                        style={{
                            display: registerBackVisible ? 'block' : 'none',
                            opacity: registerBackOpacity
                        }}
                    >
                        <h3>¿Aún no tienes una cuenta?</h3>
                        <p>Regístrate para guardar tu sesión y preparar tus viajes.</p>
                        <button type="button" onClick={() => setMode('registro')}>
                            Registrarse
                        </button>
                    </div>
                </div>

                {/* Panel deslizante */}
                <div
                    className="contenedor_login-register"
                    style={{ left: sliderLeft }}
                >
                    {/* Formulario login */}
                    <form
                        action="Formulario/php/login_usuarios.php"
                        method="POST"
                        className="formulario_login"
                        noValidate
                        onSubmit={handleLoginSubmit}
                        style={{
                            display: mode === 'login' || isDesktop ? 'block' : 'none',
                            opacity: mode === 'login' ? 1 : 0,
                            zIndex: mode === 'login' ? 2 : 1
                        }}
                    >
                        <h2>Iniciar sesión</h2>
                        <input type="hidden" name="redirect" value={redirect} />

                        <label className="visually-hidden" htmlFor="correo_login">Correo electrónico</label>
                        <input
                            type="email" id="correo_login" name="correo_login"
                            autoComplete="email" placeholder="Correo electrónico" required
                            className={loginErrors.correo ? 'is-invalid' : ''}
                            value={loginFields.correo}
                            onChange={e => {
                                const val = e.target.value;
                                setLoginFields(p => ({ ...p, correo: val }));
                                validateLoginEmail(val);
                            }}
                            aria-describedby="error-correo_login"
                        />
                        <p className={`auth-field-error${loginErrors.correo ? ' is-visible' : ''}`} id="error-correo_login" aria-live="polite">
                            {loginErrors.correo}
                        </p>

                        <label className="visually-hidden" htmlFor="pwd_login">Contraseña</label>
                        <input
                            type="password" id="pwd_login" name="pwd_login"
                            autoComplete="current-password" placeholder="Contraseña" required
                            className={loginErrors.pwd ? 'is-invalid' : ''}
                            value={loginFields.pwd}
                            onChange={e => {
                                const val = e.target.value;
                                setLoginFields(p => ({ ...p, pwd: val }));
                                validateLoginPwd(val);
                            }}
                            aria-describedby="error-pwd_login"
                        />
                        <p className={`auth-field-error${loginErrors.pwd ? ' is-visible' : ''}`} id="error-pwd_login" aria-live="polite">
                            {loginErrors.pwd}
                        </p>

                        <div className="form-check auth-inline-row">
                            <label className="form-check-label" htmlFor="remember_me">
                                <input
                                    className="form-check-input" type="checkbox"
                                    name="remember_me" id="remember_me" value="1"
                                    checked={loginFields.remember}
                                    onChange={e => setLoginFields(p => ({ ...p, remember: e.target.checked }))}
                                />
                                Recordarme durante 30 días
                            </label>
                        </div>

                        <button type="submit">Entrar</button>
                    </form>

                    {/* Formulario registro */}
                    <form
                        action="Formulario/php/registros_usuarios.php"
                        method="POST"
                        className="formulario_register"
                        noValidate
                        onSubmit={handleRegisterSubmit}
                        style={{
                            display: mode === 'registro' || isDesktop ? 'block' : 'none',
                            opacity: mode === 'registro' ? 1 : 0,
                            zIndex: mode === 'registro' ? 2 : 1
                        }}
                    >
                        <h2>Registrarse</h2>
                        <input type="hidden" name="redirect" value={redirect} />

                        <label className="visually-hidden" htmlFor="nombre_completo">Nombre completo</label>
                        <input
                            type="text" id="nombre_completo" name="nombre_completo"
                            autoComplete="name" placeholder="Nombre completo" required
                            className={registerErrors.nombre ? 'is-invalid' : ''}
                            value={registerFields.nombre}
                            onChange={e => {
                                const val = e.target.value;
                                setRegisterFields(p => ({ ...p, nombre: val }));
                                validateRegNombre(val);
                            }}
                            aria-describedby="error-nombre_completo"
                        />
                        <p className={`auth-field-error${registerErrors.nombre ? ' is-visible' : ''}`} id="error-nombre_completo" aria-live="polite">
                            {registerErrors.nombre}
                        </p>

                        <label className="visually-hidden" htmlFor="correo">Correo electrónico</label>
                        <input
                            type="email" id="correo" name="correo"
                            autoComplete="email" placeholder="Correo electrónico" required
                            className={registerErrors.correo ? 'is-invalid' : ''}
                            value={registerFields.correo}
                            onChange={e => {
                                const val = e.target.value;
                                setRegisterFields(p => ({ ...p, correo: val }));
                                validateRegCorreo(val);
                            }}
                            aria-describedby="error-correo"
                        />
                        <p className={`auth-field-error${registerErrors.correo ? ' is-visible' : ''}`} id="error-correo" aria-live="polite">
                            {registerErrors.correo}
                        </p>

                        <label className="visually-hidden" htmlFor="pwd">Contraseña</label>
                        <input
                            type="password" id="pwd" name="pwd"
                            autoComplete="new-password" placeholder="Contraseña" required
                            className={registerErrors.pwd ? 'is-invalid' : ''}
                            value={registerFields.pwd}
                            onChange={e => {
                                const val = e.target.value;
                                setRegisterFields(p => ({ ...p, pwd: val }));
                                validateRegPwd(val);
                                validateRegPwdConfirm(val, registerFields.pwdConfirm);
                            }}
                            aria-describedby="error-pwd"
                        />
                        <p className={`auth-field-error${registerErrors.pwd ? ' is-visible' : ''}`} id="error-pwd" aria-live="polite">
                            {registerErrors.pwd}
                        </p>

                        <label className="visually-hidden" htmlFor="pwdConfirm">Confirmar contraseña</label>
                        <input
                            type="password" id="pwdConfirm" name="passwordConfirm"
                            autoComplete="new-password" placeholder="Confirmar contraseña" required
                            className={registerErrors.pwdConfirm ? 'is-invalid' : ''}
                            value={registerFields.pwdConfirm}
                            onChange={e => {
                                const val = e.target.value;
                                setRegisterFields(p => ({ ...p, pwdConfirm: val }));
                                validateRegPwdConfirm(registerFields.pwd, val);
                            }}
                            aria-describedby="error-passwordConfirm"
                        />
                        <p className={`auth-field-error${registerErrors.pwdConfirm ? ' is-visible' : ''}`} id="error-passwordConfirm" aria-live="polite">
                            {registerErrors.pwdConfirm}
                        </p>

                        <div className={`radio-group${registerErrors.genero ? ' auth-group-invalid' : ''}`} role="radiogroup" aria-labelledby="genero-label">
                            <span id="genero-label">Género</span>
                            {['m', 'f', 'o'].map(val => (
                                <label key={val}>
                                    <input
                                        type="radio" name="genero" value={val}
                                        checked={registerFields.genero === val}
                                        onChange={() => {
                                            setRegisterFields(p => ({ ...p, genero: val }));
                                            validateRegGenero(val);
                                        }}
                                        aria-invalid={!!registerErrors.genero}
                                        aria-describedby="error-genero"
                                    />
                                    {val.toUpperCase()}
                                </label>
                            ))}
                        </div>
                        <p className={`auth-field-error${registerErrors.genero ? ' is-visible' : ''}`} id="error-genero" aria-live="polite">
                            {registerErrors.genero}
                        </p>

                        <div className={`auth-date-block${registerErrors.fecha ? ' auth-group-invalid' : ''}`}>
                            <label className="visually-hidden" htmlFor="fechaNacimiento">Fecha de nacimiento</label>
                            <p className="auth-date-helper">Fecha de nacimiento</p>
                            <input
                                type="date" id="fechaNacimiento" name="fechaNacimiento" required
                                className={registerErrors.fecha ? 'is-invalid' : ''}
                                value={registerFields.fecha}
                                onChange={e => {
                                    const val = e.target.value;
                                    setRegisterFields(p => ({ ...p, fecha: val }));
                                    validateRegFecha(val);
                                }}
                                aria-describedby="error-fechaNacimiento"
                            />
                        </div>
                        <p className={`auth-field-error${registerErrors.fecha ? ' is-visible' : ''}`} id="error-fechaNacimiento" aria-live="polite">
                            {registerErrors.fecha}
                        </p>

                        <div className={`form-check${registerErrors.privacidad ? ' auth-group-invalid' : ''}`}>
                            <label className="form-check-label" htmlFor="politica_privacidad">
                                <input
                                    className="form-check-input" type="checkbox"
                                    name="politica_privacidad" id="politica_privacidad" value="1"
                                    checked={registerFields.privacidad}
                                    onChange={e => {
                                        const val = e.target.checked;
                                        setRegisterFields(p => ({ ...p, privacidad: val }));
                                        validateRegPrivacidad(val);
                                    }}
                                    aria-describedby="error-politica_privacidad"
                                    aria-invalid={!!registerErrors.privacidad}
                                />
                                Acepto la política de privacidad
                            </label>

                            <label className="form-check-label" htmlFor="revista">
                                <input
                                    className="form-check-input" type="checkbox"
                                    name="revista" id="revista" value="1"
                                    checked={registerFields.revista}
                                    onChange={e => setRegisterFields(p => ({ ...p, revista: e.target.checked }))}
                                />
                                Quiero recibir novedades y revista
                            </label>
                        </div>
                        <p className={`auth-field-error${registerErrors.privacidad ? ' is-visible' : ''}`} id="error-politica_privacidad" aria-live="polite">
                            {registerErrors.privacidad}
                        </p>

                        <button type="submit">Crear cuenta</button>
                    </form>
                </div>
            </div>
        </main>
    );
}