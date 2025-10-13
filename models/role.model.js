const mongoose = require('mongoose');

const RoleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    maxlength: 50
  },
  description: {
    type: String,
    trim: true,
    maxlength: 300
  }
}, {
  collection: 'Roles',
  timestamps: true
});

RoleSchema.index({ createdAt: -1 });

// Virtual để đếm số users có role này
RoleSchema.virtual('userCount', {
  ref: 'UserRole',
  localField: '_id',
  foreignField: 'role_id',
  count: true
});

// Ensure virtual fields are serialized
RoleSchema.set('toJSON', { virtuals: true });
RoleSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Role', RoleSchema);
