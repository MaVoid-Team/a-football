# Court Management System — API Documentation

REST API for managing court bookings across multiple branches. Built with Rails 8.1 (API-only).

---

## Base URL

```
http://localhost:3000
```

For production, replace with your deployed base URL.

---

## Authentication

### Admin Authentication (JWT)

Admin endpoints require a Bearer token obtained via login.

**Login**

```
POST /api/admin/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "your_password"
}
```

**Response (200 OK)**

```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "admin": {
    "data": {
      "id": "1",
      "type": "admin",
      "attributes": {
        "email": "admin@example.com",
        "role": "super_admin",
        "branch_id": null,
        "created_at": "...",
        "updated_at": "..."
      }
    }
  }
}
```

**Logout**

```
DELETE /api/admin/logout
Authorization: Bearer <token>
```

Revokes the current token. Returns `204 No Content` on success.

**Using the token**

Include the token in all admin requests:

```
Authorization: Bearer <your_jwt_token>
```

### Admin Roles

- **super_admin** — Full access to all branches
- **branch_admin** — Access limited to their assigned branch

---

## Rate Limiting

| Endpoint | Limit | Period |
|----------|-------|--------|
| `POST /api/admin/login` | 5 requests | 60 seconds |
| `POST /api/bookings` | 10 requests | 60 seconds |
| General API | 300 requests | 60 seconds |

When rate limit is exceeded, the API returns `429 Too Many Requests` with:

```json
{ "error": "Rate limit exceeded. Please try again later." }
```

---

## Pagination

All list (index) endpoints support pagination.

**Query parameters**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number |
| `per_page` | integer | 25 | Items per page (max 100) |

**Response headers**

| Header | Description |
|--------|-------------|
| `X-Total-Count` | Total number of records |
| `X-Page` | Current page |
| `X-Per-Page` | Items per page |
| `X-Total-Pages` | Total number of pages |

---

## Response Format

List endpoints return [JSON:API](https://jsonapi.org/) format:

```json
{
  "data": [
    {
      "id": "1",
      "type": "branch",
      "attributes": { ... }
    }
  ]
}
```

Single-resource endpoints return:

```json
{
  "data": {
    "id": "1",
    "type": "branch",
    "attributes": { ... }
  }
}
```

Error responses:

```json
{ "error": "Resource not found" }
{ "errors": ["Validation error message 1", "Validation error message 2"] }
```

---

## Public API Endpoints

No authentication required.

### Packages

#### List packages

```
GET /api/packages
GET /api/packages?branch_id=1
GET /api/packages?q=tennis&sort=price.asc
```

| Parameter | Type | Description |
|----------|------|-------------|
| `branch_id` | integer | Optional. Filter by branch; returns branch + global packages |
| `q` | string | Optional. Full-text search (title, description) via Meilisearch |
| `sort` | string | Optional. Sort by `title`, `price`, or `created_at`; append `.asc` or `.desc` (e.g. `price.asc`) |
| `price_min` | decimal | Optional. Minimum price filter |
| `price_max` | decimal | Optional. Maximum price filter |
| `page` | integer | Pagination |
| `per_page` | integer | Pagination |

#### Show package

```
GET /api/packages/:id
```

Returns a single package by ID. No authentication required.

---

### Events

#### List events

```
GET /api/events
GET /api/events?branch_id=1
GET /api/events?upcoming=true
GET /api/events?q=tennis&from_date=2026-01-01&to_date=2026-12-31
```

| Parameter | Type | Description |
|----------|------|-------------|
| `branch_id` | integer | Optional. Filter by branch |
| `q` | string | Optional. Full-text search (title, description) via Meilisearch |
| `upcoming` | boolean | Optional. Only future events |
| `sort` | string | Optional. Sort by `start_date` or `title`; append `.asc` or `.desc` |
| `from_date` | string | Optional. Filter events from this date (YYYY-MM-DD) |
| `to_date` | string | Optional. Filter events until this date (YYYY-MM-DD) |
| `page` | integer | Pagination |
| `per_page` | integer | Pagination |

#### Show event

```
GET /api/events/:id
```

---

### Availability

#### Get available slots

```
GET /api/availability?branch_id=1&court_id=1&date=2026-02-25
```

| Parameter | Type | Required | Description |
|----------|------|----------|-------------|
| `branch_id` | integer | Yes | Branch ID |
| `court_id` | integer | Yes | Court ID |
| `date` | string | No | Date (YYYY-MM-DD). Default: today |

**Response**

```json
{
  "branch_id": 1,
  "court_id": 1,
  "date": "2026-02-25",
  "available_slots": [
    { "start_time": "08:00", "end_time": "09:00" },
    { "start_time": "09:00", "end_time": "10:00" }
  ]
}
```

---

### Bookings

#### Create booking

```
POST /api/bookings
Content-Type: application/json
```

**Body (JSON)**

```json
{
  "branch_id": 1,
  "booking": {
    "court_id": 1,
    "user_name": "John Doe",
    "user_phone": "+201001234567",
    "date": "2026-02-25",
    "start_time": "10:00",
    "end_time": "12:00"
  }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `branch_id` | integer | Yes | Branch ID (top-level) |
| `court_id` | integer | Yes | Court ID |
| `user_name` | string | Yes | Customer name |
| `user_phone` | string | Yes | Customer phone |
| `date` | string | Yes | Date (YYYY-MM-DD) |
| `start_time` | string | Yes | Start time (HH:MM) |
| `end_time` | string | Yes | End time (HH:MM), must be after start |

**Response (201 Created)** — Booking object with `total_price`, `hours`, `status`, etc.

---

## Admin API Endpoints

All admin endpoints require `Authorization: Bearer <token>`.

### Branches

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/branches` | List branches |
| GET | `/api/admin/branches/:id` | Show branch |
| POST | `/api/admin/branches` | Create branch |
| PATCH | `/api/admin/branches/:id` | Update branch |
| DELETE | `/api/admin/branches/:id` | Delete branch |

**Query params (index):** `q` (search name, address), `active` (boolean), `sort` (name, created_at)

**Create/Update body**

```json
{
  "branch": {
    "name": "Main Branch",
    "address": "123 Main St",
    "timezone": "Africa/Cairo",
    "active": true
  }
}
```

---

### Courts

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/courts` | List courts |
| GET | `/api/admin/courts/:id` | Show court |
| POST | `/api/admin/courts` | Create court |
| PATCH | `/api/admin/courts/:id` | Update court |
| DELETE | `/api/admin/courts/:id` | Delete court |

**Query params (index):** `branch_id`, `active` (boolean), `q` (search name), `sort` (name, price_per_hour)

**Create/Update body**

```json
{
  "court": {
    "branch_id": 1,
    "name": "Court 1",
    "price_per_hour": 150.00,
    "active": true
  }
}
```

---

### Packages (Admin)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/packages` | List packages |
| GET | `/api/admin/packages/:id` | Show package |
| POST | `/api/admin/packages` | Create package |
| PATCH | `/api/admin/packages/:id` | Update package |
| DELETE | `/api/admin/packages/:id` | Delete package |

**Query params (index):** `branch_id`, `q` (search title, description), `sort` (title, price, created_at), `price_min`, `price_max`

**Create/Update body**

```json
{
  "package": {
    "branch_id": 1,
    "title": "10-Hour Package",
    "description": "10 hours of court time",
    "price": 1200.00
  }
}
```

`branch_id` can be `null` for global packages.

---

### Events (Admin)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/events` | List events |
| GET | `/api/admin/events/:id` | Show event |
| POST | `/api/admin/events` | Create event |
| PATCH | `/api/admin/events/:id` | Update event |
| DELETE | `/api/admin/events/:id` | Delete event |

**Query params (index):** `branch_id`, `q` (search title, description), `sort` (start_date, title), `from_date`, `to_date`

**Create/Update body**

```json
{
  "event": {
    "branch_id": 1,
    "title": "Tennis Tournament",
    "description": "Annual singles tournament",
    "start_date": "2026-03-15T09:00:00Z",
    "participation_price": 50.00,
    "max_participants": 32
  }
}
```

---

### Bookings (Admin)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/bookings` | List bookings |
| GET | `/api/admin/bookings/:id` | Show booking |
| PATCH | `/api/admin/bookings/:id` | Update or cancel booking |

**Query params (index):** `branch_id`, `court_id`, `date`, `status`, `q` (search user_name, user_phone), `from_date`, `to_date`, `sort` (date, created_at)

**Update body (change payment status)**

```json
{
  "booking": {
    "payment_status": "paid"
  }
}
```

**Cancel booking**

```json
{
  "cancel": true
}
```

---

### Blocked Slots

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/blocked_slots` | List blocked slots |
| GET | `/api/admin/blocked_slots/:id` | Show blocked slot |
| POST | `/api/admin/blocked_slots` | Create blocked slot |
| PATCH | `/api/admin/blocked_slots/:id` | Update blocked slot |
| DELETE | `/api/admin/blocked_slots/:id` | Delete blocked slot |

**Query params (index):** `court_id`, `date`, `branch_id`, `from_date`, `to_date`

**Create/Update body**

```json
{
  "blocked_slot": {
    "branch_id": 1,
    "court_id": 1,
    "date": "2026-02-25",
    "start_time": "14:00",
    "end_time": "16:00",
    "reason": "Maintenance"
  }
}
```

---

### Settings

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/settings` | Show settings (for current branch) |
| POST | `/api/admin/settings` | Create settings |
| PATCH | `/api/admin/settings` | Update settings |

**Super admin:** Add `branch_id` query param to manage another branch's settings.

**Create/Update body**

```json
{
  "setting": {
    "branch_id": 1,
    "whatsapp_number": "201234567890",
    "contact_email": "contact@example.com",
    "contact_phone": "+201001234567",
    "opening_hour": 8,
    "closing_hour": 23
  }
}
```

---

### Admins

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/admins` | List admins |
| POST | `/api/admin/admins` | Create admin |
| PATCH | `/api/admin/admins/:id` | Update admin |
| DELETE | `/api/admin/admins/:id` | Delete admin |

**Query params (index):** `branch_id`, `role` (super_admin=0, branch_admin=1), `q` (search email), `sort` (email, created_at)

**Create/Update body**

```json
{
  "admin": {
    "branch_id": 1,
    "email": "admin@branch.com",
    "password": "secure_password",
    "password_confirmation": "secure_password",
    "role": "branch_admin"
  }
}
```

**Roles:** `super_admin`, `branch_admin`

---

### Statistics

```
GET /api/admin/statistics
GET /api/admin/statistics?days=7
GET /api/admin/statistics?from=2026-02-01&to=2026-02-28
```

| Parameter | Type | Description |
|----------|------|-------------|
| `days` | integer | Period in days (default: 30) |
| `from` | string | Start date for revenue (YYYY-MM-DD) |
| `to` | string | End date for revenue (YYYY-MM-DD) |

**Response**

```json
{
  "total_revenue": "15000.0",
  "total_confirmed_bookings": 120,
  "bookings_per_court": [
    { "court_id": 1, "court_name": "Court 1", "bookings_count": 45 },
    { "court_id": 2, "court_name": "Court 2", "bookings_count": 75 }
  ],
  "occupancy_rate_percent": 12.5
}
```

---

## Health Check

```
GET /up
```

Returns `200 OK` when the application is healthy.

---

## HTTP Status Codes

| Code | Meaning |
|-----|---------|
| 200 | Success |
| 201 | Created |
| 204 | No Content (successful delete/update) |
| 400 | Bad Request (e.g. missing params) |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 422 | Unprocessable Entity (validation errors) |
| 429 | Too Many Requests (rate limit exceeded) |
