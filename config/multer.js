const path = require('path');
const multer = require('multer');

// === 1️⃣ Upload ảnh người dùng (avatar) ===
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `${req.user?.id || 'guest'}_${Date.now()}${ext}`;
    cb(null, filename);
  },
});

const uploadAvatar = multer({
  storage: avatarStorage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const ext = path.extname(file.originalname).toLowerCase();
    const mime = file.mimetype;
    if (allowedTypes.test(ext) && allowedTypes.test(mime)) cb(null, true);
    else cb(new Error('Chỉ cho phép file ảnh JPG/PNG'));
  },
});

// === 2️⃣ Upload file import Task ===
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/imports/'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `${Date.now()}${ext}`;
    cb(null, filename);
  },
});

const uploadFile = multer({
  storage: fileStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // giới hạn 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /xlsx|xls|csv|json/;
    const ext = path.extname(file.originalname).toLowerCase().substring(1);
    if (allowedTypes.test(ext)) cb(null, true);
    else cb(new Error('Chỉ cho phép file .xlsx, .xls, .csv hoặc .json'));
  },
});

module.exports = { uploadAvatar, uploadFile };
