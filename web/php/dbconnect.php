/* Conexión con la base de datos */
<?php
    $host = getenv("mysql.railway.internal");
    $user = getenv("root");
    $pass = getenv("RNFiYiZdYGKjqLpOFuSphIcSiHOcmiiz");
    $db   = getenv("railway");
    $port = getenv("3306");

    $conn = new mysqli($host, $user, $pass, $db, $port);

    /*Conexión usando try catch*/
    try {
        if ($conn->connect_error) {
            throw new Exception("Error de conexión: " . $conn->connect_error);
        }
    } catch (Exception $e) {
        echo $e->getMessage();
    }

?>