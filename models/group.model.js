const mongoose = require('mongoose');
const { Schema } = mongoose;

const GroupSchema = new Schema({
  center_id: { type: Schema.Types.ObjectId, ref: 'Center', index: true },
  name: { type: String, required: true, maxlength: 200 },
  description: { type: String, maxlength: 300 },
  deleted_at: { type: Date, default: null }
}, { collection: 'Groups', timestamps: true });

GroupSchema.index({ deleted_at: 1 });

GroupSchema.pre(/^find/, function(next) {
  if (!this.getQuery().deleted_at && !this.getQuery().$or) {
    this.where({ deleted_at: null });
  }
  next();
});

module.exports = mongoose.model('Group', GroupSchema);
