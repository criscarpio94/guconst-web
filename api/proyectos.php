<?php

//Para gestionar las lista de proyectos desde la base de datos de MySQL
require_once '../configuracion/conexion.php';

$respuesta = ['exito' => true, 'datos' => [], 'total' => 0];

try {
    $condiciones = ['1=1'];
    $parametros  = [];
    $tipos       = '';

    //Filtro para categoria
    if (!empty($_GET['categoria']) && $_GET['categoria'] !== 'Todos') {
        $condiciones[] = 'categoria = ?';
        $parametros[]  = $_GET['categoria'];
        $tipos        .= 's';
    }

    //Filtro para buscar por año 
    if (!empty($_GET['anio'])) {
        $condiciones[] = 'anio = ?';
        $parametros[]  = (int) $_GET['anio'];
        $tipos        .= 'i';
    }

    //Sentencia para ordenar del mas reciente al mas antiguo
    $sql = 'SELECT * FROM proyectos WHERE '
         . implode(' AND ', $condiciones)
         . ' ORDER BY anio DESC, id DESC';

    $stmt = $conexion->prepare($sql);
    if (!empty($parametros)) {
        $stmt->bind_param($tipos, ...$parametros);
    }

    $stmt->execute();
    $resultado = $stmt->get_result();

    $proyectos = [];
    while ($fila = $resultado->fetch_assoc()) {
        $proyectos[] = $fila;
    }

    $respuesta['datos'] = $proyectos;
    $respuesta['total'] = count($proyectos);
    $stmt->close();

} catch (Exception $e) {
    $respuesta['exito']   = false;
    $respuesta['mensaje'] = 'Error al cargar proyectos: ' . $e->getMessage();
    http_response_code(500);
}

$conexion->close();
echo json_encode($respuesta, JSON_UNESCAPED_UNICODE);
?>