-- Este archivo es el punto de entrada para Docker
SOURCE /docker-entrypoint-initdb.d/install-mariadb.sql;
SOURCE /docker-entrypoint-initdb.d/seed-mariadb.sql;