# 📄 Hướng dẫn sử dụng Pagination cho User API

## 🎯 **Chức năng**
API `GET /api/user/selectAll` giờ đã hỗ trợ phân trang để lấy danh sách user theo từng trang.

## 🔧 **Query Parameters**

| Parameter | Type | Default | Mô tả |
|-----------|------|---------|-------|
| `page` | number | 1 | Số trang (bắt đầu từ 1) |
| `limit` | number | 10 | Số lượng user mỗi trang |
| `sortBy` | string | 'created_at' | Trường để sắp xếp |
| `sortOrder` | string | 'desc' | Thứ tự sắp xếp ('asc' hoặc 'desc') |

## 📝 **Ví dụ sử dụng trong Postman**

### 1. **Lấy trang 1 với 10 users:**
```
GET {{base_url}}/api/user/selectAll?page=1&limit=10
```

### 2. **Lấy trang 2 với 5 users:**
```
GET {{base_url}}/api/user/selectAll?page=2&limit=5
```

### 3. **Sắp xếp theo tên (A-Z):**
```
GET {{base_url}}/api/user/selectAll?page=1&limit=10&sortBy=full_name&sortOrder=asc
```

### 4. **Sắp xếp theo ngày tạo (mới nhất trước):**
```
GET {{base_url}}/api/user/selectAll?page=1&limit=10&sortBy=created_at&sortOrder=desc
```

### 5. **Sử dụng mặc định (không truyền params):**
```
GET {{base_url}}/api/user/selectAll
```

## 📊 **Response Format**

```json
{
  "success": true,
  "data": [
    {
      "_id": "68d0a7af8bb26a7635984e6c",
      "email": "user@example.com",
      "username": "user123",
      "full_name": "User Name",
      "status": "active",
      "created_at": "2025-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

## 🚀 **Cách sử dụng trong Postman Collection**

1. **Import file:** `User-Pagination-Test.postman_collection.json`
2. **Chạy request "1. Login"** để lấy token
3. **Chạy các request khác** để test phân trang

## 💡 **Lưu ý**

- **Authentication:** Tất cả requests đều cần `Authorization: Bearer <token>`
- **Role:** Chỉ admin mới có quyền truy cập
- **Default:** Nếu không truyền params, sẽ lấy trang 1 với 10 users
- **Sort fields:** Có thể sort theo `created_at`, `full_name`, `email`, `username`

## 🔍 **Debug**

Nếu gặp lỗi, kiểm tra:
1. Token có hợp lệ không
2. User có role admin không
3. Database có dữ liệu không
4. Server đang chạy không

## 📈 **Performance**

- **Limit tối đa:** Không giới hạn, nhưng khuyến nghị ≤ 100
- **Skip calculation:** `(page - 1) * limit`
- **Total count:** Được tính từ database
- **Memory efficient:** Chỉ load data cần thiết
