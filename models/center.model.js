const mongoose_center = require('mongoose');

const CenterSchema = new mongoose_center.Schema({

name: { type: String, required: true, maxlength: 200, index: true },
address: { type: String, maxlength: 300 },
}, { collection: 'Centers', timestamps: true });


const Center = mongoose_center.model('Center', CenterSchema);
module.exports = Center;