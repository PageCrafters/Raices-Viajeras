/* Conexión con la base de datos */
<?php
    $url = parse_url(getenv("mysql://root:RNFiYiZdYGKjqLpOFuSphIcSiHOcmiiz@mysql.railway.internal:3306/railway"));

    $host = $url["mysql.railway.internal"];
    $user = $url["root"];
    $pass = $url["RNFiYiZdYGKjqLpOFuSphIcSiHOcmiiz"];
    $db   = ltrim($url["path"], "/");
    $port = $url["3306"];

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