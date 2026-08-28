# 👥 Admin REST API Specification

Base Path: `/api/admin`

All endpoints require administrator privileges (`requireAdmin`). Requests from non-admin accounts receive `403 Forbidden`.

---

## 1. List Users with Pagination & Search
* **Method**: `GET /api/admin/users`
* **Query Parameters**:
  * `page` *(number, optional, default: 1)* — Page number.
  * `limit` *(number, optional, default: 10, max: 100)* — Number of items per page.
  * `search` *(string, optional)* — Search query across name, email, role, or ID.

### Example Request:
```http
GET /api/admin/users?page=1&limit=10&search=alex
```

### Example Response (`200 OK`):
```json
{
  "users": [
    {
      "id": "user-admin-uuid",
      "name": "Alex Admin",
      "email": "alex.admin@example.com",
      "emailVerified": true,
      "image": null,
      "role": "admin",
      "createdAt": "2026-08-28T10:00:00.000Z",
      "updatedAt": "2026-08-28T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalCount": 1,
    "totalPages": 1
  }
}
```
