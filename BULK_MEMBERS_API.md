# 📋 API Thêm Nhiều Thành Viên Cùng Lúc

## 🎯 Mô tả
Chức năng cho phép thêm nhiều thành viên vào group cùng một lúc thay vì phải thêm từng người một.

## 🚀 Endpoint

### POST `/api/groupMember/bulk`

**Mô tả**: Thêm nhiều thành viên vào group cùng lúc

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "group_id": "64f1a2b3c4d5e6f7g8h9i0j1",
  "members": [
    {
      "user_id": "64f1a2b3c4d5e6f7g8h9i0j2",
      "role_in_group": "Người xem"
    },
    {
      "user_id": "64f1a2b3c4d5e6f7g8h9i0j3",
      "role_in_group": "Người quản lý"
    },
    {
      "user_id": "64f1a2b3c4d5e6f7g8h9i0j4"
      // role_in_group sẽ mặc định là "Người xem"
    }
  ]
}
```

**Response Success (201)**:
```json
{
  "success": true,
  "message": "Đã xử lý 3 thành viên",
  "data": {
    "success": [
      {
        "index": 0,
        "user_id": "64f1a2b3c4d5e6f7g8h9i0j2",
        "username": "user1",
        "email": "user1@example.com",
        "role_in_group": "Người xem",
        "member_id": "64f1a2b3c4d5e6f7g8h9i0j5"
      },
      {
        "index": 1,
        "user_id": "64f1a2b3c4d5e6f7g8h9i0j3",
        "username": "user2",
        "email": "user2@example.com",
        "role_in_group": "Người quản lý",
        "member_id": "64f1a2b3c4d5e6f7g8h9i0j6"
      }
    ],
    "errors": [
      {
        "index": 2,
        "user_id": "64f1a2b3c4d5e6f7g8h9i0j4",
        "error": "Người dùng không tồn tại"
      }
    ],
    "total": 3
  }
}
```

**Response Error (400)**:
```json
{
  "success": false,
  "message": "Danh sách thành viên không hợp lệ"
}
```

## 📝 Quy tắc và Giới hạn

### ✅ Quyền hạn
- Chỉ **người tạo group** mới có quyền thêm thành viên
- Cần có token xác thực hợp lệ

### 📊 Giới hạn
- Tối đa **50 thành viên** mỗi lần thêm
- Mỗi thành viên phải có `user_id` hợp lệ
- Không thể thêm user đã là thành viên của group

### 🎭 Vai trò (role_in_group)
- `"Người tạo"` - Quyền cao nhất
- `"Người quản lý"` - Quyền quản lý
- `"Người xem"` - Quyền xem (mặc định)

## 🔍 Xử lý Lỗi

### Các loại lỗi có thể xảy ra:
1. **user_id không tồn tại**: User không có trong hệ thống
2. **User đã là thành viên**: User đã có trong group này
3. **group_id không hợp lệ**: Group không tồn tại
4. **Không có quyền**: Không phải người tạo group
5. **Dữ liệu không hợp lệ**: Thiếu user_id hoặc format sai

### Kết quả trả về:
- **success**: Danh sách thành viên được thêm thành công
- **errors**: Danh sách lỗi với thông tin chi tiết
- **total**: Tổng số thành viên được xử lý

## 💡 Ví dụ Sử dụng

### JavaScript (Frontend)
```javascript
const addBulkMembers = async (groupId, members) => {
  try {
    const response = await fetch('/api/groupMember/bulk', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        group_id: groupId,
        members: members
      })
    });

    const result = await response.json();
    
    if (result.success) {
      console.log(`✅ Thêm thành công: ${result.data.success.length} thành viên`);
      console.log(`❌ Lỗi: ${result.data.errors.length} thành viên`);
    }
  } catch (error) {
    console.error('Lỗi:', error);
  }
};

// Sử dụng
const members = [
  { user_id: 'user1_id', role_in_group: 'Người xem' },
  { user_id: 'user2_id', role_in_group: 'Người quản lý' },
  { user_id: 'user3_id' } // mặc định "Người xem"
];

addBulkMembers('group_id', members);
```

### cURL
```bash
curl -X POST http://localhost:3005/api/groupMember/bulk \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "group_id": "64f1a2b3c4d5e6f7g8h9i0j1",
    "members": [
      {
        "user_id": "64f1a2b3c4d5e6f7g8h9i0j2",
        "role_in_group": "Người xem"
      },
      {
        "user_id": "64f1a2b3c4d5e6f7g8h9i0j3",
        "role_in_group": "Người quản lý"
      }
    ]
  }'
```

## 🆚 So sánh với API cũ

| Tính năng | API cũ (`POST /api/groupMember`) | API mới (`POST /api/groupMember/bulk`) |
|-----------|-----------------------------------|----------------------------------------|
| Số lượng | 1 thành viên/lần | Tối đa 50 thành viên/lần |
| Hiệu suất | Nhiều request | 1 request duy nhất |
| Xử lý lỗi | Fail toàn bộ | Xử lý từng thành viên |
| Báo cáo | Đơn giản | Chi tiết success/error |

## 🎉 Lợi ích

1. **Hiệu suất cao**: Giảm số lượng request từ N xuống 1
2. **Trải nghiệm tốt**: Thêm nhiều người cùng lúc
3. **Xử lý lỗi thông minh**: Không bị fail toàn bộ khi có lỗi
4. **Báo cáo chi tiết**: Biết chính xác thành viên nào thành công/thất bại
5. **Dễ sử dụng**: API đơn giản, dễ tích hợp
