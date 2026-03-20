<?php
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');

require_once __DIR__ . '/../Formulario/php/conexiones.php';
require_once __DIR__ . '/utilidades_imagen.php';

$provinceId = 0;

// Acepto provincia_id o provincia por nombre para no romper enlaces viejos.
if (isset($_GET['provincia_id'])) {
    $provinceId = (int) $_GET['provincia_id'];
} elseif (isset($_GET['provincia'])) {
    $provinceValue = $_GET['provincia'];

    if (is_numeric($provinceValue)) {
        $provinceId = (int) $provinceValue;
    } else {
        $sqlProvince = "SELECT id FROM provincia WHERE LOWER(nombre) = LOWER(?) LIMIT 1";
        $stmtProvince = mysqli_prepare($conexion, $sqlProvince);
        mysqli_stmt_bind_param($stmtProvince, 's', $provinceValue);
        mysqli_stmt_execute($stmtProvince);
        $provinceResult = mysqli_stmt_get_result($stmtProvince);
        $provinceRow = mysqli_fetch_assoc($provinceResult);
        $provinceId = $provinceRow ? (int) $provinceRow['id'] : 0;
    }
}

if ($provinceId <= 0) {
    echo json_encode([]);
    exit;
}

$sql = "SELECT id, titulo, descripcion, imagen, precio
        FROM viajes
        WHERE provincia_id = ?
        ORDER BY id";

$stmt = mysqli_prepare($conexion, $sql);
mysqli_stmt_bind_param($stmt, 'i', $provinceId);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);

$trips = [];
// Mantengo el payload sencillo porque destinos.js ya se encarga del resto del render.
while ($row = mysqli_fetch_assoc($result)) {
    $trips[] = [
        'id' => (int) $row['id'],
        'titulo' => $row['titulo'],
        'descripcion' => $row['descripcion'],
        'imagen' => rv_resolve_image_value($row['imagen']),
        'precio' => (float) $row['precio']
    ];
}

echo json_encode($trips, JSON_UNESCAPED_UNICODE);
?>
