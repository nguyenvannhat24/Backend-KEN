# CodeGym Project API Documentation

## 🌐 Database
- **MongoDB URI:**  
mongodb+srv://nhat:123@cluster0.ajpeazo.mongodb.net/CodeGym?retryWrites=true&w=majority&appName=Cluster0


- **DrawDB link:** [https://www.drawdb.app/editor?shareId=8e275fbfabf221e7bddf709c7eaa228d](https://www.drawdb.app/editor?shareId=8e275fbfabf221e7bddf709c7eaa228d)

---

## 🛡️ Auth Routes (`/api/auth`)

| Method | Endpoint                         | Mô tả |
|--------|---------------------------------|-------|
| POST   | /api/auth/login                  | Đăng nhập thường (DB) |
| POST   | /api/auth/keycloak/decode        | Giải mã token Keycloak |
| POST   | /api/auth/logout                 | Đăng xuất (cần token) |
| POST   | /api/auth/refresh-token          | Refresh token (cần token cũ) |
| POST   | /api/auth/verifi                 | Verify token Keycloak |

---

## 👤 User Routes (`/api/users`)

| Method | Endpoint                         | Mô tả |
|--------|---------------------------------|-------|
| GET    | /api/users/selectAll             | Lấy tất cả user (admin) |
| GET    | /api/users/:id                   | Lấy user theo ID (admin hoặc chính mình) |
| GET    | /api/users/email/:email          | Lấy user theo email (admin) |
| GET    | /api/users/name/:name            | Lấy user theo name (admin) |
| GET    | /api/users/phone/:numberphone    | Lấy user theo số điện thoại (admin) |
| POST   | /api/users                        | Tạo user mới (admin) |
| PUT    | /api/users/:id                   | Cập nhật user (admin hoặc chính mình) |
| DELETE | /api/users/:id                   | Xóa user (admin) |

---

## 👥 UserRole Routes (`/api/userRoles`)

| Method | Endpoint                        | Mô tả |
|--------|--------------------------------|-------|
| GET    | /api/userRoles/all              | Lấy tất cả user-role |
| GET    | /api/userRoles/user/:userId     | Lấy role theo user |
| POST   | /api/userRoles                  | Tạo user-role mới |
| PUT    | /api/userRoles/:id              | Cập nhật user-role |
| DELETE | /api/userRoles/:id              | Xóa user-role theo ID |
| DELETE | /api/userRoles/user/:userId     | Xóa tất cả role của user |

---

## 🎭 Role Routes (`/api/role`)

| Method | Endpoint                        | Mô tả |
|--------|--------------------------------|-------|
| GET    | /api/role/my-role               | Lấy role của user hiện tại |
| GET    | /api/role/                       | Lấy tất cả role (chỉ admin) |
| GET    | /api/role/:id                   | Lấy role theo ID (chỉ admin) |
| GET    | /api/role/name/:name            | Lấy role theo tên (chỉ admin) |
| POST   | /api/role                        | Tạo role mới (chỉ admin) |
| PUT    | /api/role/:id                   | Cập nhật role (chỉ admin) |
| DELETE | /api/role/:id                   | Xóa role (chỉ admin) |

---





## 🎭 Boards Routes (`/api/boards`)

| Method | Endpoint        | Mô tả                                                           |
|--------|-----------------|-----------------------------------------------------------------|
| GET    | /api/boards/my  | Lấy danh sách board mà user hiện tại là **creator** hoặc member |
| POST   | /api/boards     | Tạo board mới. **Body**: `{ title, description?, center_id? }` |
| GET    | /api/boards/:id | Xem chi tiết board theo `id`                                   |
| PUT    | /api/boards/:id | Cập nhật board. **Body**: `{ title?, description?, center_id? }` |
| DELETE | /api/boards/:id | Xóa board theo `id`                                            |

---
