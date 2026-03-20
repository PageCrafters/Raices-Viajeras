<?php
require_once __DIR__ . '/autenticacion.php';

// Este endpoint deja la sesion limpia tanto en servidor como en cookies.
auth_logout_user();

header('Location: /Raices-Viajeras/index.html');
exit;
?>
