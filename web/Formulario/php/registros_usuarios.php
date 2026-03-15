<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);
session_start();

try {
    $pdo = new PDO("mysql:host=localhost;dbname=raices_viajeras;charset=utf8", "root", "");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $nombre_completo     = $_POST['nombre_completo'];
    $correo              = $_POST['correo'];
    $pwd                 = password_hash($_POST['pwd'], PASSWORD_BCRYPT);
    $genero              = $_POST['genero'];
    $fechaNacimiento     = $_POST['fechaNacimiento'];
    $politica_privacidad = isset($_POST['politica_privacidad']) ? 1 : 0;
    $revista             = isset($_POST['revista']) ? 1 : 0;
    $rol                 = (strtolower($nombre_completo) === 'admin') ? 'admin' : 'usuario';

    // Comprobar si el correo ya existe
    $check = $pdo->prepare("SELECT id FROM usuarios WHERE correo = ?");
    $check->execute([$correo]);
    if ($check->fetch()) {
        echo '<script>alert("Este correo ya está registrado."); window.location = "/Raices-Viajeras/web/Formulario/form.html";</script>';
        exit;
    }

    $stmt = $pdo->prepare("INSERT INTO usuarios 
        (nombre_completo, correo, pwd, genero, fechaNacimiento, politica_privacidad, revista, rol)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)");

    $stmt->execute([$nombre_completo, $correo, $pwd, $genero, $fechaNacimiento, $politica_privacidad, $revista, $rol]);

    echo '<script>alert("Usuario registrado correctamente."); window.location = "/Raices-Viajeras/web/Formulario/form.html";</script>';

} catch (PDOException $e) {
    echo '<script>alert("Error: ' . $e->getMessage() . '"); window.location = "/Raices-Viajeras/web/Formulario/form.html";</script>';
}
?>