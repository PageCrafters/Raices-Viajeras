<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - Registro</title>
    <link rel="stylesheet" href="assets/css/style.css">

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet">
</head>
<body>
    <main>
        <div class="contenedor">
            <div class="caja_trasera">
                <div class="caja_trasera-login">
                    <h3>¿Ya tienes una cuenta?</h3>
                    <p>Inicia sesión para entrar en la página</p>
                    <button id="btn_iniciar-sesion">Iniciar Sesión</button>
                </div>
                <div class="caja_trasera-registro">
                    <h3>¿Aún no tienes una cuenta?</h3>
                    <p>Regístrate para entrar en la página</p>
                    <button id="btn_registrarse">Registrarse</button>
                </div>
            </div>

            <!-- Formularios de login y registro -->
            <div class="contenedor_login-register">
                <!-- Login -->
                <form action="" class="formulario_login">
                    <h2>Iniciar Sesión</h2>
                    <input type="text" placeholder="Correo Electrónico">
                    <input type="password" placeholder="Contraseña">
                    <button>Entrar</button>
                </form>

                <!-- Registro -->
                <form action="" class="formulario_register">
                    <h2>Registrarse</h2>
                    <input type="text" placeholder="Nombre Completo" id="nombreApellido">
                    <input type="text" placeholder="Correo Electrónico" id="correo">
                    <input type="password" placeholder="Contraseña" id="pwd">
                    <input type="password" placeholder="Confirmar Contraseña" id="pwdConfirm">

                    <nav class="radio-group">
                        <label for="Genero">Género:</label>
                        <label><input type="radio" name="Genero" value="masculino"> M</label>
                        <label><input type="radio" name="Genero" value="femenino"> F</label>
                        <label><input type="radio" name="Genero" value="otro"> O</label>
                    </nav>
                    
                    <div>
                        <label>Fecha de nacimiento</label>
                        <input type="date" id="fechaNacimiento" name="fechaNacimiento"> 
                    </div>
                    
                    <div class="form-check">
                        <label class="form-check-label" for="politica_privacidad">
                            <input class="form-check-input" type="checkbox" name="politica_privacidad" id="politica_privacidad" required>
                            Activar notificaciones
                        </label>

                        <label class="form-check-label" for="revista">
                            <input class="form-check-input" type="checkbox" name="revista" id="revista" required>
                            Recivir revista
                        </label>
                    </div>
                    
                    <button>Registrarse</button>
                </form>
            </div>
        </div>
    </main>

    <script src="assets/js/script.js"></script>
</body>
</html>