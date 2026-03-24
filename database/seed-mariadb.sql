USE `neosoft_db`;

-- Roles Base
INSERT INTO roles (id, name) VALUES (1, 'Admin'), (2, 'User')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Procedimiento de Estrés (1000 registros)
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
            CASE WHEN i % 3 = 1 THEN 'numérico' WHEN i % 3 = 0 THEN 'texto' ELSE 'booleano' END,
            NOW(), NOW()
        );
        SET i = i + 1;
    END WHILE;
END //
DELIMITER ;

CALL FinalStressTest();
DROP PROCEDURE IF EXISTS FinalStressTest;