const centerService = require('../services/center.service');

// Lấy tất cả
exports.getAllCenters = async (req, res) => {
  try {
    const centers = await centerService.viewAll();
    res.json({ success: true, count: centers.length, data: centers });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Lấy theo ID
exports.getCenterById = async (req, res) => {
  try {
    const center = await centerService.getById(req.params.id);
    if (!center) return res.status(404).json({ message: 'Center not found' });
    res.json(center);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Tạo mới
exports.createCenter = async (req, res) => {
  try {
    const center = await centerService.createCenter(req.body);
    res.status(201).json(center);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Cập nhật
exports.updateCenter = async (req, res) => {
  try {
    const center = await centerService.updateCenter(req.params.id, req.body);
    if (!center) return res.status(404).json({ message: 'Center not found' });
    res.json(center);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Xóa
exports.deleteCenter = async (req, res) => {
  try {
    const center = await centerService.deleteCenter(req.params.id);
    if (!center) return res.status(404).json({ message: 'Center not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
