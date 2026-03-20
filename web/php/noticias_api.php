<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

require_once '../Formulario/php/conexiones.php';

$conn = $conexion;

// Este endpoint sirve tanto para el listado del blog como para la ficha de una noticia concreta.
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["error" => "Conexión fallida"]);
    exit;
}

if (isset($_GET['id'])) {
    $id = intval($_GET['id']);
    $result = $conn->query("SELECT id, nombre, descripcion, categoria, imagen FROM noticias WHERE id = $id");
    echo json_encode($result->fetch_assoc());
} else {
    $result = $conn->query("SELECT id, nombre, descripcion, categoria, imagen FROM noticias ORDER BY id DESC");
    $noticias = [];

    // Devuelvo el listado plano para que blog.js pueda filtrar en cliente sin mas pasos.
    while ($row = $result->fetch_assoc()) {
        $noticias[] = $row;
    }
    echo json_encode($noticias);
}

$conn->close();
?>
