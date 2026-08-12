<?php
//Verificador de sesion activa de un administrador
session_start();

header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Origin: *');

if (!empty($_SESSION['admin_id'])) {
    echo json_encode([
        'autenticado' => true,
        'admin' => [
            'id'     => $_SESSION['admin_id'],
            'nombre' => $_SESSION['admin_nombre'],
            'correo' => $_SESSION['admin_correo'],
            'rol'    => $_SESSION['admin_rol']
        ]
    ]);
} else {
    echo json_encode(['autenticado' => false]);
}
?>