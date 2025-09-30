const KcAdminClient = require('keycloak-admin').default;
const dotenv = require('dotenv');

dotenv.config();

const kcAdminClient = new KcAdminClient({
  baseUrl: process.env.KEYCLOAK_BASE_URL,
  realmName: process.env.KEYCLOAK_REALM,
});

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

// 🟢 CREATE
async function createUser(userData) {
  try {
    const newUser = await kcAdminClient.users.create(userData);
    console.log("✅ User created:", newUser);
    return newUser;
  } catch (err) {
    console.error("❌ Create user failed:", err);
    throw err;
  }
}

// 🔵 READ
async function getUsers(query = {}) {
  try {
    return await kcAdminClient.users.find(query);
  } catch (err) {
    console.error("❌ Get users failed:", err);
    throw err;
  }
}

async function getUserById(userId) {
  try {
    return await kcAdminClient.users.findOne({ id: userId });
  } catch (err) {
    console.error("❌ Get user by ID failed:", err);
    throw err;
  }
}

// 🟡 SEARCH by email
async function getUserByEmail(email) {
  try {
    const users = await kcAdminClient.users.find({ email });
    return users; // Keycloak trả về mảng
  } catch (err) {
    console.error("❌ Get user by Email failed:", err);
    throw err;
  }
}

// 🟡 SEARCH by username
async function getUserByUsername(username) {
  try {
    const users = await kcAdminClient.users.find({ username });
    return users; // cũng trả về mảng
  } catch (err) {
    console.error("❌ Get user by Username failed:", err);
    throw err;
  }
}

// 🟠 UPDATE
async function updateUser(userId, updatedInfo) {
  try {
    return await kcAdminClient.users.update({ id: userId }, updatedInfo);
  } catch (err) {
    console.error("❌ Update user failed:", err);
    throw err;
  }
}

// 🔴 DELETE
async function deleteUser(userId) {
  try {
    await kcAdminClient.users.del({ id: userId });
    console.log("✅ User deleted:", userId);
  } catch (err) {
    console.error("❌ Delete user failed:", err);
    throw err;
  }
}

// 🧪 TEST CONNECTION
async function testConnection() {
  try {
    const users = await kcAdminClient.users.find({ max: 2 });
    console.log('✅ Keycloak connection OK, sample users:', users.map(u => u.username));
  } catch (err) {
    console.error('❌ Keycloak connection test failed:', err);
  }
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
