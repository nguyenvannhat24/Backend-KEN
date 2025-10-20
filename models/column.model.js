const mongoose = require('mongoose');
const { Schema } = mongoose;

const ColumnSchema = new Schema({
  board_id: { type: Schema.Types.ObjectId, ref: 'Board', required: true, index: true },
  name: { type: String, required: true, maxlength: 100 },
  order: { type: Number, required: true },
  isDoneColumn: { type: Boolean, default: false },
  deleted_at: { type: Date, default: null }
}, { collection: 'Columns', timestamps: true });


ColumnSchema.index({ deleted_at: 1 });

ColumnSchema.pre(/^find/, function(next) {
  const query = this.getQuery();
  if (!query.hasOwnProperty('deleted_at') && !query.$or) {
    this.where({ deleted_at: null });
  }
  next();
});

module.exports = mongoose.model('Column', ColumnSchema);
