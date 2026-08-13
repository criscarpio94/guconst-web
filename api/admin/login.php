<?php
// Api para las sesiones de administradores
session_start(); // Primera línea para manejar la sesión

// Requerimos la conexion centralizada
require_once __DIR__ . '/../../configuracion/conexion.php';

// Validacion del método HTTP
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['exito' => false, 'mensaje' => 'Método no permitido']);
    exit;
}

$datos = json_decode(file_get_contents('php://input'), true);

if (empty($datos['correo']) || empty($datos['contrasenia'])) {
    echo json_encode(['exito' => false, 'mensaje' => 'Correo y contraseña son obligatorios.']);
    exit;
}

// Busqueda del usuario en la base de datos usando la variable $conexion
$correo = htmlspecialchars(trim($datos['correo']), ENT_QUOTES, 'UTF-8');
$stmt   = $conexion->prepare('SELECT * FROM administradores WHERE correo = ? AND activo = 1 LIMIT 1');
$stmt->bind_param('s', $correo);
$stmt->execute();
$admin = $stmt->get_result()->fetch_assoc();
$stmt->close();

if (!$admin) {
    echo json_encode(['exito' => false, 'mensaje' => 'Credenciales incorrectas.']);
    exit;
}

// Verificación de contraseña con bcrypt
if (!password_verify($datos['contrasenia'], $admin['contrasenia'])) {
    echo json_encode(['exito' => false, 'mensaje' => 'Credenciales incorrectas.']);
    exit;
}

// Login exitoso: se guardan los datos de la sesion
$_SESSION['admin_id']     = $admin['id'];
$_SESSION['admin_nombre'] = $admin['nombre'];
$_SESSION['admin_correo'] = $admin['correo'];
$_SESSION['admin_rol']    = $admin['rol'];

echo json_encode([
    'exito' => true,
    'admin' => [
        'id'     => $admin['id'],
        'nombre' => $admin['nombre'],
        'correo' => $admin['correo'],
        'rol'    => $admin['rol']
    ]
], JSON_UNESCAPED_UNICODE);
?>