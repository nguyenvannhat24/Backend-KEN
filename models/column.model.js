const mongoose_col = require('mongoose');
const { uuidString: uuid_col, Schema: Schema_col } = require('./_shared');


const ColumnSchema = new Schema_col({
_id: uuid_col,
board_id: { type: String, ref: 'Board', required: true, index: true },
name: { type: String, required: true, maxlength: 100 },
order_index: { type: Number, required: true },
}, { collection: 'columns', timestamps: true });


const Column = mongoose_col.model('Column', ColumnSchema);
module.exports = Column;