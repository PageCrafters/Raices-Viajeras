<?php
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');
require_once __DIR__ . '/../Formulario/php/conexiones.php';

$vid = isset($_GET['viaje']) ? (int)$_GET['viaje'] : 0;
if ($vid <= 0) { echo json_encode(null); exit; }


// Seleccionar campos existentes; la columna `detalles` no existe en el esquema actual,
// así que devolvemos NULL en su lugar para compatibilidad con el frontend.
$sql = "SELECT v.id, v.titulo, v.descripcion, v.imagen, NULL AS detalles, v.precio, p.nombre AS provincia_nombre
        FROM viajes v
        LEFT JOIN provincia p ON v.provincia_id = p.id
        WHERE v.id = ? LIMIT 1";

$stmt = mysqli_prepare($conexion, $sql);
if (!$stmt) {
    error_log('get_viaje.php prepare error: ' . mysqli_error($conexion));
    echo json_encode(null);
    exit;
}
mysqli_stmt_bind_param($stmt, 'i', $vid);
mysqli_stmt_execute($stmt);
$res = mysqli_stmt_get_result($stmt);
if (!$res) {
    error_log('get_viaje.php execute error: ' . mysqli_error($conexion));
    echo json_encode(null);
    exit;
}
$row = mysqli_fetch_assoc($res);
if (!$row) { echo json_encode(null); exit; }

$img = null;
if (!is_null($row['imagen']) && $row['imagen'] !== '') {
    $val = $row['imagen'];
    $isBinary = preg_match('/[\x00-\x08\x0E-\x1F]/', $val);
    if ($isBinary) {
        $img = 'data:image/jpeg;base64,' . base64_encode($val);
    } else {
        if (preg_match('/^(https?:\/\/|\.\/|\/|img\/|[A-Za-z0-9_\-]+\/)/', $val) || preg_match('/\.[a-zA-Z0-9]{2,4}$/', $val)) {
            $img = $val;
        } else {
            $img = 'data:image/jpeg;base64,' . base64_encode($val);
        }
    }
}

$viaje = [
    'id' => (int)$row['id'],
    'titulo' => $row['titulo'],
    'descripcion' => $row['descripcion'],
    'detalles' => $row['detalles'],
    'imagen' => $img,
    'precio' => $row['precio'],
    'provincia_nombre' => $row['provincia_nombre'] ?? null
];

echo json_encode($viaje);
?>