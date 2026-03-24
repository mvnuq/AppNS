-- Script ligero de inicializacion para instalacion manual (DDL + seed acotado)
CREATE DATABASE IF NOT EXISTS `neosoft_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `neosoft_db`;

CREATE TABLE IF NOT EXISTS roles (
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NULL DEFAULT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_roles_name (name)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS users (
    id INT NOT NULL AUTO_INCREMENT,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL,
    role_id INT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NULL DEFAULT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_users_email (email),
    KEY idx_users_role_id (role_id),
    CONSTRAINT fk_users_roles FOREIGN KEY (role_id) REFERENCES roles(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS variables (
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    value VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NULL DEFAULT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_variables_name (name)
) ENGINE=InnoDB;

-- 2 roles
INSERT INTO roles (id, name) VALUES
    (1, 'Admin'),
    (2, 'User')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- 10 usuarios
INSERT IGNORE INTO users (full_name, email, role_id, created_at, updated_at) VALUES
    ('Ana Torres', 'ana.torres@neosoft.cl', 1, NOW(), NOW()),
    ('Bruno Diaz', 'bruno.diaz@neosoft.cl', 2, NOW(), NOW()),
    ('Carla Perez', 'carla.perez@neosoft.cl', 2, NOW(), NOW()),
    ('Diego Soto', 'diego.soto@neosoft.cl', 2, NOW(), NOW()),
    ('Elena Rojas', 'elena.rojas@neosoft.cl', 1, NOW(), NOW()),
    ('Felipe Mora', 'felipe.mora@neosoft.cl', 2, NOW(), NOW()),
    ('Gabriela Nuñez', 'gabriela.nunez@neosoft.cl', 2, NOW(), NOW()),
    ('Hector Silva', 'hector.silva@neosoft.cl', 2, NOW(), NOW()),
    ('Isabel Contreras', 'isabel.contreras@neosoft.cl', 1, NOW(), NOW()),
    ('Javier Fuentes', 'javier.fuentes@neosoft.cl', 2, NOW(), NOW());

-- 5 variables
INSERT IGNORE INTO variables (name, value, type, created_at, updated_at) VALUES
    ('site_title', 'ERP Neosoft', 'texto', NOW(), NOW()),
    ('max_login_attempts', '5', 'numerico', NOW(), NOW()),
    ('maintenance_mode', 'false', 'booleano', NOW(), NOW()),
    ('default_language', 'es-CL', 'texto', NOW(), NOW()),
    ('session_timeout_minutes', '30', 'numerico', NOW(), NOW());
