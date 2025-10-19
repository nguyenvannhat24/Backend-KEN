const { readFileData } = require('../utils/fileReader');
const { mapNamesToIds } = require('../utils/mapper');
const Task = require('../models/task.model');

exports.importTasks = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Chưa có file upload!' });
    }

    const filePath = req.file.path;

    const data = await readFileData(filePath);

    if (!data || data.length === 0) {
      return res.status(400).json({ message: 'File không có dữ liệu hợp lệ!' });
    }

  
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

    const mappedTasks = await Promise.all(
      data.map((task) => mapNamesToIds(task, userIdFromToken))
    );


    const validTasks = mappedTasks.filter(task => task !== null);
    const invalidCount = mappedTasks.length - validTasks.length;

    if (req.query.previewMapped === 'true') {
      return res.json({
        message: 'Xem trước dữ liệu sau khi map thành công',
        mappedPreview: validTasks.slice(0, 20),
        totalMappedRows: validTasks.length,
        skippedRows: invalidCount,
      });
    }

    if (validTasks.length === 0) {
      return res.status(400).json({ message: 'Không có dòng hợp lệ để import!' });
    }

 
    await Task.insertMany(validTasks);

    res.json({
      message: 'Import thành công!',
      count: validTasks.length,
      skippedRows: invalidCount,
    });

  } catch (err) {
    res.status(500).json({
      message: 'Import thất bại!',
      error: err.message,
    });
  }
};
