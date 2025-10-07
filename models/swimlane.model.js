const mongoose = require('mongoose');
const { Schema } = mongoose;

const SwimlaneSchema = new Schema({
  board_id: { type: Schema.Types.ObjectId, ref: 'Board', required: true, index: true },
  name: { type: String, required: true, maxlength: 100 },
  order: { type: Number, required: true },
  collapsed: { type: Boolean, default: false },
  deleted_at: { type: Date, default: null }
}, { collection: 'Swimlanes', timestamps: true });

SwimlaneSchema.index({ deleted_at: 1 });

SwimlaneSchema.pre(/^find/, function(next) {
  if (!this.getQuery().deleted_at && !this.getQuery().$or) {
    this.where({ deleted_at: null });
  }
  next();
});

module.exports = mongoose.model('Swimlane', SwimlaneSchema);