<?php
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');

require_once __DIR__ . '/../Formulario/php/conexiones.php';
require_once __DIR__ . '/utilidades_imagen.php';

// Si el id no viene bien, corto aqui y dejo al front pintar su estado vacio.
$tripId = isset($_GET['viaje']) ? (int) $_GET['viaje'] : 0;
if ($tripId <= 0) {
    echo json_encode(null);
    exit;
}

// Devuelvo todos los campos que hoy existen en viajes y sirven para la ficha completa.
$sql = "SELECT
            v.id,
            v.titulo,
            v.descripcion,
            v.imagen,
            v.precio,
            v.origen,
            v.fecha_inicio,
            v.fecha_fin,
            v.plazas,
            v.provincia_id,
            p.nombre AS provincia_nombre,
            p.descripcion AS provincia_descripcion
        FROM viajes v
        LEFT JOIN provincia p ON v.provincia_id = p.id
        WHERE v.id = ?
        LIMIT 1";

$stmt = mysqli_prepare($conexion, $sql);
if (!$stmt) {
    error_log('obtener_viaje.php prepare error: ' . mysqli_error($conexion));
    echo json_encode(null);
    exit;
}

mysqli_stmt_bind_param($stmt, 'i', $tripId);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);

if (!$result) {
    error_log('obtener_viaje.php execute error: ' . mysqli_error($conexion));
    echo json_encode(null);
    exit;
}

$row = mysqli_fetch_assoc($result);
if (!$row) {
    echo json_encode(null);
    exit;
}

// Esta conversion final deja el detalle listo para pintarse sin mas transformaciones.
$trip = [
    'id' => (int) $row['id'],
    'titulo' => $row['titulo'],
    'descripcion' => $row['descripcion'],
    'imagen' => rv_resolve_image_value($row['imagen']),
    'precio' => (float) $row['precio'],
    'origen' => $row['origen'],
    'fecha_inicio' => $row['fecha_inicio'],
    'fecha_fin' => $row['fecha_fin'],
    'plazas' => isset($row['plazas']) ? (int) $row['plazas'] : null,
    'provincia_id' => isset($row['provincia_id']) ? (int) $row['provincia_id'] : null,
    'provincia_nombre' => $row['provincia_nombre'] ?? null,
    'provincia_descripcion' => $row['provincia_descripcion'] ?? null
];

echo json_encode($trip, JSON_UNESCAPED_UNICODE);
?>
