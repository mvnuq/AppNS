-- Script unico de inicializacion para Docker (DDL + seed)
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

-- Roles base
INSERT INTO roles (id, name) VALUES (1, 'Admin'), (2, 'User')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Procedimiento de estres (1000 registros)
DELIMITER //
CREATE OR REPLACE PROCEDURE FinalStressTest()
BEGIN
    DECLARE i INT DEFAULT 1;
    WHILE i <= 1000 DO
        INSERT IGNORE INTO `users` (`full_name`, `email`, `role_id`, `created_at`, `updated_at`)
        VALUES (CONCAT('Usuario Experto ', i), CONCAT('user.test.', i, '@neosoft.cl'), IF(i % 5 = 0, 1, 2), NOW(), NOW());

        INSERT IGNORE INTO `variables` (`name`, `value`, `type`, `created_at`, `updated_at`)
        VALUES (
            CONCAT('sys_var_', i),
            CASE WHEN i % 3 = 1 THEN CAST((i * 5) AS CHAR) WHEN i % 3 = 0 THEN CONCAT('Config ', i) ELSE IF(i % 2 = 0, 'true', 'false') END,
            CASE WHEN i % 3 = 1 THEN 'numerico' WHEN i % 3 = 0 THEN 'texto' ELSE 'booleano' END,
            NOW(), NOW()
        );
        SET i = i + 1;
    END WHILE;
END //
DELIMITER ;

CALL FinalStressTest();
DROP PROCEDURE IF EXISTS FinalStressTest;