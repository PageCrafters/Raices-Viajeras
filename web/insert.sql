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

COMMIT;

-- Notas: las rutas usan imágenes ya presentes en web/img.
