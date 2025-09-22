const express = require('express');
const app = express();
const port = 3005;
const Keycloak = require('keycloak-connect');
const session = require('express-session');
const cors = require("cors");
// Routers
const userRouter = require("./router/auth.routes");
const user = require('./router/user.routes');
const userRole = require('./router/userRole.router');
const permissionRoutes = require('./router/permission.router');
const rolePermissionRoutes = require('./router/rolePermission.routes');
const centerRouter = require('./router/center.router');
const userPointRouter = require('./router/userPoint.router');
const roleRouter = require('./router/role.router');

// --- Keycloak setup ---
const memoryStore = new session.MemoryStore();
app.use(session({
  secret: 'some secret',
  resave: false,
  saveUninitialized: true,
  store: memoryStore
}));

// Khởi tạo Keycloak
const keycloakConfig = {
  "realm": "myrealm",
  "auth-server-url": "http://localhost:9090/auth",
  "ssl-required": "external",
  "resource": "my-app",
  "public-client": true,
  "confidential-port": 0
};
const keycloak = new Keycloak({ store: memoryStore }, keycloakConfig);

// Middleware Keycloak
app.use(keycloak.middleware());

// --- Body parser ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Database connection ---
require('./config/db');

// --- Routes ---
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));
//

// Route public (không cần login)
app.use('/api', userRouter(keycloak));

// Routes cần bảo vệ bằng Keycloak
app.use('/api/user', keycloak.protect(), user);
app.use('/api/userRole', keycloak.protect(), userRole);
app.use('/api/permission', keycloak.protect(), permissionRoutes);
app.use('/api/role-permissions', keycloak.protect(), rolePermissionRoutes);
app.use('/api/centers', keycloak.protect(), centerRouter);
app.use('/api/userPoints', keycloak.protect(), userPointRouter);
app.use('/api/role', keycloak.protect(), roleRouter);


// --- Start server ---
app.listen(port, () => {
  console.log(`✅ Server is running at http://localhost:${port}`);
});
