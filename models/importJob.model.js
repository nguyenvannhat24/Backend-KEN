const mongoose_ij = require('mongoose');
const { uuidString: uuid_ij, Schema: Schema_ij } = require('./_shared');


const ImportJobSchema = new Schema_ij({
_id: uuid_ij,
board_id: { type: String, ref: 'Board', required: true, index: true },
file_name: { type: String, maxlength: 260 },
status: { type: String, maxlength: 20 },
created_by: { type: String, ref: 'User', required: true, index: true },
created_at: { type: Date, default: Date.now },
finished_at: { type: Date },
error_message: { type: String, maxlength: 1000 },
}, { collection: 'import_jobs' });


const ImportJob = mongoose_ij.model('ImportJob', ImportJobSchema);
module.exports = ImportJob;