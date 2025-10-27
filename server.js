const express = require("express");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 3005;
const Keycloak = require("keycloak-connect");
const session = require("express-session");
const cors = require("cors");
const http = require("http");
const userRouter = require("./router/auth.routes");
const user = require("./router/user.routes");
const userRole = require("./router/userRole.router");
const centerRouter = require("./router/center.router");
const userPointRouter = require("./router/userPoint.router");
const roleRouter = require("./router/role.router");
const boardRouter = require("./router/board.router");
const templateRouter = require("./router/template.router");
const boardMemberRouter = require("./router/boardMember.routes");
const groupRoutes = require("./router/group.routes");
const groupMemberRoutes = require("./router/groupMember.routes");
const templateColumn = require("./router/templateColumn.router");
const templateSwimlaneRouter = require("./router/templateSwimlane.router");
const columnRouter = require("./router/column.routes");
const swimlaneRoutes = require("./router/swimlane.routes");
const taskRoutes = require("./router/task.routes");
const tagRoutes = require("./router/tag.routes");
const commentRoutes = require("./router/comment.routes");
const importRoutes = require("./router/import.routes");
const permissionRoutes = require("./router/permission.routes");
const RolePermissionRoutes = require("./router/rolePermission.routes");
const taskTag = require("./router/taskTag.routes");
const uploadImg = require("./router/uploadimg.router");
const taskImportRoutes = require("./router/taskImport.routes");
const analyticsRoutes = require("./router/analytics.routes");
const memoryStore = new session.MemoryStore();
const CenterMember = require("./router/centerMember.route");
const notificationRouter = require("./router/notification.routes");
const { initSocket } = require("./config/socket");
app.use(
  session({
    secret: "some secret",
    resave: false,
    saveUninitialized: true,
    store: memoryStore,
  })
);

// Khởi tạo Keycloak (đọc từ ENV)
const keycloakConfig = {
  realm: process.env.KEYCLOAK_REALM || "myrealm",
  "auth-server-url":
    process.env.KEYCLOAK_AUTH_URL || "http://localhost:9090/auth",
  "ssl-required": process.env.KEYCLOAK_SSL_REQUIRED || "external",
  resource: process.env.KEYCLOAK_RESOURCE || "my-app",
  "public-client": (process.env.KEYCLOAK_PUBLIC_CLIENT || "true") === "true",
  "confidential-port": Number(process.env.KEYCLOAK_CONFIDENTIAL_PORT || 0),
};
const keycloak = new Keycloak({ store: memoryStore }, keycloakConfig);

app.use(keycloak.middleware());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

require("./config/db");

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
  })
);
//

// Route public (không cần login)
app.use("/api", userRouter(keycloak));

// Admin route for viewing all deleted records
const userController = require("./controllers/user.controller");
const { authenticateAny, authorizeAny } = require("./middlewares/auth");
app.get(
  "/api/admin/deleted",
  authenticateAny,
  authorizeAny("admin System_Manager"),
  userController.getAllDeletedRecords
);

app.use("/api/user", user);
app.use("/api/userRole", userRole);

app.use("/api/centers", centerRouter);
app.use("/api/userPoints", userPointRouter);
app.use("/api/role", roleRouter);
app.use("/api/boards", boardRouter);
app.use("/api/templates", templateRouter);
app.use("/api/boardMember", boardMemberRouter);
app.use("/api/groups", groupRoutes);
app.use("/api/groupMember", groupMemberRoutes);
app.use("/api/templateColumn", templateColumn);
app.use("/api/templateSwimlane", templateSwimlaneRouter);
app.use("/api/column", columnRouter);
app.use("/api/swimlanes", swimlaneRoutes);
app.use("/api/tasks", taskRoutes);

app.use("/api/tags", tagRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/import", importRoutes);
app.use("/api/taskTag", taskTag);

app.use("/api/permission", permissionRoutes);
app.use("/api/RolePermission", RolePermissionRoutes);
app.use("/api/CenterMember", CenterMember);

app.use("/api/user", user);
app.use("/api/img", uploadImg);
app.use("/api/tasks", taskImportRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/uploads", express.static("uploads"));
app.use("/api/notification", notificationRouter);
// --- Start server ---
const server = http.createServer(app); // Tạo HTTP server từ Express
initSocket(server);
server.listen(port, () => {
  console.log(`✅ Server is running on port ${port}`);
});
