CREATE TABLE IF NOT EXISTS roles (
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_roles_name (name)
);

CREATE TABLE IF NOT EXISTS users (
    id INT NOT NULL AUTO_INCREMENT,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL,
    role_id INT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_deleted TINYINT(1) NOT NULL DEFAULT 0,
    deleted_at DATETIME NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_users_email (email),
    KEY idx_users_role_id (role_id),
    CONSTRAINT fk_users_roles FOREIGN KEY (role_id) REFERENCES roles(id)
);

CREATE TABLE IF NOT EXISTS variables (
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    value VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_variables_name (name)
);

INSERT INTO roles (id, name) VALUES
    (1, 'Admin'),
    (2, 'User')
ON DUPLICATE KEY UPDATE
    name = VALUES(name);

INSERT INTO users (id, full_name, email, role_id, created_at, updated_at, is_deleted, deleted_at) VALUES
    (1, 'Usuario 1', 'u1@test.com', 1, NOW(), NOW(), 0, NULL),
    (2, 'Usuario 2', 'u2@test.com', 2, NOW(), NOW(), 0, NULL),
    (3, 'Usuario 3', 'u3@test.com', 1, NOW(), NOW(), 0, NULL),
    (4, 'Usuario 4', 'u4@test.com', 2, NOW(), NOW(), 0, NULL),
    (5, 'Usuario 5', 'u5@test.com', 1, NOW(), NOW(), 0, NULL),
    (6, 'Usuario 6', 'u6@test.com', 2, NOW(), NOW(), 0, NULL),
    (7, 'Usuario 7', 'u7@test.com', 1, NOW(), NOW(), 0, NULL),
    (8, 'Usuario 8', 'u8@test.com', 2, NOW(), NOW(), 0, NULL),
    (9, 'Usuario 9', 'u9@test.com', 1, NOW(), NOW(), 0, NULL),
    (10, 'Usuario 10', 'u10@test.com', 2, NOW(), NOW(), 0, NULL),
    (11, 'Usuario 11', 'u11@test.com', 1, NOW(), NOW(), 0, NULL),
    (12, 'Usuario 12', 'u12@test.com', 2, NOW(), NOW(), 0, NULL),
    (13, 'Usuario 13', 'u13@test.com', 1, NOW(), NOW(), 0, NULL),
    (14, 'Usuario 14', 'u14@test.com', 2, NOW(), NOW(), 0, NULL),
    (15, 'Usuario 15', 'u15@test.com', 1, NOW(), NOW(), 0, NULL),
    (16, 'Usuario 16', 'u16@test.com', 2, NOW(), NOW(), 0, NULL),
    (17, 'Usuario 17', 'u17@test.com', 1, NOW(), NOW(), 0, NULL),
    (18, 'Usuario 18', 'u18@test.com', 2, NOW(), NOW(), 0, NULL),
    (19, 'Usuario 19', 'u19@test.com', 1, NOW(), NOW(), 0, NULL),
    (20, 'Usuario 20', 'u20@test.com', 2, NOW(), NOW(), 0, NULL)
ON DUPLICATE KEY UPDATE
    full_name = VALUES(full_name),
    role_id = VALUES(role_id),
    updated_at = NOW(),
    is_deleted = VALUES(is_deleted),
    deleted_at = VALUES(deleted_at);

INSERT INTO variables (id, name, value, type) VALUES
    (1, 'TaxRate', '0.16', 'number'),
    (2, 'CompanyName', 'NeoSoft', 'string'),
    (3, 'SupportEmail', 'support@neosoft.local', 'string')
ON DUPLICATE KEY UPDATE
    value = VALUES(value),
    type = VALUES(type);
