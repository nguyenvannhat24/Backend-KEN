# 📝 API Cập Nhật Thành Viên Group

## 🎯 Mô tả
Hệ thống cung cấp 2 API để cập nhật thông tin thành viên trong group:

1. **Cập nhật Role** - Chỉ thay đổi vai trò của thành viên
2. **Cập nhật Thành viên** - Cập nhật thông tin tổng quát (bao gồm role)

## 🚀 API Endpoints

### 1. Cập Nhật Role - `PUT /api/groupMember/role`

**Mô tả**: Chỉ cập nhật vai trò của thành viên trong group

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "user_id": "64f1a2b3c4d5e6f7g8h9i0j2",
  "group_id": "64f1a2b3c4d5e6f7g8h9i0j1",
  "role_in_group": "Người quản lý"
}
```

**Response Success (200)**:
```json
{
  "success": true,
  "data": {
    "_id": "64f1a2b3c4d5e6f7g8h9i0j5",
    "user_id": "64f1a2b3c4d5e6f7g8h9i0j2",
    "group_id": "64f1a2b3c4d5e6f7g8h9i0j1",
    "role_in_group": "Người quản lý"
  }
}
```

### 2. Cập Nhật Thành viên - `PUT /api/groupMember/member`

**Mô tả**: Cập nhật thông tin tổng quát của thành viên (linh hoạt hơn)

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "user_id": "64f1a2b3c4d5e6f7g8h9i0j2",
  "group_id": "64f1a2b3c4d5e6f7g8h9i0j1",
  "role_in_group": "Người quản lý"
}
```

**Response Success (200)**:
```json
{
  "success": true,
  "message": "Cập nhật thành viên thành công",
  "data": {
    "_id": "64f1a2b3c4d5e6f7g8h9i0j5",
    "user_id": "64f1a2b3c4d5e6f7g8h9i0j2",
    "group_id": "64f1a2b3c4d5e6f7g8h9i0j1",
    "role_in_group": "Người quản lý"
  }
}
```

## 🔐 Quyền Hạn

### API Cập nhật Role (`/role`)
- **Chỉ người tạo group** mới có quyền cập nhật role
- Yêu cầu `requester_id` phải có role "Người tạo" trong group

### API Cập nhật Thành viên (`/member`)
- **Người tạo group**: Có thể cập nhật mọi thông tin của mọi thành viên
- **Thành viên thường**: Chỉ có thể cập nhật thông tin của chính mình
- **Cập nhật role**: Chỉ người tạo group mới có quyền

## 🎭 Vai Trò Hợp Lệ

```javascript
const validRoles = [
  "Người tạo",    // Quyền cao nhất
  "Người quản lý", // Quyền quản lý
  "Người xem"     // Quyền xem (mặc định)
];
```

## 📋 So Sánh 2 API

| Tính năng | `/role` | `/member` |
|-----------|---------|-----------|
| **Mục đích** | Chỉ cập nhật role | Cập nhật tổng quát |
| **Quyền hạn** | Chỉ người tạo | Linh hoạt hơn |
| **Validation** | Đơn giản | Phức tạp hơn |
| **Mở rộng** | Khó | Dễ dàng |
| **Sử dụng** | Khi chỉ cần đổi role | Khi cần cập nhật nhiều thông tin |

## 💡 Ví Dụ Sử Dụng

### JavaScript (Frontend)

#### Cập nhật Role
```javascript
const updateRole = async (userId, groupId, newRole) => {
  try {
    const response = await fetch('/api/groupMember/role', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user_id: userId,
        group_id: groupId,
        role_in_group: newRole
      })
    });

    const result = await response.json();
    if (result.success) {
      console.log('✅ Cập nhật role thành công');
    }
  } catch (error) {
    console.error('❌ Lỗi:', error);
  }
};
```

#### Cập nhật Thành viên
```javascript
const updateMember = async (userId, groupId, updateData) => {
  try {
    const response = await fetch('/api/groupMember/member', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user_id: userId,
        group_id: groupId,
        ...updateData
      })
    });

    const result = await response.json();
    if (result.success) {
      console.log('✅ Cập nhật thành viên thành công');
    }
  } catch (error) {
    console.error('❌ Lỗi:', error);
  }
};

// Sử dụng
updateMember('user_id', 'group_id', { 
  role_in_group: 'Người quản lý' 
});
```

### cURL

#### Cập nhật Role
```bash
curl -X PUT http://localhost:3005/api/groupMember/role \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "64f1a2b3c4d5e6f7g8h9i0j2",
    "group_id": "64f1a2b3c4d5e6f7g8h9i0j1",
    "role_in_group": "Người quản lý"
  }'
```

#### Cập nhật Thành viên
```bash
curl -X PUT http://localhost:3005/api/groupMember/member \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "64f1a2b3c4d5e6f7g8h9i0j2",
    "group_id": "64f1a2b3c4d5e6f7g8h9i0j1",
    "role_in_group": "Người quản lý"
  }'
```

## ⚠️ Lưu Ý Quan Trọng

### 1. **Xung đột Route đã được giải quyết**
- Trước: `PUT /` và `PUT /member` có thể gây nhầm lẫn
- Sau: `PUT /role` và `PUT /member` rõ ràng hơn

### 2. **Quyền hạn khác nhau**
- `/role`: Chỉ người tạo group
- `/member`: Linh hoạt hơn (owner hoặc self)

### 3. **Validation**
- Cả hai API đều validate `user_id`, `group_id`
- `/member` có validation phức tạp hơn cho quyền hạn

### 4. **Mở rộng tương lai**
- `/member` dễ dàng thêm các field khác
- `/role` chỉ tập trung vào role

## 🎉 Kết Luận

Bây giờ bạn có **2 API rõ ràng** để cập nhật thành viên:

1. **`PUT /api/groupMember/role`** - Cho việc đổi role đơn giản
2. **`PUT /api/groupMember/member`** - Cho việc cập nhật linh hoạt

Chọn API phù hợp với nhu cầu sử dụng! 🚀
