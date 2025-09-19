const mongoose_ap = require('mongoose');
const { uuidString: uuid_ap, Schema: Schema_ap } = require('./_shared');


const AuthProviderSchema = new Schema_ap({
_id: uuid_ap,
user_id: { type: String, ref: 'User', required: true, index: true },
provider: { type: String, required: true, maxlength: 50 },
provider_user_id: { type: String, required: true, maxlength: 200 },
}, { collection: 'auth_providers', timestamps: true });


AuthProviderSchema.index({ provider: 1, provider_user_id: 1 }, { name: 'AuthProvider_index_2', unique: true });


const AuthProvider = mongoose_ap.model('AuthProvider', AuthProviderSchema);
module.exports = AuthProvider;