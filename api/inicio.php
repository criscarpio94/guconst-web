<?php
/*
 * api/inicio.php
 * Endpoint que devuelve los datos necesarios para la pantalla de inicio:
 * - Información de la empresa
 * - Estadísticas (años, maquinaria, proyectos)
 *
 * Uso desde JavaScript:
 *   fetch('api/inicio.php').then(r => r.json()).then(datos => ...)
 */

require_once __DIR__ . '/../configuracion/conexion.php';

$respuesta = [
    'exito'        => true,
    'empresa'      => null,
    'estadisticas' => []
];

try {
    // ── 1. Información de la empresa ────────────────────────────────────────
    $consulta = $conexion->query("SELECT * FROM configuracion_empresa LIMIT 1");
    if ($consulta && $consulta->num_rows > 0) {
        $respuesta['empresa'] = $consulta->fetch_assoc();
    }

    // ── 2. Estadísticas ─────────────────────────────────────────────────────

    // Años de experiencia (calculado desde el año de fundación)
    $anio_actual  = (int) date('Y');
    $anio_fundacion = 2017;
    $respuesta['estadisticas']['anios_experiencia'] = $anio_actual - $anio_fundacion;

    // Total de maquinaria en el catálogo
    $consulta = $conexion->query("SELECT COUNT(*) AS total FROM maquinaria");
    $fila = $consulta->fetch_assoc();
    $respuesta['estadisticas']['total_maquinaria'] = (int) $fila['total'];

    // Maquinaria actualmente disponible
    $consulta = $conexion->query("SELECT COUNT(*) AS total FROM maquinaria WHERE disponible = 1");
    $fila = $consulta->fetch_assoc();
    $respuesta['estadisticas']['maquinaria_disponible'] = (int) $fila['total'];

    // Total de proyectos realizados
    $consulta = $conexion->query("SELECT COUNT(*) AS total FROM proyectos");
    $fila = $consulta->fetch_assoc();
    $respuesta['estadisticas']['total_proyectos'] = (int) $fila['total'];

    // Solicitudes de proforma pendientes
    $consulta = $conexion->query("SELECT COUNT(*) AS total FROM solicitudes_proforma WHERE estado = 'pendiente'");
    $fila = $consulta->fetch_assoc();
    $respuesta['estadisticas']['proformas_pendientes'] = (int) $fila['total'];

} catch (Exception $e) {
    $respuesta['exito']   = false;
    $respuesta['mensaje'] = 'Error al consultar los datos: ' . $e->getMessage();
    http_response_code(500);
}

$conexion->close();

// Devolver respuesta en formato JSON
echo json_encode($respuesta, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
?>