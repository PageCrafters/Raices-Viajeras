-- Inserciones de prueba: 5 provincias y 2-3 viajes por provincia
START TRANSACTION;

INSERT INTO `provincia` (`id`, `nombre`, `descripcion`) VALUES
(1, 'Granada', 'Paisajes de montaña, pueblos blancos y patrimonio nazarí.'),
(2, 'Girona', 'Costas, senderos y patrimonio medieval en la región de Cataluña.'),
(3, 'Cádiz', 'Playas, historia marinera y pueblos con encanto en el sur.'),
(4, 'Asturias', 'Costa y montañas verdes, sidra y rutas naturales.'),
(5, 'Lugo', 'Riqueza natural y románico en el norte de Galicia.');

INSERT INTO `viajes` (`id`, `titulo`, `descripcion`, `origen`, `fecha_inicio`, `fecha_fin`, `precio`, `plazas`, `creado_por`, `provincia_id`) VALUES
(1, 'Ruta por la Alhambra y Albaicín', 'Visita guiada a la Alhambra + paseo por el Albaicín y miradores históricos.', 'Granada', '2026-06-10', '2026-06-11', 95.00, 20, 1, 1),
(2, 'Senderismo en Sierra Nevada', 'Excursión de dos días por senderos protegidos y flora endémica.', 'Granada', '2026-07-05', '2026-07-07', 150.00, 12, 1, 1),
(3, 'Paseo medieval por Girona', 'Recorrido por el barrio judío, catedral y murallas con guía local.', 'Girona', '2026-05-20', '2026-05-20', 45.00, 25, 1, 2),
(4, 'Costa Brava: calas y patrimonio', 'Día de excursión por calas escondidas y pueblos costeros.', 'Girona', '2026-08-15', '2026-08-16', 120.00, 18, 1, 2),
(5, 'Tarde de tapas y flamenco en Cádiz', 'Experiencia gastronómica y espectáculo en tablao local.', 'Cádiz', '2026-06-18', '2026-06-18', 60.00, 30, 1, 3),
(6, 'Rutas costeras de Cádiz', 'Excursión por acantilados y playas naturales con guía.', 'Cádiz', '2026-09-10', '2026-09-12', 130.00, 16, 1, 3),
(7, 'Picos y sidra: escapada asturiana', 'Fin de semana de senderismo y cata de sidra en llagar tradicional.', 'Asturias', '2026-07-22', '2026-07-24', 180.00, 14, 1, 4),
(8, 'Rutas verdes por la costa asturiana', 'Paseos por senderos costeros y visita a playas vírgenes.', 'Asturias', '2026-08-05', '2026-08-06', 85.00, 20, 1, 4),
(9, 'Camino de la Muralla en Lugo', 'Recorrido por el casco histórico y paseos por la muralla romana.', 'Lugo', '2026-06-30', '2026-07-01', 70.00, 22, 1, 5),
(10, 'Naturaleza y ríos de Lugo', 'Excursión por espacios naturales y rutas fluviales.', 'Lugo', '2026-09-01', '2026-09-03', 140.00, 15, 1, 5);

INSERT INTO `noticias` (`id`, `nombre`, `descripcion`, `categoria`, `imagen`) VALUES
(1, 'Feria internacional FITUR y turismo sostenible', 'La feria internacional de turismo FITUR 2026, celebrada en Madrid, reunió a gobiernos, empresas y expertos para debatir el futuro del turismo. Uno de los temas principales fue impulsar un modelo turístico más sostenible. Durante el evento se propusieron medidas como reducir el impacto ambiental del transporte, promover alojamientos ecológicos y evitar la masificación de destinos turísticos. La feria contó con más de 255.000 visitantes y generó un impacto económico de unos 505 millones de euros, lo que demuestra su importancia para el sector turístico internacional.', 'Turismo', 'energiaybiodibersidad.webp'),
(2, 'Europa impulsa políticas de viajes más ecológicos', 'Varios países europeos están promoviendo políticas para hacer el turismo más sostenible. Estas medidas incluyen fomentar el uso del tren o transporte público en lugar de vuelos cortos, apoyar hoteles con certificaciones ecológicas y proteger los ecosistemas en los destinos turísticos. Además, la Unión Europea está preparando una nueva estrategia de turismo sostenible que busca equilibrar el crecimiento económico del turismo con la protección del medio ambiente y las comunidades locales.', 'Sostenible', 'renobable.webp'),
(3, 'Nuevos destinos de ecoturismo en África', 'En África también están surgiendo nuevos destinos que apuestan por el turismo sostenible. Las Malawi Highlands, una región montañosa del sureste de África, se están posicionando como destino internacional de aventura y ecoturismo.\r\n\r\nUno de los elementos clave es el reconocimiento internacional del Monte Mulanje, un espacio natural con gran biodiversidad que ha recibido protección internacional.\r\n\r\nLos proyectos turísticos de la región buscan:\r\n\r\nconservar ecosistemas naturales\r\n\r\napoyar a las comunidades locales\r\n\r\npromover actividades de bajo impacto ambiental\r\n\r\nEntre las actividades más populares destacan:\r\n\r\nsenderismo en reservas naturales\r\n\r\nturismo comunitario\r\n\r\nobservación de fauna\r\n\r\nprogramas de conservación ambiental\r\n\r\nEste modelo intenta demostrar que el turismo puede generar desarrollo económico sin destruir los recursos naturales.', 'Turismo', 'malawi.webp');

COMMIT;

-- Notas: las rutas usan imágenes ya presentes en web/img.
