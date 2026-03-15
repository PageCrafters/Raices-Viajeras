<?php
session_start();
header("Content-Type: application/json");

if (isset($_SESSION['usuario'])) {
    echo json_encode([
        'logueado' => true,
        'nombre' => $_SESSION['usuario']['nombre_completo'],
        'rol'    => $_SESSION['usuario']['rol']
    ]);
} else {
    echo json_encode(['logueado' => false, 'rol' => null]);
}
?>