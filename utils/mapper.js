const Board = require('../models/board.model');
const Column = require('../models/column.model');
const Swimlane = require('../models/swimlane.model');
const User = require('../models/usersModel');
const BoardMember = require('../models/boardMember.model');
const Task = require('../models/task.model'); // ✅ cần để tính position

// 🔹 Hàm parse định dạng ngày: "20/10/2025" -> new Date("2025-10-20")
function parseDate(value) {
  if (!value) return null;
  if (value instanceof Date) return value;

  const parts = String(value).split('/');
  if (parts.length === 3) {
    const [day, month, year] = parts;
    return new Date(`${year}-${month}-${day}`);
  }
  return new Date(value);
}

async function mapNamesToIds(taskData, userIdFromToken) {
  const boardName = String(taskData.BoardName || '').trim();
  const columnName = String(taskData.ColumnName || '').trim();
  const swimlaneName = String(taskData.SwimlaneName || '').trim();
  const taskTitle = String(taskData.Title || '').trim();


  if (!boardName || !columnName || !taskTitle) {

    return null;
  }

  // 🔸 Lấy tất cả board mà user này là thành viên
  const userBoards = await BoardMember.find({ user_id: userIdFromToken }).select('board_id');
  const boardIds = userBoards.map((b) => b.board_id);

  // ⚙️ Tìm hoặc tạo Board (bỏ qua board soft-deleted)
  let board = await Board.findOneAndUpdate(
    {
      title: { $regex: new RegExp(`^${boardName}$`, 'i') },
      deleted_at: null,
      $or: [{ _id: { $in: boardIds } }, { created_by: userIdFromToken }],
    },
    {
      $setOnInsert: {
        title: boardName,
        description: String(taskData.Description || '').trim(),
        created_by: userIdFromToken,
        is_template: false,
      },
    },
    { new: true, upsert: true }
  );

  // ➕ Đảm bảo user là thành viên Board
  await BoardMember.updateOne(
    { board_id: board._id, user_id: userIdFromToken },
    { $setOnInsert: { role_in_board: 'Người tạo', Creator: true } },
    { upsert: true }
  );

  // ⚙️ Tìm hoặc tạo Column
  let column = await Column.findOneAndUpdate(
    {
      board_id: board._id,
      name: { $regex: new RegExp(`^${columnName}$`, 'i') },
    },
    { $setOnInsert: { board_id: board._id, name: columnName, order: 0 } },
    { new: true, upsert: true }
  );

  // ⚙️ Tìm hoặc tạo Swimlane nếu có
  let swimlane = null;
  if (swimlaneName) {
    swimlane = await Swimlane.findOneAndUpdate(
      {
        board_id: board._id,
        name: { $regex: new RegExp(`^${swimlaneName}$`, 'i') },
      },
      { $setOnInsert: { board_id: board._id, name: swimlaneName, order: 0 } },
      { new: true, upsert: true }
    );
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

  // 🔹 Lấy vị trí cao nhất trong cột (và swimlane nếu có)
  const lastTask = await Task.findOne({
    column_id: column._id,
    swimlane_id: swimlane?._id || null,
  })
    .sort({ position: -1 })
    .select('position');

  const newPosition = lastTask ? lastTask.position + 10 : 10;

  // ✅ Trả về dữ liệu task đã map
  return {
    board_id: board._id,
    column_id: column._id,
    swimlane_id: swimlane?._id || null,
    title: taskTitle,
    description: String(taskData.Description || '').trim(),
    status: String(taskData.Status || '').trim(),
    priority: String(taskData.Priority || '').trim(),
    start_date: parseDate(taskData.StartDate),
    due_date: parseDate(taskData.DueDate),
    estimate_hours: Number(taskData.EstimateHours) || null,
    created_by: createdBy?._id || userIdFromToken,
    assigned_to: assignedTo?._id || null,
    position: newPosition,
  };
}

module.exports = { mapNamesToIds };
