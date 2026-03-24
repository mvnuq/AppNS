# ERP Management System

[![.NET](https://img.shields.io/badge/.NET-9.0-512BD4?logo=dotnet&logoColor=white)](https://dotnet.microsoft.com/)
[![Angular](https://img.shields.io/badge/Angular-19-DD0031?logo=angular&logoColor=white)](https://angular.io/)
[![MariaDB](https://img.shields.io/badge/MariaDB-11.8-003545?logo=mariadb&logoColor=white)](https://mariadb.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![Architecture](https://img.shields.io/badge/Architecture-Clean%20Architecture-0A66C2)](#-technical-architecture)

Sistema enfocado en la administración de **Usuarios**, **Roles** y **Variables**, diseñado para ser claro de mantener, fácil de desplegar y demostrable en entornos técnicos exigentes.

---

## Project Overview & Features

Este proyecto implementa una solución full-stack para gestión administrativa con separación clara de responsabilidades entre API, frontend y persistencia de datos.

### Funcionalidades clave
- **CRUD completo de mantenedores** para `Usuarios`, `Roles` y `Variables` (listar, crear, editar y eliminar con confirmación).
- **Modelo de Usuarios** con `Id`, `Nombre`, `Email` y `RolId` con relación real a `Roles`.
- **Dropdown dinámico de Roles** en el formulario de usuario, cargado directamente desde la API (`GET /roles/for-dropdown`).
- **Validaciones backend y frontend** (campos obligatorios, formato de email, reglas de negocio y consistencia relacional).
- **Server-side pagination** en todas las mantenedoras para mejorar rendimiento con volumen de datos.
- **Advanced filtering** por **ID** y **Nombre** en usuarios, roles y variables para búsquedas rápidas.
- **Automated audit logs** para operaciones de actualización/eliminación.
- **Seed automático de 1000 registros** para pruebas funcionales y de desempeño inicial.

> Nota: actualmente el backend realiza **eliminación física** (no soft delete lógico).  
> La trazabilidad se mantiene mediante auditoría y timestamps.

---

## Technical Architecture

### Backend
- **.NET 9 Web API**.
- Organización por capas con principios de **Clean Architecture** (Controllers, Services, Repositories, Data).
- **Entity Framework Core** con proveedor **Pomelo MySQL/MariaDB**.
- Validaciones con **FluentValidation**.

### Frontend
- **Angular 17+** (implementado con Angular 19).
- UI en **Angular Material**.
- Arquitectura modular por features (`users`, `roles`, `variables`) con componentes reutilizables para tablas, filtros y diálogos.

### Database
- **MariaDB 11.8**.
- Integridad relacional mediante **foreign keys**.
- Índices y restricciones definidos en `db-init/init.sql` (ej. `uq_users_email`, `idx_users_role_id`, `uq_roles_name`, `uq_variables_name`).

---

## API Documentation (Brief)

Base URL local:

```bash
http://localhost:5106/api/v1
```

Endpoints principales:

```text
GET    /users
GET    /users/{id}
POST   /users
PUT    /users/{id}
DELETE /users/{id}

GET    /roles
GET    /roles/for-dropdown
GET    /roles/{id}
POST   /roles
PUT    /roles/{id}
DELETE /roles/{id}

GET    /variables
GET    /variables/{id}
POST   /variables
PUT    /variables/{id}
DELETE /variables/{id}
```

## Deployment Options

### Option A: Docker Compose (One-Click) — Recomendado

Levanta **DB + API + Frontend** con una sola instrucción, incluyendo inicialización de esquema y **1000 registros** de prueba.

Prerequisito recomendado: tener **Docker Desktop** instalado y ejecutándose para simplificar la gestión de contenedores en entorno local.

1) (Opcional) Crear `.env` raíz desde el ejemplo:

```bash
cp .env.docker.example .env
```

2) Ejecutar stack completo:

```bash
docker compose up --build
```

3) Accesos:
- Frontend: `http://localhost:4200`
- API: `http://localhost:5106/api/v1`
- DB MariaDB: `localhost:3308`

### Option B: Manual Installation

#### 1) Base de datos (MariaDB)

Crear base y poblar datos usando `db-init/init.sql`.

```bash
# ejemplo (ajusta host/puerto/credenciales)
mysql -h 127.0.0.1 -P 3308 -u root -p < db-init/init.sql
```

#### 2) Backend (.NET API)

Desde `backend/Neosoft.Api`:

```bash
# crear archivo de entorno para connection string
cp .env.example .env

dotnet restore
dotnet run
```

API disponible en:

```bash
http://localhost:5106/api/v1
```

#### 3) Frontend (Angular)

Desde `frontend`:

```bash
npm install
npm start
```

Aplicación disponible en:

```bash
http://localhost:4200
```

---

## Audit & Traceability

La trazabilidad operativa se cubre en dos niveles:

1. **Timestamps automáticos**
   - En `SaveChanges/SaveChangesAsync`, el `DbContext` asigna:
     - `CreatedAt` al crear entidades.
     - `UpdatedAt` al modificar entidades.

2. **Auditoría de operaciones**
   - En cambios relevantes (`UPDATE`, `DELETE`) se registra:
     - acción,
     - entidad,
     - id afectado,
     - timestamp en hora Chile.
   - El log persiste en: `backend/Neosoft.Api/log/audit.log`.

Este enfoque entrega visibilidad sobre cambios críticos y facilita análisis post-operación en ambientes de soporte y QA.

---

## Tech Stack

- **Backend:** .NET 9, ASP.NET Core Web API, EF Core, FluentValidation
- **Frontend:** Angular, Angular Material, RxJS
- **Database:** MariaDB
- **DevOps:** Docker, Docker Compose

---

## Author

Manuel Zepeda
