# js-node-express-explore-api

A simple REST API built with **Node.js + Express** and **PostgreSQL** for user management. Designed as an exploration project covering CRUD operations, request/response echo, health check, structured logging with per-request trace IDs, and layered architecture.

---

## Features

| Feature | Description |
|---|---|
| **User Management CRUD** | Create, Read (list + by ID), Update, Delete with full validation |
| **Pagination & Filter** | List users with `page`, `limit`, and `is_active` filter |
| **Input Validation** | Required/optional field validation with structured error messages |
| **Conflict Detection** | 409 response on duplicate `username` or `email` |
| **Echo API** | Mirrors back any request — method, headers, body, query, params |
| **Health Check** | Reports app status, DB connectivity & latency, uptime, versions |
| **Trace ID Logging** | Every request gets a UUIDv4 trace ID included in logs and response headers |
| **Structured Logging** | Winston-based logger writing to console + `logs/combined.log` + `logs/error.log` |
| **Graceful Shutdown** | Handles `SIGTERM`/`SIGINT` for clean process exit |
| **Environment Config** | Fully configurable via `.env` |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js ≥ 18 (tested on v22.22.3) |
| Framework | Express 4.x |
| Database | PostgreSQL (via `pg` / node-postgres) |
| Logging | Winston 3.x |
| Trace ID | uuid 11.x (UUIDv4) |
| Config | dotenv |
| Dev server | nodemon |

---

## Project Structure

```
js-node-express-explore-api/
├── sql/
│   ├── ddl.sql               # Schema, tables, indexes, triggers
│   └── dml.sql               # Seed data
├── src/
│   ├── app.js                # Express app + server startup + graceful shutdown
│   ├── config/
│   │   ├── database.js       # PostgreSQL connection pool
│   │   └── env.js            # Centralized env variable access
│   ├── controllers/
│   │   ├── users.controller.js
│   │   ├── echo.controller.js
│   │   └── health.controller.js
│   ├── middlewares/
│   │   ├── traceId.middleware.js       # Generates/propagates UUIDv4 trace ID
│   │   ├── requestLogger.middleware.js  # Logs incoming request and outgoing response
│   │   └── errorHandler.middleware.js  # Global async error handler
│   ├── repositories/
│   │   └── users.repository.js         # Raw SQL queries (no ORM)
│   ├── routes/
│   │   ├── index.js          # Root router — mounts all sub-routers
│   │   ├── users.routes.js
│   │   ├── echo.routes.js
│   │   └── health.routes.js
│   ├── services/
│   │   └── users.service.js  # Business logic, domain error translation
│   ├── utils/
│   │   ├── logger.js         # Winston logger factory
│   │   └── response.js       # Standardized success/error response helpers
│   └── validators/
│       └── users.validator.js  # Pure validation functions
├── logs/                     # Auto-created at startup (gitignored)
├── .env                      # Local secrets (gitignored)
├── .env.example              # Template for environment variables
└── package.json
```

---

## Prerequisites

- **Node.js** ≥ 18 (recommend v22 LTS)
- **npm** ≥ 10
- **PostgreSQL** running locally (default port 5432)
- Database `js_explore` created with the DDL and seed data applied

---

## Getting Started

### 1. Clone & Install

```bash
git clone <repo-url>
cd js-node-express-explore-api
npm install
```

### 2. Setup Database

Connect to your PostgreSQL instance and run the SQL files in order:

```bash
psql -U postgres -d js_explore -f sql/ddl.sql
psql -U postgres -d js_explore -f sql/dml.sql
```

Or via DBeaver / any SQL client — execute `sql/ddl.sql` first, then `sql/dml.sql`.

### 3. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
NODE_ENV=development
PORT=3000
LOG_LEVEL=info

DB_HOST=localhost
DB_PORT=5432
DB_NAME=js_explore
DB_USER=postgres
DB_PASSWORD=your_password_here
DB_POOL_MAX=10
```

### 4. Run

```bash
# Production
npm start

# Development (auto-reload on file change)
npm run dev
```

Server starts at `http://localhost:3000`.

---

## API Reference

All responses share a common envelope:

```json
{
  "traceId": "550e8400-e29b-41d4-a716-446655440000",
  "success": true | false,
  "message": "Human-readable status",
  "data": { ... } | null,
  "timestamp": "2026-06-04T04:00:00.000Z"
}
```

The `X-Trace-Id` header is also set on every response with the same value.

---

### Health Check

#### `GET /health`

Returns application status, DB connectivity, uptime, and version info.

**Response 200 — healthy:**
```json
{
  "traceId": "a9d215...",
  "success": true,
  "message": "Service is healthy",
  "data": {
    "status": "ok",
    "uptime": "27.37s",
    "app": {
      "name": "js-node-express-explore-api",
      "version": "1.0.0",
      "nodeVersion": "v22.22.3",
      "environment": "development"
    },
    "services": {
      "database": {
        "status": "ok",
        "latency": "1ms"
      }
    },
    "timestamp": "2026-06-04T04:00:00.000Z"
  },
  "timestamp": "2026-06-04T04:00:00.000Z"
}
```

**Response 503 — degraded** (DB unreachable):
```json
{
  "traceId": "...",
  "success": false,
  "message": "Service is degraded",
  "timestamp": "..."
}
```

---

### Echo

#### `ANY /echo` · `ANY /echo/*`

Echoes back every detail of the incoming request. Accepts any HTTP method and any sub-path.

**Example — `POST /echo?env=staging`**

```bash
curl -X POST http://localhost:3000/echo \
  -H "Content-Type: application/json" \
  -H "X-Custom-Header: my-value" \
  -d '{"hello": "world"}'
```

**Response 200:**
```json
{
  "traceId": "9a6cab...",
  "success": true,
  "message": "Echo response",
  "data": {
    "method": "POST",
    "url": "/echo?env=staging",
    "headers": {
      "content-type": "application/json",
      "x-custom-header": "my-value"
    },
    "query": { "env": "staging" },
    "params": {},
    "body": { "hello": "world" }
  },
  "timestamp": "..."
}
```

---

### User Management

Base path: `/api/v1/users`

#### Field Reference

| Field | Type | Required (Create) | Notes |
|---|---|---|---|
| `username` | string | ✅ | Unique, max 50 chars |
| `email` | string | ✅ | Unique, valid email, max 255 chars |
| `full_name` | string | ✅ | Max 255 chars |
| `phone` | string | ❌ | Max 20 chars, defaults to `""` |
| `is_active` | boolean | ❌ | Defaults to `true` |

---

#### `GET /api/v1/users`

List users with optional pagination and filter.

**Query Parameters:**

| Param | Type | Default | Description |
|---|---|---|---|
| `page` | integer | `1` | Page number |
| `limit` | integer | `10` | Items per page (max 100) |
| `is_active` | boolean | — | Filter by active status (`true` / `false`) |

**Example:**
```bash
curl "http://localhost:3000/api/v1/users?page=1&limit=2&is_active=true"
```

**Response 200:**
```json
{
  "traceId": "...",
  "success": true,
  "message": "Users retrieved successfully",
  "data": {
    "users": [
      {
        "id": "1",
        "username": "admin",
        "email": "admin@example.com",
        "full_name": "Administrator",
        "phone": "081200000001",
        "is_active": true,
        "created_at": "2026-06-03T10:00:27.994Z",
        "updated_at": "2026-06-03T10:00:27.994Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 2,
      "total": 4,
      "totalPages": 2
    }
  },
  "timestamp": "..."
}
```

---

#### `GET /api/v1/users/:id`

Get a single user by ID.

```bash
curl http://localhost:3000/api/v1/users/1
```

**Response 200:** User object inside `data`.  
**Response 400:** Invalid ID (non-numeric).  
**Response 404:** User not found.

---

#### `POST /api/v1/users`

Create a new user.

```bash
curl -X POST http://localhost:3000/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "jaka_dev",
    "email": "jaka@example.com",
    "full_name": "Jaka Developer",
    "phone": "081200001234",
    "is_active": true
  }'
```

**Response 201:**
```json
{
  "traceId": "...",
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": "7",
    "username": "jaka_dev",
    "email": "jaka@example.com",
    "full_name": "Jaka Developer",
    "phone": "081200001234",
    "is_active": true,
    "created_at": "...",
    "updated_at": "..."
  },
  "timestamp": "..."
}
```

**Response 422 — validation failed:**
```json
{
  "traceId": "...",
  "success": false,
  "message": "Validation failed",
  "details": [
    { "field": "username", "message": "Required, must be a non-empty string" },
    { "field": "email", "message": "Must be a valid email address" }
  ],
  "timestamp": "..."
}
```

**Response 409 — conflict:**
```json
{
  "traceId": "...",
  "success": false,
  "message": "The username is already taken",
  "timestamp": "..."
}
```

---

#### `PUT /api/v1/users/:id`

Update one or more fields of an existing user. At least one field must be provided.

```bash
curl -X PUT http://localhost:3000/api/v1/users/2 \
  -H "Content-Type: application/json" \
  -d '{"phone": "082100000099", "is_active": false}'
```

**Response 200:** Updated user object.  
**Response 400:** Invalid ID.  
**Response 404:** User not found.  
**Response 409:** Duplicate username/email.  
**Response 422:** Validation errors.

---

#### `DELETE /api/v1/users/:id`

Permanently delete a user by ID.

```bash
curl -X DELETE http://localhost:3000/api/v1/users/7
```

**Response 200:**
```json
{
  "traceId": "...",
  "success": true,
  "message": "User deleted successfully",
  "data": null,
  "timestamp": "..."
}
```

**Response 400:** Invalid ID.  
**Response 404:** User not found.

---

## Logging

Every request is assigned a **UUIDv4 trace ID** at the entry point. The trace ID:

- Appears in every log line for that request
- Is returned as the `X-Trace-Id` response header
- Is included in the JSON response body as `traceId`
- Can be provided by the client via `X-Trace-Id` request header (e.g., for distributed tracing)

**Console log format:**
```
2026-06-04T04:15:16.602+07:00 info [6c47fb29-351c-418d-9991-d35eb8f133e4] --> GET /health {"ip":"::1","userAgent":"curl/8.7.1"}
2026-06-04T04:15:16.731+07:00 info [6c47fb29-351c-418d-9991-d35eb8f133e4] <-- GET /health 200 (129ms)
```

**Log levels:**
| Level | When |
|---|---|
| `info` | Normal request/response (2xx, 3xx) |
| `warn` | Client errors (4xx) |
| `error` | Server errors (5xx), DB pool errors, unhandled exceptions |
| `debug` | Service-level operations (only visible when `LOG_LEVEL=debug`) |

**Log files** (auto-created in `logs/`):
- `logs/combined.log` — all levels as JSON
- `logs/error.log` — errors only as JSON

---

## HTTP Status Codes

| Code | Meaning |
|---|---|
| 200 | Success |
| 201 | Resource created |
| 400 | Bad request (invalid ID format) |
| 404 | Resource not found |
| 409 | Conflict (duplicate username/email) |
| 422 | Unprocessable entity (validation failed) |
| 500 | Internal server error |
| 503 | Service degraded (DB unavailable) |

---

## Database Schema

**Schema:** `user_management`  
**Table:** `users`

```sql
CREATE TABLE user_management.users (
    id          BIGSERIAL    NOT NULL,  -- auto-increment PK
    username    VARCHAR(50)  NOT NULL,  -- unique login identifier
    email       VARCHAR(255) NOT NULL,  -- unique email
    full_name   VARCHAR(255) NOT NULL,  -- display name
    phone       VARCHAR(20)  NOT NULL DEFAULT '',   -- optional
    is_active   BOOLEAN      NOT NULL DEFAULT TRUE, -- soft enable/disable
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(), -- auto-updated by trigger
    CONSTRAINT pk_users          PRIMARY KEY (id),
    CONSTRAINT uq_users_username UNIQUE (username),
    CONSTRAINT uq_users_email    UNIQUE (email)
);
```

An `updated_at` trigger (`trg_users_updated_at`) automatically sets `updated_at = NOW()` on every `UPDATE`.

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `NODE_ENV` | `development` | Environment name |
| `PORT` | `3000` | HTTP server port |
| `LOG_LEVEL` | `info` | Winston log level (`error`/`warn`/`info`/`debug`) |
| `DB_HOST` | `localhost` | PostgreSQL host |
| `DB_PORT` | `5432` | PostgreSQL port |
| `DB_NAME` | `js_explore` | Database name |
| `DB_USER` | `postgres` | Database user |
| `DB_PASSWORD` | _(empty)_ | Database password |
| `DB_POOL_MAX` | `10` | Max connections in pool |
