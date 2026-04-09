# Pm-project
its pm project
# Furni — Furniture Store Backend (Spring Boot + PostgreSQL + H3)

Backend for a furniture selling platform (catalog, warehouses, orders) built for INF 395 — Assignment 1 (Coding Part).

---

## Team
- <Dulat Abdimurat> — Project Manager
- <Dias Kadyrov> — Backend (Spring Boot)
- <Danial Narbaev> — Data Modeling / DB / Flyway

---

## Project Overview
This system provides a backend API for:
- Furniture product catalog (list/search)
- Warehouse locations (stored with H3 index)
- Orders / analytics (basic aggregated stats)
- Security with RBAC (ADMIN/USER)
- Audit logging for critical actions
- Event-driven simulation (async-like event published on key actions)
- Design of our project: https://www.figma.com/design/hIg3bT6d20eefIFTgZkrBD/UI-UX-design?node-id=11-67&t=X0sdaiVAgeFADoGe-0
---

## Tech Stack
- Java 17
- Spring Boot (Web, Security, Data JPA)
- PostgreSQL
- Flyway (migrations)
- H3 (Uber geospatial indexing library)

---

## How to Run

### 0) Important (if you had JavaFX before)
If your project had module-info.java, delete it:
- src/main/java/module-info.java

Spring Boot works best without JPMS modules.

---

### Option A — Run with Docker (recommended)
> Requires Docker Desktop installed and running.

1) Start PostgreSQL:
```bash
docker compose up -d
