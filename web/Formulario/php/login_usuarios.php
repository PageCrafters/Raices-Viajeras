<?php
require_once __DIR__ . '/../../php/autenticacion.php';

/**
 * Muestra un aviso corto y devuelve al usuario a la cara correcta del formulario.
 *
 * @param string $message Mensaje que se quiere mostrar.
 * @param string $mode Cara del formulario a la que se vuelve.
 * @param string $target Destino final si se quiere salir del formulario.
 * @return void
 */
function login_redirect(string $message, string $mode = 'login', string $target = '/Raices-Viajeras/index.html'): void
{
    if ($mode === 'login' && $target === '/Raices-Viajeras/index.html') {
        echo '<script>alert(' . json_encode($message, JSON_UNESCAPED_UNICODE) . '); window.location = ' . json_encode($target) . ';</script>';
        exit;
    }

    $url = '/Raices-Viajeras/web/Formulario/form.html?modo=' . $mode;
    echo '<script>alert(' . json_encode($message, JSON_UNESCAPED_UNICODE) . '); window.location = ' . json_encode($url) . ';</script>';
    exit;
}

/**
 * Comprueba tanto hashes actuales como contrasenas antiguas guardadas en claro.
 *
 * Si el usuario venia de un esquema viejo, deja marcado que hace falta rehash.
 *
 * @param string $plainPassword Contrasena escrita por el usuario.
 * @param string $storedPassword Valor guardado en base de datos.
 * @param bool $needsRehash Bandera que nos dice si hay que actualizar el hash.
 * @return bool
 */
// Esta comprobacion nos deja convivir con passwords nuevas hasheadas y usuarios antiguos.
function login_password_is_valid(string $plainPassword, string $storedPassword, bool &$needsRehash): bool
{
    $needsRehash = false;

    if ($storedPassword === '') {
        return false;
    }

    if (password_get_info($storedPassword)['algo'] !== 0) {
        if (!password_verify($plainPassword, $storedPassword)) {
            return false;
        }

        $needsRehash = password_needs_rehash($storedPassword, PASSWORD_BCRYPT);
        return true;
    }

    if (!hash_equals($storedPassword, $plainPassword)) {
        return false;
    }

    $needsRehash = true;
    return true;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: /Raices-Viajeras/web/Formulario/form.html?modo=login');
    exit;
}

try {
    // Aqui normalizo la entrada antes de tocar base de datos o sesion.
    $correo = trim($_POST['correo_login'] ?? '');
    $pwd = (string) ($_POST['pwd_login'] ?? '');
    $rememberMe = isset($_POST['remember_me']) && $_POST['remember_me'] === '1';

    if ($correo === '' || $pwd === '') {
        login_redirect('Debes rellenar correo y contrasena.', 'login');
    }

    $usuario = auth_find_user_by_email($correo);
    if (!$usuario) {
        login_redirect('Correo o contrasena incorrectos.', 'login');
    }

    $needsRehash = false;
    if (!login_password_is_valid($pwd, (string) ($usuario['pwd'] ?? ''), $needsRehash)) {
        login_redirect('Correo o contrasena incorrectos.', 'login');
    }

    // Si el usuario estaba guardado con password antigua en claro, la actualizo al vuelo.
    if ($needsRehash) {
        $stmt = auth_get_pdo()->prepare('UPDATE usuarios SET pwd = ? WHERE id = ?');
        $stmt->execute([password_hash($pwd, PASSWORD_BCRYPT), (int) $usuario['id']]);
    }

    auth_login_user($usuario, $rememberMe);
    login_redirect('Bienvenido, ' . ($usuario['nombre_completo'] ?? 'viajero') . '.', 'login', '/Raices-Viajeras/index.html');
} catch (Throwable $error) {
    error_log('login_usuarios.php error: ' . $error->getMessage());
    login_redirect('Error al iniciar sesion.', 'login');
}
?>
