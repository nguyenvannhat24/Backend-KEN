const { readFileData } = require('../utils/fileReader');
const { mapNamesToIds } = require('../utils/mapper');
const Task = require('../models/task.model');

exports.importTasks = async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ message: 'Chưa có file upload!' });

    const filePath = req.file.path;

    // 📘 1️⃣ Đọc dữ liệu từ file
    const data = await readFileData(filePath);

    // Nếu không có dữ liệu thì trả lỗi
    if (!data || data.length === 0) {
      return res.status(400).json({ message: 'File không có dữ liệu hợp lệ!' });
    }

    // 📗 2️⃣ Xem trước dữ liệu gốc (chưa map)
    if (req.query.preview === 'true') {
      return res.json({
        message: 'Xem trước dữ liệu gốc thành công',
        preview: data.slice(0, 20),
        totalRows: data.length,
      });
    }
  // 🔹 Lấy userId từ token (middleware đã decode trước đó)
    const userIdFromToken = req.user?.id || req.user?._id;

    if (!userIdFromToken) {
      return res.status(401).json({ message: 'Không xác định được người dùng từ token' });
    }

    // 📙 3️⃣ Map dữ liệu sang ID
 const mappedTasks = await Promise.all(
      data.map((task) => mapNamesToIds(task, userIdFromToken))
    );

    // 📒 4️⃣ Xem trước dữ liệu đã map (chưa lưu DB)
    if (req.query.previewMapped === 'true') {
      return res.json({
        message: 'Xem trước dữ liệu sau khi map thành công',
        mappedPreview: mappedTasks.slice(0, 20),
        totalMappedRows: mappedTasks.length,
      });
    }

    // 📕 5️⃣ Nếu không có preview nào thì thực hiện lưu vào DB
    await Task.insertMany(mappedTasks);

    res.json({
      message: 'Import thành công!',
      count: mappedTasks.length,
    });
  } catch (err) {
    console.error('❌ Lỗi import:', err);
    res.status(500).json({
      message: 'Import thất bại!',
      error: err.message,
    });
  }
};
