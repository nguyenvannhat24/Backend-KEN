const mongoose_tt = require('mongoose');
const { Schema: Schema_tt } = require('./_shared');


const TaskTagSchema = new Schema_tt({
task_id: { type: String, ref: 'Task', required: true, index: true },
tag_id: { type: String, ref: 'Tag', required: true, index: true },
}, { collection: 'task_tags', timestamps: true });


TaskTagSchema.index({ task_id: 1, tag_id: 1 }, { name: 'TaskTag_index_8', unique: true });


const TaskTag = mongoose_tt.model('TaskTag', TaskTagSchema);
module.exports = TaskTag;

