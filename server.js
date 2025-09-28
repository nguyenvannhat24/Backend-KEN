const express = require('express');
const app = express();
require('dotenv').config();
const port = process.env.PORT || 3005;
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
const boardRouter = require('./router/board.router');
const boardMemberRouter = require('./router/boardMember.routes');
const groupRoutes = require('./router/group.routes');
const groupMemberRoutes = require('./router/groupMember.routes');

// --- Session setup (for future use) ---
const memoryStore = new session.MemoryStore();
app.use(session({
  secret: process.env.SESSION_SECRET || 'default_session_secret',
  resave: false,
  saveUninitialized: true,
  store: memoryStore
}));

// --- Body parser ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Database connection ---
require('./config/db');

// --- Routes ---
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
}));
//

// Route public (không cần login)
app.use('/api', userRouter());

// Routes cần bảo vệ bằng JWT
app.use('/api/user', user);
app.use('/api/userRole', userRole);
app.use('/api/permission', permissionRoutes);
app.use('/api/role-permissions', rolePermissionRoutes);
app.use('/api/centers', centerRouter);
app.use('/api/userPoints', userPointRouter);
app.use('/api/role', roleRouter);
app.use('/api/boards', boardRouter);
app.use('/api/boardMember',boardMemberRouter );
app.use('/api/groups', groupRoutes);
app.use('/api/groupMember',groupMemberRoutes);
// --- Start server ---
app.listen(port, () => {
  console.log(`✅ Server is running at http://localhost:${port}`);
});
