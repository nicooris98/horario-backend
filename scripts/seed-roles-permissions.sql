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
    ('Asignar rol a usuarios',      'users.assign_role')
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
