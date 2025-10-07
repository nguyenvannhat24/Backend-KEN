const mongoose = require('mongoose');


const BoardSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  created_by: { type: mongoose.Types.ObjectId, ref: 'User', required: true, index: true },
  is_template: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  deleted_at: { type: Date, default: null }
}, { 
  collection: 'Boards',
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Index for soft delete
BoardSchema.index({ deleted_at: 1 });

// Middleware to filter out soft deleted records
BoardSchema.pre(/^find/, function(next) {
  if (!this.getQuery().deleted_at && !this.getQuery().$or) {
    this.where({ deleted_at: null });
  }
  next();
});

module.exports = mongoose.model('Board', BoardSchema);
