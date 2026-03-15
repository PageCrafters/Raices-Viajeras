<?php
session_start();

try {
    $pdo = new PDO("mysql:host=localhost;dbname=raices_viajeras;charset=utf8", "root", "");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $correo = $_POST['correo_login'];
    $pwd    = $_POST['pwd_login'];

    $stmt = $pdo->prepare("SELECT id, nombre_completo, pwd, rol FROM usuarios WHERE correo = ?");
    $stmt->execute([$correo]);
    $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($usuario && password_verify($pwd, $usuario['pwd'])) {
        $_SESSION['usuario'] = [
            'id'              => $usuario['id'],
            'nombre_completo' => $usuario['nombre_completo'],
            'rol'             => $usuario['rol']
        ];
        echo '<script>alert("Bienvenido, ' . htmlspecialchars($usuario['nombre_completo']) . '"); window.location = "/Raices-Viajeras/index.html";</script>';
    } else {
        echo '<script>alert("Correo o contraseña incorrectos."); window.location = "/Raices-Viajeras/web/Formulario/form.html";</script>';
    }

} catch (PDOException $e) {
    echo '<script>alert("Error al iniciar sesión."); window.location = "/Raices-Viajeras/web/Formulario/form.html";</script>';
}
?>