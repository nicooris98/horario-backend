INSERT INTO roles (name, description, is_active)
SELECT 'admin', 'Administrador del sistema', TRUE
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'admin');

INSERT INTO roles_users (user_id, role_id)
SELECT u.user_id, r.role_id
FROM users u
JOIN roles r ON r.name = 'admin'
WHERE u.user_id = (SELECT MIN(user_id) FROM users)
  AND NOT EXISTS (
    SELECT 1
    FROM roles_users ru
    WHERE ru.user_id = u.user_id
      AND ru.role_id = r.role_id
  );
