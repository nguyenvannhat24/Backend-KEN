const mongoose = require('mongoose');
const { Schema } = mongoose;

const TemplateSchema = new Schema({
name: { type: String, maxlength: 200 },
description: { type: String, maxlength: 500 },
created_by: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
created_at: { type: Date, default: Date.now },
updated_at: { type: Date, default: Date.now },
deleted_at: { type: Date, default: null }
}, { collection: 'Templates' });

TemplateSchema.index({ deleted_at: 1 });

TemplateSchema.pre(/^find/, function(next) {
  if (!this.getQuery().deleted_at && !this.getQuery().$or) {
    this.where({ deleted_at: null });
  }
  next();
});

module.exports = mongoose.model('Template', TemplateSchema);