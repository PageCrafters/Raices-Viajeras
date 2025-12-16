<?php
/* Script para registrar un nuevo usuario */

require_once 'dbconnect.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $nombre = trim($_POST['nombre'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $contrasenia = $_POST['contrasenia'] ?? '';
    $tipo_viaje = $_POST['tipo_viaje'] ?? '';
    $notificaciones = isset($_POST['notificaciones']) ? 1 : 0;

    // Validaciones básicas
    if (empty($nombre) || empty($email) || empty($contrasenia) || empty($tipo_viaje)) {
        echo json_encode(['success' => false, 'message' => 'Todos los campos son obligatorios.']);
        exit;
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(['success' => false, 'message' => 'Correo electrónico no válido.']);
        exit;
    }

    // Hashear la contraseña
    $hashed_password = password_hash($contrasenia, PASSWORD_DEFAULT);

    try {
        // Verificar si el email ya existe
        $stmt_check = $conn->prepare("SELECT id FROM usuarios WHERE email = ?");
        $stmt_check->bind_param("s", $email);
        $stmt_check->execute();
        $stmt_check->store_result();

        if ($stmt_check->num_rows > 0) {
            echo json_encode(['success' => false, 'message' => 'El correo electrónico ya está registrado.']);
            $stmt_check->close();
            exit;
        }
        $stmt_check->close();

        // Insertar el nuevo usuario
        $stmt = $conn->prepare("INSERT INTO usuarios (nombre, email, contrasenia, tipo_viaje, notificaciones) VALUES (?, ?, ?, ?, ?)");
        $stmt->bind_param("ssssi", $nombre, $email, $hashed_password, $tipo_viaje, $notificaciones);
        $stmt->execute();

        echo json_encode(['success' => true, 'message' => 'Usuario registrado exitosamente.']);
        $stmt->close();
    } catch (mysqli_sql_exception $e) {
        echo json_encode(['success' => false, 'message' => 'Error al registrar el usuario: ' . $e->getMessage()]);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Método no permitido.']);
}

$conn->close();
?>