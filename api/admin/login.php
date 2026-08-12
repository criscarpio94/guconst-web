<?php

//Api para las sesiones de administradores, se verifica las credenciales de inicio de sesion, con las registradas en al bdd
session_start(); // SIEMPRE sera la primera línea, antes de cualquier output

header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }
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

//Conexion a la BD (sin usar conexion.php porque ya iniciamos sesión)
$host_actual = $_SERVER['HTTP_HOST'] ?? '';
$es_local = ($host_actual === 'localhost' || $host_actual === '127.0.0.1');

$bd_host = 'localhost';
$bd_usuario = $es_local ? 'root' : 'TU_USUARIO_HOSTINGER';
$bd_contras = $es_local ? '' : 'TU_CONTRASENIA_HOSTINGER';
$bd_nombre = $es_local ? 'guconst_db' : 'u613566817_guconst_db';

$conn = new mysqli($bd_host, $bd_usuario, $bd_contras, $bd_nombre);
$conn->set_charset('utf8mb4');

if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(['exito' => false, 'mensaje' => 'Error de base de datos.']);
    exit;
}

//Busqueda del administrador por correo
$correo = htmlspecialchars(trim($datos['correo']), ENT_QUOTES, 'UTF-8');
$stmt   = $conn->prepare('SELECT * FROM administradores WHERE correo = ? AND activo = 1 LIMIT 1');
$stmt->bind_param('s', $correo);
$stmt->execute();
$resultado = $stmt->get_result();
$admin     = $resultado->fetch_assoc();
$stmt->close();
$conn->close();

if (!$admin) {
    echo json_encode(['exito' => false, 'mensaje' => 'Credenciales incorrectas.']);
    exit;
}

/*
 * AVANCE 3: Comparación directa de contraseña (texto plano).
 * AVANCE 4: Se reemplazará por password_verify() con bcrypt.
 */
if ($datos['contrasenia'] !== $admin['contrasenia']) {
    echo json_encode(['exito' => false, 'mensaje' => 'Credenciales incorrectas.']);
    exit;
}

//Si las Credenciales son correctas se guardan datos en la sesión
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