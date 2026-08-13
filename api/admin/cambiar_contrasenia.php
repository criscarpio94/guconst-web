<?php

//Para cambiar contraseñas de administradores
session_start();

// Cabeceras de respuesta JSON y configuración CORS
header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

// validacion de sesion activa o iniciada
if (empty($_SESSION['admin_id'])) {
    http_response_code(401);
    echo json_encode(['exito' => false, 'mensaje' => 'No autorizado.']);
    exit;
}

require_once '../../configuracion/conexion.php';

$datos = json_decode(file_get_contents('php://input'), true);

// validacion de campos obligatorios
if (empty($datos['actual']) || empty($datos['nueva']) || empty($datos['confirmar'])) {
    echo json_encode(['exito' => false, 'mensaje' => 'Todos los campos son obligatorios.']);
    $conexion->close(); exit;
}

// coicidencia entre nueva contraseña
if ($datos['nueva'] !== $datos['confirmar']) {
    echo json_encode(['exito' => false, 'mensaje' => 'La contraseña nueva y su confirmación no coinciden.']);
    $conexion->close(); exit;
}

// validacion para longitud minima de contraseña (8 caracteres)
if (strlen($datos['nueva']) < 8) {
    echo json_encode(['exito' => false, 'mensaje' => 'La contraseña debe tener al menos 8 caracteres.']);
    $conexion->close(); exit;
}

// para obtener la clave actual en BD para el admin autenticado
$id   = (int)$_SESSION['admin_id'];
$stmt = $conexion->prepare('SELECT contrasenia FROM administradores WHERE id = ?');
$stmt->bind_param('i', $id);
$stmt->execute();
$admin = $stmt->get_result()->fetch_assoc();
$stmt->close();

//verificacion de seguridad de la contraseña actual
if (!password_verify($datos['actual'], $admin['contrasenia'])) {
    echo json_encode(['exito' => false, 'mensaje' => 'La contraseña actual es incorrecta.']);
    $conexion->close(); exit;
}

// generacion de clave con nuevo hash BCRYPT y guaradado en la base de datos
$nuevo_hash = password_hash($datos['nueva'], PASSWORD_BCRYPT, ['cost' => 12]);
$stmt2 = $conexion->prepare('UPDATE administradores SET contrasenia = ? WHERE id = ?');
$stmt2->bind_param('si', $nuevo_hash, $id);
$stmt2->execute();
$stmt2->close();

echo json_encode(['exito' => true, 'mensaje' => 'Contraseña actualizada correctamente.']);
$conexion->close();
?>