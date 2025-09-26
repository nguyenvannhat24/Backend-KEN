const KcAdminClient = require('keycloak-admin').default;

const kcAdminClient = new KcAdminClient({
  baseUrl: 'https://id.dev.codegym.vn/auth',
  realmName: 'codegym-software-nhom-6',
});

const loginAdmin = async () => {
  try {
    await kcAdminClient.auth({
      username: 'adminsoftwarenhom6@codegym.vn',
      password: '123456@Abc',
      grantType: 'password',
      clientId: 'admin-cli',
    });
    console.log('✅ Admin login thành công');
  } catch (err) {
    console.error('❌ Admin login thất bại:', err);
    throw err;
  }
};

module.exports = { kcAdminClient, loginAdmin };
