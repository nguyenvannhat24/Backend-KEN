const mongoose = require('mongoose');
const { Schema } = mongoose;

const GroupSchema = new Schema({
  center_id: { type: Schema.Types.ObjectId, ref: 'Center', index: true },
  name: { type: String, required: true, maxlength: 200 },
  description: { type: String, maxlength: 300 },
  deleted_at: { type: Date, default: null }
}, { collection: 'Groups', timestamps: true });

// Index for soft delete
GroupSchema.index({ deleted_at: 1 });

// Middleware to filter soft-deleted records
GroupSchema.pre(/^find/, function(next) {
  const query = this.getQuery();
  if (!query.hasOwnProperty('deleted_at') && !query.$or) {
    this.where({ deleted_at: null });
  }
  next();
});

module.exports = mongoose.model('Group', GroupSchema);
