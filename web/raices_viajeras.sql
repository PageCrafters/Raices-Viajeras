-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 11-03-2026 a las 20:23:21
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
-- Base de datos: `raices_viajeras`
--
CREATE DATABASE IF NOT EXISTS raices_viajeras;
USE raices_viajeras;
-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `nombre_completo` varchar(50) NOT NULL,
  `correo` varchar(50) NOT NULL,
  `pwd` varchar(10) NOT NULL,
  `passwordConfirm` varchar(10) NOT NULL,
  `genero` char(1) NOT NULL,
  `fechaNacimiento` date NOT NULL,
  `politica_privacidad` tinyint(1) NOT NULL,
  `revista` tinyint(1) NOT NULL,
  `rememberMe` varchar(32) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id`, `nombre_completo`, `correo`, `pwd`, `passwordConfirm`, `genero`, `fechaNacimiento`, `politica_privacidad`, `revista`) VALUES
(1, 'ana lopez', 'analopez@gmail.com', '1234', '1234', 'm', '2017-03-24', 1, 1);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

-- Tablas añadidas: viajes, carritos, carrito_viajes, pedidos, pedido_viajes

CREATE TABLE `viajes` (
  `id` int(11) NOT NULL,
  `titulo` varchar(150) NOT NULL,
  `descripcion` text,
  `origen` varchar(100) DEFAULT NULL,
  `destino` varchar(100) DEFAULT NULL,
  `fecha_inicio` date DEFAULT NULL,
  `fecha_fin` date DEFAULT NULL,
  `precio` decimal(10,2) NOT NULL DEFAULT '0.00',
  `plazas` int(11) NOT NULL DEFAULT 0,
  `creado_por` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

ALTER TABLE `viajes`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `viajes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

-- Tabla de provincias
CREATE TABLE `provincia` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text,
  `imagen` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

ALTER TABLE `provincia`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `provincia`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

-- Modificar `viajes`: quitar `destino`, añadir `provincia_id` e `imagen`
ALTER TABLE `viajes`
  DROP COLUMN `destino`,
  ADD COLUMN `provincia_id` int(11) DEFAULT NULL,
  ADD COLUMN `imagen` varchar(255) DEFAULT NULL;

ALTER TABLE `viajes`
  ADD KEY `provincia_id_idx` (`provincia_id`);

ALTER TABLE `viajes`
  ADD CONSTRAINT `viajes_ibfk_provincia` FOREIGN KEY (`provincia_id`) REFERENCES `provincia` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE `carritos` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `total` decimal(10,2) NOT NULL DEFAULT '0.00',
  `estado` varchar(20) NOT NULL DEFAULT 'activo',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

ALTER TABLE `carritos`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `carritos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

CREATE TABLE `carrito_viajes` (
  `id` int(11) NOT NULL,
  `carrito_id` int(11) NOT NULL,
  `viaje_id` int(11) NOT NULL,
  `cantidad` int(11) NOT NULL DEFAULT 1,
  `precio_unitario` decimal(10,2) NOT NULL DEFAULT '0.00'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

ALTER TABLE `carrito_viajes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `carrito_id_idx` (`carrito_id`),
  ADD KEY `viaje_id_idx` (`viaje_id`);

ALTER TABLE `carrito_viajes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

CREATE TABLE `pedidos` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `carrito_id` int(11) DEFAULT NULL,
  `total` decimal(10,2) NOT NULL DEFAULT '0.00',
  `estado` varchar(30) NOT NULL DEFAULT 'pendiente',
  `direccion_envio` varchar(255) DEFAULT NULL,
  `fecha_pedido` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

ALTER TABLE `pedidos`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `pedidos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

CREATE TABLE `pedido_viajes` (
  `id` int(11) NOT NULL,
  `pedido_id` int(11) NOT NULL,
  `viaje_id` int(11) NOT NULL,
  `cantidad` int(11) NOT NULL DEFAULT 1,
  `precio_unitario` decimal(10,2) NOT NULL DEFAULT '0.00'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

ALTER TABLE `pedido_viajes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `pedido_id_idx` (`pedido_id`),
  ADD KEY `viaje_id_idx` (`viaje_id`);

ALTER TABLE `pedido_viajes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

CREATE TABLE `noticias` (
    `id` int(11) NOT NULL,
    `nombre` varchar(255) NOT NULL,
    `descripcion` text NOT NULL,
    `categoria` varchar(15) NOT NULL,
    `imagen` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indices de la tabla `noticias`
--
ALTER TABLE `noticias`
    ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `noticias`
--
ALTER TABLE `noticias`
    MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;
COMMIT;

-- Llaves foráneas
ALTER TABLE `carritos`
  ADD KEY `usuario_id_idx` (`usuario_id`),
  ADD CONSTRAINT `carritos_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `carrito_viajes`
  ADD CONSTRAINT `carrito_viajes_ibfk_1` FOREIGN KEY (`carrito_id`) REFERENCES `carritos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `carrito_viajes_ibfk_2` FOREIGN KEY (`viaje_id`) REFERENCES `viajes` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `pedidos`
  ADD KEY `usuario_pedido_idx` (`usuario_id`),
  ADD KEY `carrito_pedido_idx` (`carrito_id`),
  ADD CONSTRAINT `pedidos_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `pedidos_ibfk_2` FOREIGN KEY (`carrito_id`) REFERENCES `carritos` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `pedido_viajes`
  ADD CONSTRAINT `pedido_viajes_ibfk_1` FOREIGN KEY (`pedido_id`) REFERENCES `pedidos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `pedido_viajes_ibfk_2` FOREIGN KEY (`viaje_id`) REFERENCES `viajes` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
