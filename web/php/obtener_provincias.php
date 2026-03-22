<?php
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');

require_once __DIR__ . '/../Formulario/php/conexiones.php';
require_once __DIR__ . '/utilidades_imagen.php';

// Evito agrupar por imagen para no meter blobs dentro del GROUP BY.
$sql = "SELECT
            p.id,
            p.nombre,
            p.descripcion,
            p.imagen,
            p.imagen_movil,
            COALESCE(v.viajes_count, 0) AS viajes_count
        FROM provincia p
        LEFT JOIN (
            SELECT provincia_id, COUNT(*) AS viajes_count
            FROM viajes
            GROUP BY provincia_id
        ) v ON v.provincia_id = p.id
        ORDER BY p.nombre";

$result = mysqli_query($conexion, $sql);
if (!$result) {
    error_log('obtener_provincias.php SQL error: ' . mysqli_error($conexion));
    echo json_encode([]);
    exit;
}

$provinces = [];
// Aquí convierto cada fila al shape que espera directamente provincias.js.
while ($row = mysqli_fetch_assoc($result)) {
    $provinces[] = [
        'id' => (int) $row['id'],
        'nombre' => $row['nombre'],
        'descripcion' => $row['descripcion'],
        'imagen' => rv_resolve_responsive_image_value($row['imagen'] ?? null, $row['imagen_movil'] ?? null),
        'viajes_count' => (int) $row['viajes_count']
    ];
}

echo json_encode($provinces, JSON_UNESCAPED_UNICODE);
?>
