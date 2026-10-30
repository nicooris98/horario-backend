-- =========================================================
-- Fixture de integración — Validación de superposición
-- 7 franjas de 40 min (19:00–23:40), según M1 · RN-08
-- Requiere: esquema base ya ejecutado en la base de test
-- =========================================================

-- 0) LIMPIEZA (orden inverso de FK)
TRUNCATE TABLE horario, asignacion_docente,
  espacio_curricular_curso_division, curso_division,
  plan_estudio_ciclo_lectivo, espacio_curricular,
  plan_estudio, docente, hora_catedra, dia,
  cuatrimestre, turno, ciclo_lectivo, regimen, carrera
  RESTART IDENTITY CASCADE;

-- 1) CATÁLOGOS
INSERT INTO "carrera" ("id_carrera","nombre") VALUES
(1, 'Tecnicatura Superior en Desarrollo de Software'),
(2, 'Tecnicatura Superior en Administración'),
(3, 'Tecnicatura Superior en Recursos Humanos');

INSERT INTO "regimen" ("id_regimen","nombre") VALUES
(1, 'Cuatrimestral'),
(2, 'Anual');

INSERT INTO "ciclo_lectivo" ("id_ciclo_lectivo","anio","fecha_inicio","fecha_fin","estado") VALUES
(1, 2025, '2025-03-01','2025-12-15','INACTIVO'),
(2, 2026, '2026-03-01','2026-12-15','ACTIVO');

INSERT INTO "turno" ("id_turno","nombre","hora_inicio","hora_fin","estado") VALUES
(1, 'Nocturno',   '19:00','23:40','ACTIVO'),
(2, 'Vespertino', '14:00','18:00','ACTIVO');

INSERT INTO "cuatrimestre" ("id_cuatrimestre","nombre","numero","fecha_desde","fecha_hasta") VALUES
(1, '1° Cuatrimestre 2025', 1, '2025-03-15','2025-06-30'),
(2, '2° Cuatrimestre 2025', 2, '2025-08-01','2025-11-30'),
(3, '1° Cuatrimestre 2026', 1, '2026-03-15','2026-06-30'),
(4, '2° Cuatrimestre 2026', 2, '2026-08-01','2026-11-30');

INSERT INTO "dia" ("id_dia","nombre") VALUES
(1,'Lunes'),(2,'Martes'),(3,'Miércoles'),(4,'Jueves'),(5,'Viernes');

-- 7 franjas de 40 min (19:00–23:40)
INSERT INTO "hora_catedra" ("id_hora_catedra","numero_franja","hora_desde","hora_hasta") VALUES
(1, 1, '19:00','19:40'),
(2, 2, '19:40','20:20'),
(3, 3, '20:20','21:00'),
(4, 4, '21:00','21:40'),
(5, 5, '21:40','22:20'),
(6, 6, '22:20','23:00'),
(7, 7, '23:00','23:40');

-- tipo_cargo ya cargado por el esquema base:
--   1 = Interino | 2 = A término | 3 = Suplente

-- 2) PLANES DE ESTUDIO
INSERT INTO "plan_estudio"
("id_plan_estudio","id_carrera","nombre","anio_vigencia","fecha_desde","fecha_hasta","estado","cantidad_anios") VALUES
(1, 1, 'Plan 2024 TDS',   2024, '2024-03-01', NULL, 'ACTIVO', 3),
(2, 2, 'Plan 2024 TA',    2024, '2024-03-01', NULL, 'ACTIVO', 3),
(3, 3, 'Plan 2024 TRRHH', 2024, '2024-03-01', NULL, 'ACTIVO', 3);

-- 3) ESPACIOS CURRICULARES
INSERT INTO "espacio_curricular"
("id_espacio_curricular","id_plan_estudio","id_regimen","nombre","anio_cursado",
 "horas_semanales","permite_multiple_docente","max_docentes","estado") VALUES
(1, 1, 1, 'Programación I',    1, 4, FALSE, 1, 'ACTIVO'),
(2, 1, 1, 'Matemática I',      1, 4, FALSE, 1, 'ACTIVO'),
(3, 1, 1, 'Base de Datos I',   1, 4, FALSE, 1, 'ACTIVO'),
(4, 1, 1, 'Programación II',   2, 4, FALSE, 1, 'ACTIVO'),
(5, 1, 1, 'Base de Datos II',  2, 4, FALSE, 1, 'ACTIVO'),
(6, 2, 1, 'Contabilidad I',    1, 4, FALSE, 1, 'ACTIVO'),
(7, 2, 1, 'Administración I',  1, 4, FALSE, 1, 'ACTIVO'),
(8, 2, 1, 'Contabilidad II',   2, 4, FALSE, 1, 'ACTIVO'),
(9, 2, 1, 'Administración II', 2, 4, FALSE, 1, 'ACTIVO'),
(10,3, 1, 'Gestión de Personal I', 1, 4, FALSE, 1, 'ACTIVO'),
(11,3, 1, 'Legislación Laboral',   1, 4, FALSE, 1, 'ACTIVO'),
(12,3, 1, 'Gestión de Personal II',2, 4, TRUE,  2, 'ACTIVO');

-- 4) PECL
INSERT INTO "plan_estudio_ciclo_lectivo"
("id_plan_estudio_ciclo_lectivo","id_plan_estudio","id_ciclo_lectivo","id_turno") VALUES
(1, 1, 2, 1),
(2, 2, 2, 1),
(3, 3, 2, 1),
(4, 1, 1, 1);

-- 5) CURSOS / DIVISIONES
INSERT INTO "curso_division"
("id_curso_division","id_plan_estudio_ciclo_lectivo","anio_cursado","division","estado") VALUES
(1, 1, 1, 'A', 'ACTIVO'),
(2, 1, 2, 'A', 'ACTIVO'),
(3, 2, 1, 'A', 'ACTIVO'),
(4, 2, 2, 'A', 'ACTIVO'),
(5, 3, 1, 'A', 'ACTIVO'),
(6, 3, 2, 'A', 'ACTIVO'),
(7, 4, 1, 'A', 'ACTIVO'),
(8, 3, 1, 'B', 'ACTIVO');

-- 6) ECCD
INSERT INTO "espacio_curricular_curso_division"
("id_espacio_curricular_curso_division","id_curso_division","id_espacio_cursado","estado") VALUES
(1,  1, 1,  'ACTIVO'),
(2,  1, 2,  'ACTIVO'),
(3,  1, 3,  'ACTIVO'),
(4,  2, 4,  'ACTIVO'),
(5,  2, 5,  'ACTIVO'),
(6,  3, 6,  'ACTIVO'),
(7,  3, 7,  'ACTIVO'),
(8,  4, 8,  'ACTIVO'),
(9,  4, 9,  'ACTIVO'),
(10, 5, 10, 'ACTIVO'),
(11, 5, 11, 'ACTIVO'),
(12, 6, 12, 'ACTIVO'),
(13, 7, 1,  'ACTIVO'),
(14, 8, 10, 'ACTIVO');

-- 7) DOCENTES
INSERT INTO "docente"
("id_docente","dni","nombre","apellido","telefono","email","legajo","estado") VALUES
(1,'20111111','Ana',   'Pérez',   '11-1111-1111','ana.perez@inst.edu',   1001,'ACTIVO'),
(2,'20222222','Bruno', 'Gómez',   '11-2222-2222','bruno.gomez@inst.edu', 1002,'ACTIVO'),
(3,'20333333','Carla', 'Ruiz',    '11-3333-3333','carla.ruiz@inst.edu',  1003,'ACTIVO'),
(4,'20444444','Diego', 'Sosa',    '11-4444-4444','diego.sosa@inst.edu',  1004,'ACTIVO'),
(5,'20555555','Elena', 'Martínez','11-5555-5555','elena.martinez@inst.edu',1005,'ACTIVO'),
(6,'20666666','Franco','López',   '11-6666-6666','franco.lopez@inst.edu', 1006,'ACTIVO');

-- 8) ASIGNACIONES DOCENTES
INSERT INTO "asignacion_docente"
("id_asignacion_docente","id_espacio_curricular_curso_division","id_tipo_cargo",
 "id_docente","id_asignacion_titular","horas_semanales","fecha_desde","fecha_hasta") VALUES
(1,  1,  1, 1, NULL, 4, '2026-03-01','2026-12-15'),
(2,  2,  1, 3, NULL, 4, '2026-03-01','2026-12-15'),
(3,  3,  1, 2, NULL, 4, '2026-03-01','2026-12-15'),
(4,  4,  1, 1, NULL, 4, '2026-03-01','2026-12-15'),
(5,  5,  1, 2, NULL, 4, '2026-03-01','2026-12-15'),
(6,  6,  1, 4, NULL, 4, '2026-03-01','2026-12-15'),
(7,  7,  1, 4, NULL, 4, '2026-03-01','2026-12-15'),
(8,  8,  1, 4, NULL, 4, '2026-03-01','2026-12-15'),
(9,  9,  1, 3, NULL, 4, '2026-03-01','2026-12-15'),
(10, 10, 1, 5, NULL, 4, '2026-03-01','2026-12-15'),
(11, 11, 1, 5, NULL, 4, '2026-03-01','2026-12-15'),
(12, 12, 1, 5, NULL, 4, '2026-03-01','2026-12-15'),
(13, 13, 1, 1, NULL, 4, '2025-03-01','2025-12-15'),
(14, 1,  3, 6, 1,    4, '2026-05-01','2026-06-30'),
(15, 14, 1, 6, NULL, 4, '2026-03-01','2026-12-15'),
(16, 12, 1, 6, NULL, 4, '2026-03-01','2026-12-15');

-- 9) HORARIOS (23 registros, franjas 1-4 de 40 min)
INSERT INTO "horario"
("id_horario","id_cursado","id_cuatrimestre","id_hora_catedra","id_dia",
 "fecha_desde","fecha_hasta") VALUES
-- VÁLIDOS BASELINE
(1,  1, 3, 1, 1, '2026-03-15','2026-06-30'),
(2,  4, 3, 1, 2, '2026-03-15','2026-06-30'),
(3,  1, 3, 2, 1, '2026-03-15','2026-06-30'),
(4,  3, 3, 2, 3, '2026-03-15','2026-06-30'),
(6,  6, 3, 3, 4, '2026-03-15','2026-06-30'),
(7,  2, 3, 4, 5, '2026-03-15','2026-06-30'),
(8,  10,3, 1, 1, '2026-03-15','2026-06-30'),
(10, 7, 3, 3, 1, '2026-03-15','2026-06-30'),
-- VÁLIDOS TRAMPA
(5,  5, 4, 2, 3, '2026-08-01','2026-11-30'),
(9,  13,1, 1, 1, '2025-03-15','2025-06-30'),
(18, 4, 4, 1, 1, '2026-08-01','2026-11-30'),
(19, 5, 4, 2, 2, '2026-08-01','2026-11-30'),
-- CONFLICTOS DIRECTOS
(11, 4, 3, 1, 1, '2026-03-15','2026-06-30'),
(12, 5, 3, 2, 3, '2026-03-15','2026-06-30'),
(13, 7, 3, 3, 4, '2026-03-15','2026-06-30'),
(14, 8, 3, 3, 4, '2026-03-15','2026-06-30'),
(16, 9, 3, 4, 5, '2026-03-15','2026-06-30'),
(17, 11,3, 1, 1, '2026-03-15','2026-06-30'),
-- ESPECIALES
(15, 1, 3, 1, 1, '2026-03-15','2026-06-30'),
(20, 14,3, 1, 1, '2026-03-15','2026-06-30'),
(21, 4, 3, 2, 1, '2026-05-01','2026-06-30'),
(22, 12,3, 1, 2, '2026-03-15','2026-06-30'),
(23, 14,3, 1, 2, '2026-03-15','2026-06-30');

-- 10) RESET DE SEQUENCES
SELECT setval(pg_get_serial_sequence('"carrera"', 'id_carrera'),                          (SELECT MAX(id_carrera) FROM "carrera"));
SELECT setval(pg_get_serial_sequence('"regimen"', 'id_regimen'),                          (SELECT MAX(id_regimen) FROM "regimen"));
SELECT setval(pg_get_serial_sequence('"ciclo_lectivo"', 'id_ciclo_lectivo'),              (SELECT MAX(id_ciclo_lectivo) FROM "ciclo_lectivo"));
SELECT setval(pg_get_serial_sequence('"turno"', 'id_turno'),                              (SELECT MAX(id_turno) FROM "turno"));
SELECT setval(pg_get_serial_sequence('"cuatrimestre"', 'id_cuatrimestre'),                (SELECT MAX(id_cuatrimestre) FROM "cuatrimestre"));
SELECT setval(pg_get_serial_sequence('"dia"', 'id_dia'),                                  (SELECT MAX(id_dia) FROM "dia"));
SELECT setval(pg_get_serial_sequence('"hora_catedra"', 'id_hora_catedra'),                (SELECT MAX(id_hora_catedra) FROM "hora_catedra"));
SELECT setval(pg_get_serial_sequence('"plan_estudio"', 'id_plan_estudio'),                (SELECT MAX(id_plan_estudio) FROM "plan_estudio"));
SELECT setval(pg_get_serial_sequence('"espacio_curricular"', 'id_espacio_curricular'),    (SELECT MAX(id_espacio_curricular) FROM "espacio_curricular"));
SELECT setval(pg_get_serial_sequence('"plan_estudio_ciclo_lectivo"', 'id_plan_estudio_ciclo_lectivo'), (SELECT MAX(id_plan_estudio_ciclo_lectivo) FROM "plan_estudio_ciclo_lectivo"));
SELECT setval(pg_get_serial_sequence('"curso_division"', 'id_curso_division'),            (SELECT MAX(id_curso_division) FROM "curso_division"));
SELECT setval(pg_get_serial_sequence('"espacio_curricular_curso_division"', 'id_espacio_curricular_curso_division'), (SELECT MAX(id_espacio_curricular_curso_division) FROM "espacio_curricular_curso_division"));
SELECT setval(pg_get_serial_sequence('"docente"', 'id_docente'),                          (SELECT MAX(id_docente) FROM "docente"));
SELECT setval(pg_get_serial_sequence('"asignacion_docente"', 'id_asignacion_docente'),    (SELECT MAX(id_asignacion_docente) FROM "asignacion_docente"));
SELECT setval(pg_get_serial_sequence('"horario"', 'id_horario'),                          (SELECT MAX(id_horario) FROM "horario"));