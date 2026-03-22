<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

require_once __DIR__ . '/../Formulario/php/conexiones.php';
require_once __DIR__ . '/utilidades_imagen.php';

$conn = $conexion;

// Este endpoint sirve tanto para el listado del blog como para la ficha de una noticia concreta
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(['error' => 'Conexión fallida'], JSON_UNESCAPED_UNICODE);
    exit;
}

if (isset($_GET['id'])) {
    $id = intval($_GET['id']);
    $result = $conn->query("SELECT id, nombre, descripcion, categoria, imagen, imagen_movil FROM noticias WHERE id = $id");
    $article = $result ? $result->fetch_assoc() : null;

    if ($article) {
        $article['imagen'] = rv_resolve_responsive_image_value($article['imagen'] ?? null, $article['imagen_movil'] ?? null);
        unset($article['imagen_movil']);
    }

    echo json_encode($article, JSON_UNESCAPED_UNICODE);
} else {
    $result = $conn->query('SELECT id, nombre, descripcion, categoria, imagen, imagen_movil FROM noticias ORDER BY id DESC');
    $noticias = [];

    // Devuelvo el listado plano para que blog.js pueda filtrar en cliente sin mas pasos
    while ($row = $result->fetch_assoc()) {
        $row['imagen'] = rv_resolve_responsive_image_value($row['imagen'] ?? null, $row['imagen_movil'] ?? null);
        unset($row['imagen_movil']);
        $noticias[] = $row;
    }

    echo json_encode($noticias, JSON_UNESCAPED_UNICODE);
}

$conn->close();
?>
