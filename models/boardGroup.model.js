const mongoose_bg = require('mongoose');
const { Schema: Schema_bg } = require('./_shared');


const BoardGroupSchema = new Schema_bg({
board_id: { type: String, ref: 'Board', required: true, index: true },
group_id: { type: String, ref: 'Group', required: true, index: true },
}, { collection: 'board_groups', timestamps: true });


BoardGroupSchema.index({ board_id: 1, group_id: 1 }, { name: 'BoardGroup_index_6', unique: true });


const BoardGroup = mongoose_bg.model('BoardGroup', BoardGroupSchema);
module.exports = BoardGroup;