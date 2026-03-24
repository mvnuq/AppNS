SET NAMES utf8mb4;

USE `neosoft_db`;

-- Limpiamos datos de prueba anteriores para evitar duplicados molestos
DELETE FROM `users` WHERE `id` > 3;
DELETE FROM `variables` WHERE `id` > 3;

DELIMITER //

CREATE OR REPLACE PROCEDURE FinalStressTest()
BEGIN
    DECLARE i INT DEFAULT 1;
    DECLARE role_id_val INT;
    DECLARE var_type VARCHAR(20);
    DECLARE var_value VARCHAR(100);

    WHILE i <= 1000 DO
        -- 1. Insertar Usuario
        SET role_id_val = IF(i % 5 = 0, 1, 2); -- 20% Admins, 80% Operadores

        INSERT INTO `users` (`full_name`, `email`, `role_id`, `created_at`, `updated_at`)
        VALUES (
            CONCAT('Usuario Experto ', i),
            CONCAT('user.test.', i, '@neosoft.cl'),
            role_id_val,
            UTC_TIMESTAMP(6),
            UTC_TIMESTAMP(6)
        );

        -- 2. Insertar Variable con logica de tipo limpia
        IF i % 3 = 0 THEN
            SET var_type = 'texto';
            SET var_value = CONCAT('Configuracion Global ', i);
        ELSEIF i % 3 = 1 THEN
            SET var_type = 'numérico';
            SET var_value = CAST((i * 5) AS CHAR); -- Solo el numero como string
        ELSE
            SET var_type = 'booleano';
            SET var_value = IF(i % 2 = 0, 'true', 'false');
        END IF;

        INSERT INTO `variables` (`name`, `value`, `type`, `created_at`, `updated_at`)
        VALUES (
            CONCAT('sys_var_', i),
            var_value,
            var_type,
            UTC_TIMESTAMP(6),
            UTC_TIMESTAMP(6)
        );

        SET i = i + 1;
    END WHILE;
END //

DELIMITER ;

-- Ejecutar el proceso
CALL FinalStressTest();

-- Limpieza
DROP PROCEDURE IF EXISTS FinalStressTest;
