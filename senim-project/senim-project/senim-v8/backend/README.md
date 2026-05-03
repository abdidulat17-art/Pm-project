# Senim Furniture — Spring Boot Backend

REST API backend for the Senim Furniture Store frontend.

---

## Tech Stack

- **Java 17**
- **Spring Boot 3.2.5**
- **Maven**
- **PostgreSQL**
- **Spring Data JPA / Hibernate**
- **Lombok**

---

## Project Structure

```
src/main/java/com/senim/furniture/
├── BackendApplication.java          ← Entry point
├── config/
│   └── CorsConfig.java              ← CORS filter for frontend
├── controller/
│   ├── ProductController.java       ← /api/products
│   ├── CategoryController.java      ← /api/categories
│   └── ContactController.java       ← /api/contact
├── entity/
│   ├── Product.java
│   ├── Category.java
│   └── ContactMessage.java
├── repository/
│   ├── ProductRepository.java
│   ├── CategoryRepository.java
│   └── ContactMessageRepository.java
├── service/
│   ├── ProductService.java
│   ├── CategoryService.java
│   └── ContactService.java
└── loader/
    └── DataLoader.java              ← Seeds DB on first run
```

---

## Prerequisites

- Java 17+
- Maven 3.8+
- PostgreSQL 14+

---

## Setup

### 1. Create the PostgreSQL Database

```sql
CREATE DATABASE senim_furniture;
```

If your PostgreSQL user/password differ from defaults, update `application.properties`:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/senim_furniture
spring.datasource.username=YOUR_USERNAME
spring.datasource.password=YOUR_PASSWORD
```

### 2. Build and Run

```bash
# From the backend/ directory:
./mvnw spring-boot:run
```

Or on Windows:
```bash
mvnw.cmd spring-boot:run
```

The server starts on **http://localhost:8080**.

On first run, `DataLoader` automatically seeds the database with 12 products and 7 categories. It will not re-seed if data already exists.

---

## API Endpoints

### Products — `/api/products`

| Method | Endpoint                          | Description                    |
|--------|-----------------------------------|--------------------------------|
| GET    | `/api/products`                   | All products                   |
| GET    | `/api/products/{id}`              | Single product by ID           |
| GET    | `/api/products/category/{name}`   | Products by category name      |
| GET    | `/api/products/featured`          | Featured products only         |
| GET    | `/api/products/search?q={query}`  | Search by name or description  |
| POST   | `/api/products`                   | Create a product               |
| PUT    | `/api/products/{id}`              | Update a product               |
| DELETE | `/api/products/{id}`              | Delete a product               |

### Categories — `/api/categories`

| Method | Endpoint                        | Description            |
|--------|---------------------------------|------------------------|
| GET    | `/api/categories`               | All categories         |
| GET    | `/api/categories/{id}`          | Single category by ID  |
| GET    | `/api/categories/name/{name}`   | Category by name       |
| POST   | `/api/categories`               | Create a category      |
| PUT    | `/api/categories/{id}`          | Update a category      |
| DELETE | `/api/categories/{id}`          | Delete a category      |

### Contact — `/api/contact`

| Method | Endpoint                    | Description                     |
|--------|-----------------------------|---------------------------------|
| POST   | `/api/contact`              | Submit contact form message     |
| GET    | `/api/contact`              | Get all messages (admin)        |
| GET    | `/api/contact/unread`       | Get unread messages (admin)     |
| PATCH  | `/api/contact/{id}/read`    | Mark message as read            |
| DELETE | `/api/contact/{id}`         | Delete a message                |

---

## Example Requests

**Get all products:**
```bash
curl http://localhost:8080/api/products
```

**Get sofas:**
```bash
curl http://localhost:8080/api/products/category/Sofas
```

**Submit contact form:**
```bash
curl -X POST http://localhost:8080/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Amir","email":"amir@example.com","message":"I am interested in the Oak Dining Table."}'
```

**Create a product:**
```bash
curl -X POST http://localhost:8080/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Walnut Bookshelf",
    "category": "Accessories",
    "description": "Solid walnut bookshelf with 5 shelves.",
    "price": 450000,
    "color": "Walnut",
    "material": "Wood",
    "stock": 7,
    "featured": false
  }'
```

---

## CORS

The backend allows requests from:
- `http://localhost:*` (any local port)
- `http://127.0.0.1:*`
- `file://` origins (opening HTML files directly in browser)

To add a production domain, edit `CorsConfig.java` and add it to `allowedOriginPatterns`.

---

## Database Schema

Tables are created automatically by Hibernate (`ddl-auto=update`).

| Table              | Key Columns                                                       |
|--------------------|-------------------------------------------------------------------|
| `products`         | id, name, description, price, image_url, color, material, stock, category, featured |
| `categories`       | id, name, description, image_url                                  |
| `contact_messages` | id, name, email, phone, subject, message, created_at, read        |
