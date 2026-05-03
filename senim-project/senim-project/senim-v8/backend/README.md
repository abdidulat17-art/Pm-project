# Senim Furniture — Online Furniture Store

## 1. Project Title

**Senim Furniture — Online Furniture Store Web Application**

---

## 2. Topic Area

**E-Commerce / Enterprise Software**

This project is an online furniture store web application. It focuses on creating a digital product catalog for a furniture business, where users can browse furniture, search products, view categories, and contact the store.

---

## 3. Problem Statement

Many small and medium furniture stores do not have a convenient online platform where customers can browse available products.

Customers often need to manually contact managers to ask about categories, availability, and product details.

This creates extra work for store managers and makes the buying process slower for customers.

Our project solves this problem by providing a simple online furniture catalog with product search, categories, and contact form functionality.

---

## 4. Proposed Solution

Senim Furniture is a full-stack web application for an online furniture store.

The frontend provides a user-friendly interface where customers can browse products, view categories, search furniture items, and send contact messages.

The backend is built with Java Spring Boot and provides REST API endpoints for products, categories, and contact messages.

PostgreSQL is used as the database to store furniture products, product categories, and customer contact messages.

---

## 5. Target Users

- Furniture store customers
- Small and medium furniture businesses
- Store managers
- Website administrators
- Users who want to browse furniture online before visiting or contacting the store

---

## 6. Technology Stack

**Frontend:**
- HTML
- CSS
- JavaScript

**Backend:**
- Java 17
- Spring Boot 3.2.5
- Maven
- Spring Data JPA / Hibernate
- Lombok

**Database:**
- PostgreSQL

**Cloud / Hosting:**
- Vercel
- Railway

**APIs / Integrations:**
- REST API
- Product API
- Category API
- Contact Message API

**Other Tools:**
- GitHub
- IntelliJ IDEA
- pgAdmin / PostgreSQL tools

---

## 7. Key Features

- Product catalog with furniture items
- Product categories
- Product search by name or description
- Featured products section
- Contact form for customer messages
- Admin-side contact message management
- PostgreSQL database integration
- Automatic database seeding on first run
- REST API backend for frontend communication

---

## 8. Expected Outcome

At the end of the capstone project, the team will deliver a working online furniture store prototype.

The final system will include:

- A functional frontend website
- A Spring Boot REST API backend
- PostgreSQL database integration
- Product catalog and categories
- Search functionality
- Contact form functionality

---

# Technical Documentation

## Backend Overview

The backend is a REST API service for the Senim Furniture frontend.

It provides API endpoints for:

- Products
- Categories
- Contact messages

On first run, `DataLoader` automatically seeds the database with sample products and categories if the database is empty.

---

## Prerequisites

Before running the project, install:

- Java 17+
- Maven 3.8+
- PostgreSQL 14+

---

## Setup

### 1. Create PostgreSQL Database

```sql
CREATE DATABASE senim_furniture;
```

### 2. Configure Database Connection

If your PostgreSQL username or password is different, update `application.properties`:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/senim_furniture
spring.datasource.username=YOUR_USERNAME
spring.datasource.password=YOUR_PASSWORD
```

### 3. Run Backend

From the `backend/` directory:

```bash
./mvnw spring-boot:run
```

On Windows:

```bash
mvnw.cmd spring-boot:run
```

The backend server starts on:

```text
http://localhost:8080
```

or on the port configured in `application.properties`.

---

## API Endpoints

### Products — `/api/products`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | Get all products |
| GET | `/api/products/{id}` | Get product by ID |
| GET | `/api/products/category/{name}` | Get products by category name |
| GET | `/api/products/featured` | Get featured products |
| GET | `/api/products/search?q={query}` | Search products by name or description |
| POST | `/api/products` | Create a product |
| PUT | `/api/products/{id}` | Update a product |
| DELETE | `/api/products/{id}` | Delete a product |

### Categories — `/api/categories`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/categories` | Get all categories |
| GET | `/api/categories/{id}` | Get category by ID |
| GET | `/api/categories/name/{name}` | Get category by name |
| POST | `/api/categories` | Create a category |
| PUT | `/api/categories/{id}` | Update a category |
| DELETE | `/api/categories/{id}` | Delete a category |

### Contact — `/api/contact`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/contact` | Submit contact form message |
| GET | `/api/contact` | Get all messages |
| GET | `/api/contact/unread` | Get unread messages |
| PATCH | `/api/contact/{id}/read` | Mark message as read |
| DELETE | `/api/contact/{id}` | Delete a message |

---

## CORS

The backend allows requests from:

- `http://localhost:*`
- `http://127.0.0.1:*`
- `file://` origins

For production deployment, the frontend domain should be added to `CorsConfig.java`.

---

## Database Schema

Tables are created automatically by Hibernate using `ddl-auto=update`.

| Table | Key Columns |
|------|-------------|
| `products` | id, name, description, price, image_url, color, material, stock, category, featured |
| `categories` | id, name, description, image_url |
| `contact_messages` | id, name, email, phone, subject, message, created_at, read |

---

## Team Members

- **Abdimurat Dulat** — PM 230103296
- **Narbayev Danial** — Frontend Developer 230103127
- **Kadyrov Dias** — Backend Developer 230103186
