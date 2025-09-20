const express = require('express');
const app = express();
const port = 3005;
const Keycloak = require('keycloak-connect');
const session = require('express-session');
const userRouter = require("./router/auth.routes");
const user = require('./router/user.routes');
const userRole = require('./router/userRole.router');
const permissionRoutes = require('./router/permission.router');
const rolePermissionRoutes = require('./router/rolePermission.routes');
const centerRouter = require('./router/center.router');
const userPointRouter = require('./router/userPoint.router');
const roleRouter = require('./router/role.router');
// ...
app.use('/api/role-permissions', rolePermissionRoutes);

const memoryStore = new session.MemoryStore();

app.use(session({
  secret: 'some secret',
  resave: false,
  saveUninitialized: true,
  store: memoryStore
}));

const keycloak = new Keycloak({ store: memoryStore });
app.use(keycloak.middleware());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

require('./config/db'); 

// routes
app.use('/api', userRouter(keycloak));
app.use('/api/user', user);
app.use('/api/userRole',userRole);
app.use('/api/permission',permissionRoutes);
app.use('/api/role-permissions', rolePermissionRoutes);
app.use('/api/centers', centerRouter);
app.use('/api/userPoints', userPointRouter);
app.use('/api/role', roleRouter);

app.listen(port, () => {
  console.log(`✅ Server is running at http://localhost:${port}`);
});
