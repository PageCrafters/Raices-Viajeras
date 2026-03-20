-- Inserciones de prueba: 5 provincias y 2-3 viajes por provincia
START TRANSACTION;

-- Las provincias se dejan sin imagen propia para que el frontend use el logo por defecto.
INSERT INTO `provincia` (`id`, `nombre`, `descripcion`, `imagen`) VALUES
(1, 'Granada', 'Paisajes de montana, pueblos blancos y patrimonio nazari.', NULL),
(2, 'Girona', 'Costas, senderos y patrimonio medieval en la region de Cataluna.', NULL),
(3, 'Cadiz', 'Playas, historia marinera y pueblos con encanto en el sur.', NULL),
(4, 'Asturias', 'Costa y montanas verdes, sidra y rutas naturales.', NULL),
(5, 'Lugo', 'Riqueza natural y romanico en el norte de Galicia.', NULL);

INSERT INTO `viajes` (`id`, `titulo`, `descripcion`, `origen`, `fecha_inicio`, `fecha_fin`, `precio`, `plazas`, `creado_por`, `provincia_id`) VALUES
(1, 'Ruta por la Alhambra y Albaicin', 'Visita guiada a la Alhambra y paseo por el Albaicin con miradores historicos.', 'Granada', '2026-06-10', '2026-06-11', 95.00, 20, 1, 1),
(2, 'Senderismo en Sierra Nevada', 'Excursion de dos dias por senderos protegidos y flora endemica.', 'Granada', '2026-07-05', '2026-07-07', 150.00, 12, 1, 1),
(3, 'Paseo medieval por Girona', 'Recorrido por el barrio judio, la catedral y las murallas con guia local.', 'Girona', '2026-05-20', '2026-05-20', 45.00, 25, 1, 2),
(4, 'Costa Brava: calas y patrimonio', 'Dia de excursion por calas escondidas y pueblos costeros.', 'Girona', '2026-08-15', '2026-08-16', 120.00, 18, 1, 2),
(5, 'Tarde de tapas y flamenco en Cadiz', 'Experiencia gastronomica y espectaculo en tablao local.', 'Cadiz', '2026-06-18', '2026-06-18', 60.00, 30, 1, 3),
(6, 'Rutas costeras de Cadiz', 'Excursion por acantilados y playas naturales con guia.', 'Cadiz', '2026-09-10', '2026-09-12', 130.00, 16, 1, 3),
(7, 'Picos y sidra: escapada asturiana', 'Fin de semana de senderismo y cata de sidra en llagar tradicional.', 'Asturias', '2026-07-22', '2026-07-24', 180.00, 14, 1, 4),
(8, 'Rutas verdes por la costa asturiana', 'Paseos por senderos costeros y visita a playas virgenes.', 'Asturias', '2026-08-05', '2026-08-06', 85.00, 20, 1, 4),
(9, 'Camino de la Muralla en Lugo', 'Recorrido por el casco historico y paseos por la muralla romana.', 'Lugo', '2026-06-30', '2026-07-01', 70.00, 22, 1, 5),
(10, 'Naturaleza y rios de Lugo', 'Excursion por espacios naturales y rutas fluviales.', 'Lugo', '2026-09-01', '2026-09-03', 140.00, 15, 1, 5);

INSERT INTO `noticias` (`id`, `nombre`, `descripcion`, `categoria`, `imagen`) VALUES
(1, 'Feria internacional FITUR y turismo sostenible', 'La feria internacional de turismo FITUR 2026, celebrada en Madrid, reunio a gobiernos, empresas y expertos para debatir el futuro del turismo. Uno de los temas principales fue impulsar un modelo turistico mas sostenible. Durante el evento se propusieron medidas como reducir el impacto ambiental del transporte, promover alojamientos ecologicos y evitar la masificacion de destinos turisticos. La feria conto con mas de 255000 visitantes y genero un impacto economico de unos 505 millones de euros, lo que demuestra su importancia para el sector turistico internacional.', 'Turismo', 'energiaybiodibersidad.webp'),
(2, 'Europa impulsa politicas de viajes mas ecologicos', 'Varios paises europeos estan promoviendo politicas para hacer el turismo mas sostenible. Estas medidas incluyen fomentar el uso del tren o transporte publico en lugar de vuelos cortos, apoyar hoteles con certificaciones ecologicas y proteger los ecosistemas en los destinos turisticos. Ademas, la Union Europea esta preparando una nueva estrategia de turismo sostenible que busca equilibrar el crecimiento economico del turismo con la proteccion del medio ambiente y las comunidades locales.', 'Sostenible', 'renobable.webp'),
(3, 'Nuevos destinos de ecoturismo en Africa', 'En Africa tambien estan surgiendo nuevos destinos que apuestan por el turismo sostenible. Las Malawi Highlands, una region montanosa del sureste de Africa, se estan posicionando como destino internacional de aventura y ecoturismo. Los proyectos turisticos de la region buscan conservar ecosistemas naturales, apoyar a las comunidades locales y promover actividades de bajo impacto ambiental. Entre las actividades mas populares destacan el senderismo en reservas naturales, el turismo comunitario, la observacion de fauna y los programas de conservacion ambiental.', 'Turismo', 'malawi.webp');

COMMIT;

-- Notas: las rutas usan imagenes ya presentes en web/img.
