<?php
//Para eliminar la sesion 
session_start();
session_unset();   // Eliminar todas las variables de sesión
session_destroy(); // Destruir la sesión en el servidor

header('Content-Type: application/json; charset=UTF-8');
echo json_encode(['exito' => true, 'mensaje' => 'Sesión cerrada correctamente.']);
?>