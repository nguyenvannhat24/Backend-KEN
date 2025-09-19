const mongoose_cmt = require('mongoose');
const { uuidString: uuid_cmt, Schema: Schema_cmt } = require('./_shared');


const CommentSchema = new Schema_cmt({
_id: uuid_cmt,
task_id: { type: String, ref: 'Task', required: true, index: true },
user_id: { type: String, ref: 'User', required: true, index: true },
content: { type: String },
created_at: { type: Date, default: Date.now },
}, { collection: 'comments' });


const Comment = mongoose_cmt.model('Comment', CommentSchema);
module.exports = Comment;