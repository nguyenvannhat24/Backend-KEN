const mongoose_bm = require('mongoose');
const { Schema } = mongoose_bm;


const BoardMemberSchema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  board_id: { type: Schema.Types.ObjectId, ref: 'Board', required: true, index: true },
  role_in_board: { type: String, maxlength: 30 },
}, { collection: 'board_members', timestamps: true });


BoardMemberSchema.index({ user_id: 1, board_id: 1 }, { name: 'BoardMember_index_5', unique: true });


const BoardMember = mongoose_bm.model('BoardMember', BoardMemberSchema);
module.exports = BoardMember;