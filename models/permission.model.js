const mongoose = require('mongoose');



const PermissionSchema = new mongoose.Schema({

code: { type: String, required: true, maxlength: 100, unique: true, index: true },
description: { type: String, maxlength: 300 },
}, { collection: 'Permissions', timestamps: true });



module.exports = mongoose.model('Permission', PermissionSchema);

