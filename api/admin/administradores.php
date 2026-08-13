<?php

//Listar administradores, crear nuevos admninistrdores y eliminar
session_start();

// Cabeceras de respuesta
header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

// validacion para Verificar existencia de sesion activa
if (empty($_SESSION['admin_id'])) {
    http_response_code(401);
    echo json_encode(['exito' => false, 'mensaje' => 'No autorizado.']);
    exit;
}

// validacion para restringir permisos, Solo el superadmin gestiona otros usuarios
if ($_SESSION['admin_rol'] !== 'superadmin') {
    http_response_code(403);
    echo json_encode(['exito' => false, 'mensaje' => 'Sin permisos. Solo el superadmin puede gestionar administradores.']);
    exit;
}

require_once '../../configuracion/conexion.php';

$metodo = $_SERVER['REQUEST_METHOD'];

//METODO GET: Listar administradores
if ($metodo === 'GET') {
    // Consulta limpia excluyendo el campo 'contrasenia' por seguridad
    $resultado = $conexion->query(
        "SELECT id, nombre, correo, rol, activo,
                DATE_FORMAT(creado_en, '%d/%m/%Y') AS fecha_registro
         FROM administradores ORDER BY id ASC"
    );
    $admins = [];
    while ($fila = $resultado->fetch_assoc()) {
        $fila['activo'] = (bool)$fila['activo'];
        $admins[] = $fila;
    }
    echo json_encode(['exito' => true, 'datos' => $admins], JSON_UNESCAPED_UNICODE);
}

// METODO POST: Crear nuevo administrador
elseif ($metodo === 'POST') {
    $datos = json_decode(file_get_contents('php://input'), true);

    // validacion de campos obligatorios
    if (empty($datos['nombre']) || empty($datos['correo']) || empty($datos['contrasenia'])) {
        echo json_encode(['exito' => false, 'mensaje' => 'Nombre, correo y contraseña son obligatorios.']);
        $conexion->close(); exit;
    }

    // validacion de sintaxis de email
    if (!filter_var($datos['correo'], FILTER_VALIDATE_EMAIL)) {
        echo json_encode(['exito' => false, 'mensaje' => 'Correo no válido.']);
        $conexion->close(); exit;
    }

    // validacion de longitud minima de contraseña
    if (strlen($datos['contrasenia']) < 8) {
        echo json_encode(['exito' => false, 'mensaje' => 'La contraseña debe tener al menos 8 caracteres.']);
        $conexion->close(); exit;
    }

    // verificacion de duplicados en la base de datos
    $stmt_check = $conexion->prepare('SELECT id FROM administradores WHERE correo = ?');
    $correo_nuevo = trim($datos['correo']);
    $stmt_check->bind_param('s', $correo_nuevo);
    $stmt_check->execute();
    $stmt_check->store_result();
    if ($stmt_check->num_rows > 0) {
        $stmt_check->close();
        echo json_encode(['exito' => false, 'mensaje' => 'Ese correo ya está registrado.']);
        $conexion->close(); exit;
    }
    $stmt_check->close();

    $nombre = htmlspecialchars(trim($datos['nombre']), ENT_QUOTES, 'UTF-8');
    $rol    = in_array($datos['rol'] ?? '', ['admin', 'superadmin']) ? $datos['rol'] : 'admin';

    // generacion de hash bcrypt 
    $hash = password_hash($datos['contrasenia'], PASSWORD_BCRYPT, ['cost' => 12]);

    $stmt = $conexion->prepare(
        'INSERT INTO administradores (nombre, correo, contrasenia, rol) VALUES (?, ?, ?, ?)'
    );
    $stmt->bind_param('ssss', $nombre, $correo_nuevo, $hash, $rol);
    $stmt->execute();
    $nuevo_id = $conexion->insert_id;
    $stmt->close();

    echo json_encode([
        'exito'   => true,
        'mensaje' => 'Administrador creado exitosamente.',
        'id'      => $nuevo_id
    ], JSON_UNESCAPED_UNICODE);
}

// METODO DELETE: Eliminar un administrador 
elseif ($metodo === 'DELETE') {
    $datos = json_decode(file_get_contents('php://input'), true);
    $id    = (int)($datos['id'] ?? 0);

    if (!$id) {
        echo json_encode(['exito' => false, 'mensaje' => 'ID requerido.']);
        $conexion->close(); exit;
    }

    // Regla de negocio: Un superadmin no puede autoeliminarse
    if ($id === (int)$_SESSION['admin_id']) {
        echo json_encode(['exito' => false, 'mensaje' => 'No puedes eliminar tu propia cuenta.']);
        $conexion->close(); exit;
    }

    $stmt = $conexion->prepare('DELETE FROM administradores WHERE id = ?');
    $stmt->bind_param('i', $id);
    $stmt->execute();
    $stmt->close();

    echo json_encode(['exito' => true, 'mensaje' => 'Administrador eliminado.']);
}

$conexion->close();
?>