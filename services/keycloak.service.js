const KcAdminClient = require('keycloak-admin').default;
const dotenv = require('dotenv');

dotenv.config();

const kcAdminClient = new KcAdminClient({
  baseUrl: process.env.KEYCLOAK_BASE_URL,
  realmName: process.env.KEYCLOAK_REALM,
});

// 🔑 INIT & AUTH
async function initKeycloak() {
  try {
    await kcAdminClient.auth({
      username: process.env.KEYCLOAK_ADMIN_USERNAME,
      password: process.env.KEYCLOAK_ADMIN_PASSWORD,
      grantType: 'password',
      clientId: 'admin-cli',
    });
    console.log('✅ Keycloak admin authenticated');
  } catch (err) {
    console.error('❌ Keycloak admin auth failed:', err);
    throw err;
  }
}

// 🔄 Kiểm tra token expired
function isTokenExpired(token) {
  if (!token) return true;
  const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
  const now = Math.floor(Date.now() / 1000);
  return payload.exp < now + 10; // refresh trước 10s
}

// 🔄 Refresh token nếu cần
async function refreshTokenIfNeeded() {
  if (!kcAdminClient.accessToken || isTokenExpired(kcAdminClient.accessToken)) {
    console.log('🔄 Refreshing admin token...');
    await initKeycloak();
  }
}

// 🔁 Wrapper retry khi gặp 401
async function withRetry(fn) {
  try {
    await refreshTokenIfNeeded();
    return await fn();
  } catch (err) {
    // nếu lỗi 401, refresh token và retry 1 lần
    if (err.response && err.response.status === 401) {
      console.log('⚠️ 401 detected, retrying after refresh...');
      await refreshTokenIfNeeded();
      return await fn();
    }
    throw err;
  }
}

// 🟢 CREATE USER
async function createUser(userData) {
  return withRetry(() => kcAdminClient.users.create(userData));
}

// 🔵 GET USERS
async function getUsers(query = {}) {
  return withRetry(() => kcAdminClient.users.find(query));
}

// 🔵 GET USER BY ID
async function getUserById(userId) {
  return withRetry(() => kcAdminClient.users.findOne({ id: userId }));
}

// 🔵 GET USER BY USERNAME
async function getUserByUsername(username) {
  return withRetry(() => kcAdminClient.users.find({ username }));
}

// 🔵 GET USER BY EMAIL
async function getUserByEmail(email) {
  return withRetry(() => kcAdminClient.users.find({ email }));
}

// 🟠 UPDATE USER
async function updateUser(userId, updatedInfo) {
  return withRetry(() => kcAdminClient.users.update({ id: userId }, updatedInfo));
}

// 🔴 DELETE USER
async function deleteUser(userId) {
  return withRetry(() => kcAdminClient.users.del({ id: userId }));
}

// 🧪 TEST CONNECTION
async function testConnection() {
  const users = await getUsers({ max: 2 });
  console.log('✅ Keycloak connection OK, sample users:', users.map(u => u.username));
}

module.exports = {
  initKeycloak,
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  testConnection,
  getUserByUsername,
  getUserByEmail
};
