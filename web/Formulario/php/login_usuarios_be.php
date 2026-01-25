<?php
include "conexiones.php";

$correo_login = $_POST['correo_login'];
$pwd_login = $_POST['pwd_login'];


$query = "INSERT INTO usuarios_login
(correo_login, pwd_login)
VALUES
('correo_login', 'pwd_login')";

$ejecutar = mysqli_query($conexion, $query);

if ($ejecutar) {
    echo '
        <script>
            alert("Usuario almacenado correctamente");
            window.location = "../index.php";
        </script>
    ';
} else {
    echo '
        <script>
            alert("Inténtalo de nuevo");
            window.location = "../index.php";
        </script>
    ';
}

mysqli_close($conexion);