<?php
require_once __DIR__ . '/autenticacion.php';
require_once __DIR__ . '/contador_entradas.php';

header('Content-Type: application/json; charset=utf-8');

// Antes de responder, intentamos levantar la sesion desde la cookie persistente.
$user = auth_current_user();

// El contador se mueve aqui porque casi toda la web publica ya consulta esta ruta al cargar el header.
entry_counter_register_visit($user);

if ($user) {
    echo json_encode([
        'logueado' => true,
        'id' => (int) $user['id'],
        'nombre' => $user['nombre_completo'],
        'rol' => $user['rol']
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

echo json_encode([
    'logueado' => false,
    'id' => null,
    'nombre' => null,
    'rol' => null
], JSON_UNESCAPED_UNICODE);
?>
