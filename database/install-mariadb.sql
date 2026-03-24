-- Instalación MariaDB / MySQL para Neosoft.Api
-- Ajusta el nombre de la base si tu ConnectionString usa otro Database=...

CREATE DATABASE IF NOT EXISTS `neosoft_db`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `neosoft_db`;

-- Tabla roles (debe existir antes que users por la FK)
CREATE TABLE IF NOT EXISTS `roles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` longtext NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `full_name` longtext NOT NULL,
  `email` longtext NOT NULL,
  `role_id` int NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NULL,
  PRIMARY KEY (`id`),
  KEY `IX_users_role_id` (`role_id`),
  CONSTRAINT `FK_users_roles_role_id` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`)
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `variables` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` longtext NOT NULL,
  `value` longtext NOT NULL,
  `type` longtext NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
