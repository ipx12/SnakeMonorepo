# 📋 Tasks REST API Specification

Base Path: `/api/tasks`

All endpoints require authentication (`requireAuth`).

---

## 1. List User Tasks
* **Method**: `GET /api/tasks`
* **Description**: Returns all tasks belonging to the currently authenticated user. If the user has no tasks, 2 default onboarding tasks are automatically seeded.
* **Response (`200 OK`)**:
```json
[
  {
    "id": "7b0451a6-0610-4100-84c2-9e9095697204",
    "title": "Welcome to your Task Dashboard",
    "description": "This is your private task list. Add, edit or complete your items.",
    "completed": false,
    "userId": "user-uuid",
    "createdAt": "2026-08-28T12:00:00.000Z"
  }
]
```

---

## 2. Get Task by ID
* **Method**: `GET /api/tasks/:id`
* **Parameters**: `id` (Task UUID)
* **Response (`200 OK`)**: Task object.
* **Error Responses**:
  * `403 Forbidden` — If the task belongs to another user (and requester is not an `admin`).
  * `404 Not Found` — If the task does not exist.

---

## 3. Create Task
* **Method**: `POST /api/tasks`
* **Validation**: `createTaskSchema`
* **Request Body**:
```json
{
  "title": "New Task Title",
  "description": "Optional task description"
}
```
* **Response (`201 Created`)**: Created task object.

---

## 4. Update Task
* **Method**: `PUT /api/tasks/:id`
* **Validation**: `taskIdParamSchema`, `updateTaskSchema`
* **Request Body**:
```json
{
  "title": "Updated Task Title",
  "completed": true
}
```
* **Response (`200 OK`)**: Updated task object.

---

## 5. Delete Task
* **Method**: `DELETE /api/tasks/:id`
* **Validation**: `taskIdParamSchema`
* **Response (`200 OK`)**: Deleted task object.
