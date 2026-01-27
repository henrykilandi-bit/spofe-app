DELETE FROM users WHERE email = 'admin@spofe.local';
INSERT INTO users (username, email, password, role, is_active, created_at, updated_at) 
VALUES ('admin', 'admin@spofe.local', '$2a$10$x0qH6UVQgB8HeaWE22D55ulcnfYEBjz15L4nc5kAlbhJoqzOSeNc6', 'admin', 1, NOW(), NOW());
SELECT id, username, email, role FROM users WHERE email = 'admin@spofe.local';
