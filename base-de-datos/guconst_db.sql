-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 20-07-2026 a las 03:02:05
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `guconst_db`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `administradores`
--

CREATE TABLE `administradores` (
  `id` int(11) NOT NULL,
  `nombre` varchar(200) NOT NULL,
  `correo` varchar(100) NOT NULL,
  `contrasenia` varchar(255) NOT NULL,
  `rol` enum('superadmin','admin') DEFAULT 'admin',
  `activo` tinyint(1) DEFAULT 1,
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `administradores`
--

INSERT INTO `administradores` (`id`, `nombre`, `correo`, `contrasenia`, `rol`, `activo`, `creado_en`) VALUES
(1, 'Administrador General', 'superadmin@guconst.com', 'Guconst@2024', 'superadmin', 1, '2026-07-20 01:01:16');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `configuracion_empresa`
--

CREATE TABLE `configuracion_empresa` (
  `id` int(11) NOT NULL,
  `nombre` varchar(200) NOT NULL,
  `nombre_corto` varchar(100) DEFAULT NULL,
  `ruc` varchar(20) DEFAULT NULL,
  `telefono` varchar(50) DEFAULT NULL,
  `correo` varchar(100) DEFAULT NULL,
  `direccion` text DEFAULT NULL,
  `descripcion` text DEFAULT NULL,
  `anio_fundacion` int(11) DEFAULT 2017,
  `whatsapp` varchar(50) DEFAULT NULL,
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `configuracion_empresa`
--

INSERT INTO `configuracion_empresa` (`id`, `nombre`, `nombre_corto`, `ruc`, `telefono`, `correo`, `direccion`, `descripcion`, `anio_fundacion`, `whatsapp`, `creado_en`) VALUES
(1, 'Constructora Guerrero U Guconst Cia. Ltda.', 'GUCONST', '0190440184001', '+593 991584907', 'auxiliar18@hotmai.com', 'Ecuador', 'Empresa ecuatoriana especializada en construcción de obras de ingeniería civil y alquiler de maquinaria pesada. Comprometidos con calidad, seguridad y cumplimiento de plazos.', 2017, '593991584907', '2026-07-20 01:01:14');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `maquinaria`
--

CREATE TABLE `maquinaria` (
  `id` int(11) NOT NULL,
  `nombre` varchar(200) NOT NULL,
  `tipo` varchar(100) DEFAULT NULL,
  `marca` varchar(100) DEFAULT NULL,
  `modelo` varchar(100) DEFAULT NULL,
  `potencia` varchar(100) DEFAULT NULL,
  `peso` varchar(100) DEFAULT NULL,
  `categoria` varchar(100) DEFAULT NULL,
  `descripcion` text DEFAULT NULL,
  `imagen_url` text DEFAULT NULL,
  `disponible` tinyint(1) DEFAULT 1,
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `maquinaria`
--

INSERT INTO `maquinaria` (`id`, `nombre`, `tipo`, `marca`, `modelo`, `potencia`, `peso`, `categoria`, `descripcion`, `imagen_url`, `disponible`, `creado_en`) VALUES
(1, 'Excavadora Hidráulica', 'Excavadora', 'Caterpillar', '320 GC', '103 kW (138 HP)', '20.300 kg', 'Excavación', 'Excavadora de última generación ideal para movimiento de tierras, excavaciones profundas y trabajos en espacios reducidos.', 'https://s7d2.scene7.com/is/image/Caterpillar/CM20170417-45965-15360?$hero-cc-t1$', 1, '2026-07-20 01:01:16'),
(2, 'Retroexcavadora', 'Retroexcavadora', 'JCB', '3CX Pro', '74 kW (99 HP)', '8.560 kg', 'Excavación', 'Versátil retroexcavadora para trabajos de excavación, carga y transporte de materiales en obras civiles.', 'https://www.lectura-specs.es/models/renamed/detail_max_retina/retrocargadoras-3cx-pro-jcb.jpg', 1, '2026-07-20 01:01:16'),
(3, 'Volquete de Obra', 'Volquete', 'Hino', 'FM500 8x4', '235 kW (315 HP)', '13.800 kg', 'Transporte', 'Volquete de alta capacidad para transporte de áridos, escombros y tierra en proyectos viales y de construcción.', 'https://www.teojama.com/wp-content/uploads/2026/03/VOLQUETA_2735_FM2PL7D-SG3.jpg', 1, '2026-07-20 01:01:16'),
(4, 'Motoniveladora', 'Motoniveladora', 'Komatsu', 'GD555-5', '138 kW (185 HP)', '17.500 kg', 'Nivelación', 'Motoniveladora de alta precisión para nivelación de terrenos, construcción y mantenimiento de vías y carreteras.', 'https://www.lectura-specs.es/models/renamed/detail_max_retina/motoniveladoras-gd555-5-komatsu.jpg', 1, '2026-07-20 01:01:16'),
(5, 'Rodillo Compactador', 'Rodillo', 'Dynapac', 'CA250D', '89 kW (120 HP)', '9.800 kg', 'Compactación', 'Rodillo vibratorio de doble tambor para compactación de asfalto, suelos granulares y bases de carreteras.', 'https://www.lectura-specs.es/models/renamed/detail_max_retina/rodillos-vibrantes-autopropulsados-ca-250-pd-dynapac(4).jpg', 1, '2026-07-20 01:01:16'),
(6, 'Bulldozer', 'Bulldozer', 'Caterpillar', 'D6T XL', '154 kW (206 HP)', '22.000 kg', 'Movimiento de Tierras', 'Bulldozer de alta potencia para empuje de tierra, desbroce, apertura de vías y movimiento masivo de materiales.', 'https://s7d2.scene7.com/is/image/Caterpillar/CM20161114-35295-08363?$hero-cc-t1$', 0, '2026-07-20 01:01:16'),
(7, 'Cargadora Frontal', 'Cargadora', 'Komatsu', 'WA380-8', '140 kW (188 HP)', '16.700 kg', 'Carga y Transporte', 'Cargadora frontal para carga y descarga de materiales, alimentación de trituradoras y operaciones en cantera.', 'https://khsamgwebpro.blob.core.windows.net/wp-content/uploads/2018/10/23210906/WA380-6b1.jpg', 1, '2026-07-20 01:01:16'),
(8, 'Grúa Hidráulica Móvil', 'Grúa', 'Grove', 'RT760E', '224 kW (300 HP)', '36.000 kg', 'Izaje', 'Grúa todoterreno de 60 toneladas para izaje de estructuras metálicas, prefabricados y equipos pesados en obra.', 'https://www.lectura-specs.es/models/renamed/detail_max_retina/gruas-rt-rt-760-e-grove.jpg', 1, '2026-07-20 01:01:16');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `mensajes_contacto`
--

CREATE TABLE `mensajes_contacto` (
  `id` int(11) NOT NULL,
  `nombres_completos` varchar(200) NOT NULL,
  `correo` varchar(100) NOT NULL,
  `telefono` varchar(50) DEFAULT NULL,
  `provincia` varchar(100) DEFAULT NULL,
  `ciudad` varchar(100) DEFAULT NULL,
  `asunto` varchar(200) DEFAULT NULL,
  `mensaje` text DEFAULT NULL,
  `leido` tinyint(1) DEFAULT 0,
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `proforma_maquinaria`
--

CREATE TABLE `proforma_maquinaria` (
  `id` int(11) NOT NULL,
  `proforma_id` varchar(25) NOT NULL,
  `maquinaria_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `proyectos`
--

CREATE TABLE `proyectos` (
  `id` int(11) NOT NULL,
  `nombre` varchar(200) NOT NULL,
  `ubicacion` varchar(200) DEFAULT NULL,
  `anio` int(11) DEFAULT NULL,
  `categoria` varchar(100) DEFAULT NULL,
  `descripcion` text DEFAULT NULL,
  `imagen_url` text DEFAULT NULL,
  `cliente` varchar(200) DEFAULT NULL,
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `proyectos`
--

INSERT INTO `proyectos` (`id`, `nombre`, `ubicacion`, `anio`, `categoria`, `descripcion`, `imagen_url`, `cliente`, `creado_en`) VALUES
(1, 'Construcción de Puente Vehicular', 'Esmeraldas', 2023, 'Ingeniería Civil', 'Construcción de puente vehicular de 80 metros sobre el río Esmeraldas, capacidad 40 toneladas.', 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=700&h=500&fit=crop&auto=format', 'Municipio de Esmeraldas', '2026-07-20 01:01:16'),
(2, 'Rehabilitación Vial Quinindé–La Unión', 'Esmeraldas', 2022, 'Vialidad', 'Rehabilitación de 35 km de vía secundaria: subbase, base granular y capa de rodadura asfáltica.', 'https://images.unsplash.com/photo-1590496793929-36417d3117de?w=700&h=500&fit=crop&auto=format', 'Gobierno Provincial de Esmeraldas', '2026-07-20 01:01:16'),
(3, 'Sistema de Alcantarillado Pluvial', 'Ibarra, Imbabura', 2023, 'Ingeniería Civil', 'Instalación de red de alcantarillado pluvial de 4.2 km con pozos de revisión y colectores principales.', 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=700&h=500&fit=crop&auto=format', 'GAD Municipal de Ibarra', '2026-07-20 01:01:16'),
(4, 'Plataforma Industrial Palmicultora', 'Santo Domingo de los Tsáchilas', 2022, 'Movimiento de Tierras', 'Preparación de plataforma de 12 hectáreas para instalación de planta extractora de aceite de palma.', 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=700&h=500&fit=crop&auto=format', 'Palmeras del Ecuador S.A.', '2026-07-20 01:01:16'),
(5, 'Movimiento de Tierras Minero', 'Zamora Chinchipe', 2021, 'Movimiento de Tierras', 'Movimiento de 250.000 m³ para apertura de acceso a concesión minera en zona de alta pendiente.', 'https://images.unsplash.com/photo-1544979590-37e9b47eb705?w=700&h=500&fit=crop&auto=format', 'Minería Austral S.A.', '2026-07-20 01:01:16'),
(6, 'Mejoramiento Vía de Acceso Comunal', 'Pichincha', 2024, 'Vialidad', 'Mejoramiento de 8 km de vía comunal con subbase compactada y obras de drenaje lateral.', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=700&h=500&fit=crop&auto=format', 'Comunidad San Pedro de Amaguaña', '2026-07-20 01:01:16');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `solicitudes_proforma`
--

CREATE TABLE `solicitudes_proforma` (
  `id` varchar(25) NOT NULL,
  `nombres_completos` varchar(200) NOT NULL,
  `correo` varchar(100) NOT NULL,
  `telefono` varchar(50) DEFAULT NULL,
  `provincia` varchar(100) DEFAULT NULL,
  `ciudad` varchar(100) DEFAULT NULL,
  `mensaje` text DEFAULT NULL,
  `estado` enum('pendiente','atendida','rechazada') DEFAULT 'pendiente',
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `administradores`
--
ALTER TABLE `administradores`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `correo` (`correo`);

--
-- Indices de la tabla `configuracion_empresa`
--
ALTER TABLE `configuracion_empresa`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `maquinaria`
--
ALTER TABLE `maquinaria`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `mensajes_contacto`
--
ALTER TABLE `mensajes_contacto`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `proforma_maquinaria`
--
ALTER TABLE `proforma_maquinaria`
  ADD PRIMARY KEY (`id`),
  ADD KEY `proforma_id` (`proforma_id`),
  ADD KEY `maquinaria_id` (`maquinaria_id`);

--
-- Indices de la tabla `proyectos`
--
ALTER TABLE `proyectos`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `solicitudes_proforma`
--
ALTER TABLE `solicitudes_proforma`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `administradores`
--
ALTER TABLE `administradores`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `configuracion_empresa`
--
ALTER TABLE `configuracion_empresa`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `maquinaria`
--
ALTER TABLE `maquinaria`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `mensajes_contacto`
--
ALTER TABLE `mensajes_contacto`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `proforma_maquinaria`
--
ALTER TABLE `proforma_maquinaria`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `proyectos`
--
ALTER TABLE `proyectos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `proforma_maquinaria`
--
ALTER TABLE `proforma_maquinaria`
  ADD CONSTRAINT `proforma_maquinaria_ibfk_1` FOREIGN KEY (`proforma_id`) REFERENCES `solicitudes_proforma` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `proforma_maquinaria_ibfk_2` FOREIGN KEY (`maquinaria_id`) REFERENCES `maquinaria` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
