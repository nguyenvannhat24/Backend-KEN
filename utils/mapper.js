const Board = require('../models/board.model');
const Column = require('../models/column.model');
const Swimlane = require('../models/swimlane.model');
const User = require('../models/usersModel');
const BoardMember = require('../models/boardMember.model');

// 🔹 Hàm parse định dạng ngày: "20/10/2025" -> new Date("2025-10-20")
function parseDate(value) {
  if (!value) return null;
  if (value instanceof Date) return value;

  const parts = value.split('/');
  if (parts.length === 3) {
    const [day, month, year] = parts;
    return new Date(`${year}-${month}-${day}`);
  }
  return new Date(value);
}

async function mapNamesToIds(taskData, userIdFromToken) {
  // 🔸 Lấy tất cả board mà user này là thành viên
  const userBoards = await BoardMember.find({ user_id: userIdFromToken }).select('board_id role_in_board');
  const boardIds = userBoards.map((b) => b.board_id);

  // 🔸 Tìm board theo tên (không phân biệt hoa thường)
  let board = await Board.findOne({
    $and: [
      { title: { $regex: new RegExp(`^${taskData.BoardName}$`, 'i') } },
      {
        $or: [
          { _id: { $in: boardIds } }, // là thành viên
          { created_by: userIdFromToken }, // hoặc là người tạo
        ],
      },
    ],
  });

  // 🔸 Nếu board chưa tồn tại => tạo mới
  if (!board) {
    board = await Board.create({
      title: taskData.BoardName?.trim(),
      description: taskData.Description || '',
      created_by: userIdFromToken,
      is_template: false,
    });

    // ➕ Thêm người dùng hiện tại vào bảng member với role là "Người tạo"
    await BoardMember.create({
      board_id: board._id,
      user_id: userIdFromToken,
      role_in_board: 'Người tạo',
      Creator: true,
    });
  }

  // 🔸 Tìm column trong board (không phân biệt hoa thường)
  let column = await Column.findOne({
    board_id: board._id,
    name: { $regex: new RegExp(`^${taskData.ColumnName}$`, 'i') },
  });

  if (!column) {
    column = await Column.create({
      board_id: board._id,
      name: taskData.ColumnName?.trim(),
      order: 0,
    });
  }

  // 🔸 Tìm swimlane (nếu có)
  let swimlane = null;
  if (taskData.SwimlaneName) {
    swimlane = await Swimlane.findOne({
      board_id: board._id,
      name: { $regex: new RegExp(`^${taskData.SwimlaneName}$`, 'i') },
    });

    if (!swimlane) {
      swimlane = await Swimlane.create({
        board_id: board._id,
        name: taskData.SwimlaneName?.trim(),
        order: 0,
      });
    }
  }

  // 🔸 Tìm người tạo task (theo username hoặc email)
  const createdBy = await User.findOne({
    $or: [
      { username: { $regex: new RegExp(`^${taskData.CreatedBy}$`, 'i') } },
      { email: { $regex: new RegExp(`^${taskData.CreatedBy}$`, 'i') } },
    ],
  });

  // 🔸 Tìm người được giao (nếu có)
  const assignedTo = taskData.AssignedTo
    ? await User.findOne({
        $or: [
          { username: { $regex: new RegExp(`^${taskData.AssignedTo}$`, 'i') } },
          { email: { $regex: new RegExp(`^${taskData.AssignedTo}$`, 'i') } },
        ],
      })
    : null;

  // ✅ Trả về dữ liệu task đã map
  return {
    board_id: board._id,
    column_id: column._id,
    swimlane_id: swimlane?._id || null,
    title: taskData.Title?.trim(),
    description: taskData.Description?.trim(),
    status: taskData.Status?.trim(),
    priority: taskData.Priority?.trim(),
    start_date: parseDate(taskData.StartDate),
    due_date: parseDate(taskData.DueDate),
    estimate_hours: Number(taskData.EstimateHours) || null,
    created_by: createdBy?._id || userIdFromToken, // fallback: người import
    assigned_to: assignedTo?._id || null,
  };
}

module.exports = { mapNamesToIds };
