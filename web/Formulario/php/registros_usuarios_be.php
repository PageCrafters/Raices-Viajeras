<?php
include "conexiones.php";

$nombre_completo = $_POST['nombre_completo'];
$correo = $_POST['correo'];
$pwd = $_POST['pwd'];
$passwordConfirm = $_POST['passwordConfirm'];
$genero = $_POST['genero'];
$fechaNacimiento = $_POST['fechaNacimiento'];
$politica_privacidad = isset($_POST['politica_privacidad']) ? 1 : 0;
$revista = isset($_POST['revista']) ? 1 : 0;

$query = "INSERT INTO usuarios
(nombre_completo, correo, pwd, passwordConfirm, genero, fechaNacimiento, politica_privacidad, revista)
VALUES
('$nombre_completo', '$correo', '$pwd', '$passwordConfirm', '$genero', '$fechaNacimiento', '$politica_privacidad', '$revista')";

$ejecutar = mysqli_query($conexion, $query);

if ($ejecutar) {
    echo '
        <script>
            alert("Usuario almacenado correctamente");
            window.location = "../index.html";
        </script>
    ';
} else {
    echo '
        <script>
            alert("Inténtalo de nuevo");
            window.location = "../index.html";
        </script>
    ';
}

mysqli_close($conexion);
