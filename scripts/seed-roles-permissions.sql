-- =========================================================
-- SEED DE ROLES Y PERMISOS (idempotente: se puede correr varias veces)
-- Requiere haber corrido antes script_horario.sql
-- =========================================================

-- ---------------------------------------------------------
-- ROLES
-- ---------------------------------------------------------
INSERT INTO roles (name, description, is_active) VALUES
    ('admin',   'Administrador del sistema', TRUE),
    ('docente', 'Docente (solo lectura)',    TRUE)
ON CONFLICT DO NOTHING;

-- ---------------------------------------------------------
-- PERMISOS (el code es el que se usa en @Permissions(...))
-- ---------------------------------------------------------
INSERT INTO permissions (name, code) VALUES
    ('Crear roles',                 'roles.create'),
    ('Ver roles',                   'roles.read'),
    ('Editar/activar roles',        'roles.update'),
    ('Asignar permisos a roles',    'roles.assign_permission'),
    ('Crear permisos',              'permissions.create'),
    ('Ver permisos',                'permissions.read'),
    ('Editar permisos',             'permissions.update'),
    ('Crear usuarios',              'users.create'),
    ('Ver usuarios',                'users.read'),
    ('Editar usuarios',             'users.update'),
    ('Eliminar usuarios',           'users.delete'),
    ('Asignar rol a usuarios',      'users.assign_role'),
    ('Crear planes de estudio',     'study-plans.create'),
    ('Ver planes de estudio',       'study-plans.read'),
    ('Editar planes de estudio',    'study-plans.update'),
    ('Eliminar planes de estudio',  'study-plans.delete'),
    ('Crear materias',              'subjects.create'),
    ('Ver materias',                'subjects.read'),
    ('Editar materias',             'subjects.update'),
    ('Eliminar materias',           'subjects.delete'),
    ('Crear carreras',              'degrees.create'),
    ('Ver carreras',                'degrees.read'),
    ('Editar carreras',             'degrees.update'),
    ('Eliminar carreras',           'degrees.delete'),
    ('Crear ciclos lectivos',          'academic-cycles.create'),
    ('Ver ciclos lectivos',            'academic-cycles.read'),
    ('Editar ciclos lectivos',         'academic-cycles.update'),
    ('Eliminar ciclos lectivos',       'academic-cycles.delete'),
    ('Crear horas cátedra',            'class-hours.create'),
    ('Ver horas cátedra',              'class-hours.read'),
    ('Editar horas cátedra',           'class-hours.update'),
    ('Eliminar horas cátedra',         'class-hours.delete'),
    ('Crear cursos/división',          'course-sections.create'),
    ('Ver cursos/división',            'course-sections.read'),
    ('Editar cursos/división',         'course-sections.update'),
    ('Eliminar cursos/división',       'course-sections.delete'),
    ('Crear tipos de cargo',           'position-types.create'),
    ('Ver tipos de cargo',             'position-types.read'),
    ('Editar tipos de cargo',          'position-types.update'),
    ('Eliminar tipos de cargo',        'position-types.delete'),
    ('Crear regímenes',                'regimes.create'),
    ('Ver regímenes',                  'regimes.read'),
    ('Editar regímenes',               'regimes.update'),
    ('Eliminar regímenes',             'regimes.delete'),
    ('Crear horarios',                 'schedules.create'),
    ('Ver horarios',                   'schedules.read'),
    ('Editar horarios',                'schedules.update'),
    ('Eliminar horarios',              'schedules.delete'),
    ('Crear cuatrimestres',            'semesters.create'),
    ('Ver cuatrimestres',              'semesters.read'),
    ('Editar cuatrimestres',           'semesters.update'),
    ('Eliminar cuatrimestres',         'semesters.delete'),
    ('Crear turnos',                   'shifts.create'),
    ('Ver turnos',                     'shifts.read'),
    ('Editar turnos',                  'shifts.update'),
    ('Eliminar turnos',                'shifts.delete'),
    ('Crear planes por ciclo lectivo',    'study-plan-academic-cycles.create'),
    ('Ver planes por ciclo lectivo',      'study-plan-academic-cycles.read'),
    ('Editar planes por ciclo lectivo',   'study-plan-academic-cycles.update'),
    ('Eliminar planes por ciclo lectivo', 'study-plan-academic-cycles.delete'),
    ('Crear asignaciones docentes',       'teacher-assignments.create'),
    ('Ver asignaciones docentes',         'teacher-assignments.read'),
    ('Editar asignaciones docentes',      'teacher-assignments.update'),
    ('Eliminar asignaciones docentes',    'teacher-assignments.delete'),
    ('Crear docentes',                    'teachers.create'),
    ('Ver docentes',                      'teachers.read'),
    ('Editar docentes',                   'teachers.update'),
    ('Eliminar docentes',                 'teachers.delete')
ON CONFLICT DO NOTHING;
-- ---------------------------------------------------------
-- ROLES_PERMISSIONS
-- ---------------------------------------------------------
-- admin tiene TODOS los permisos
INSERT INTO roles_permissions (role_id, permission_id)
SELECT r.role_id, p.permission_id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'admin'
ON CONFLICT DO NOTHING;

-- docente solo puede ver roles y permisos
INSERT INTO roles_permissions (role_id, permission_id)
SELECT r.role_id, p.permission_id
FROM roles r
JOIN permissions p ON p.code IN ('roles.read', 'permissions.read')
WHERE r.name = 'docente'
ON CONFLICT DO NOTHING;

-- El rol admin y su asignacion al primer usuario los crea el SeederModule
-- (src/modules/seeder) al arrancar la app. Este script no los duplica.
