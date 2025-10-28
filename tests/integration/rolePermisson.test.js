// tests/integration/loginApi.test.js
const request = require("supertest");
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
const http = require("http");

dotenv.config({ path: ".env.test" });

const RolePermissionRoutes = require("../../router/rolePermission.routes");
const RolePermissionModel = require("../../models/rolePermission.model");
const permissionModel = require("../../models/Permission.model");
const roleRouter = require("../../router/role.router");
const Role = require("../../models/role.model");
const roleModel = require("../../models/role.model");
const usersModel = require("../../models/usersModel");
const userRole = require("../../models/userRole.model");
// Mock middleware auth
jest.mock("../../middlewares/auth", () => ({
  authenticateAny: (req, res, next) => {
    req.user = {
      id: "68f04aa8a8d72d344f0b9151",
      roles: [
        "admin",
        "System_Manager",
        "ROLE_CREATE",
        "USER_CREATE",
        "ROLE_CREATE",
        "ROLE_UPDATE",
        "ROLE_DELETE",
        "ROLE_VIEW",
        "ROLE_VIEW",
      ],
      email: "admin@example.com",
      username: "admin",
    };
    next();
  },
  authorizeAny: (requiredRoles) => (req, res, next) => {
    const userRoles = req.user?.roles || [];
    const hasPermission = requiredRoles
      .split(" ")
      .some((role) => userRoles.includes(role));
    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: `Yêu cầu quyền: ${requiredRoles}`,
      });
    }
    next();
  },
}));
//
describe("🔹 Integration Test: /api/login (MongoDB Cloud)", () => {
  beforeAll(async () => {
    try {
      if (!process.env.MONGO_URI) {
        throw new Error("MONGO_URI không được định nghĩa trong .env.test");
      }
      await mongoose.connect(process.env.MONGO_URI);
      app = express();
      app.use(express.json());
      app.use("/api/RolePermission", RolePermissionRoutes);
      server = http.createServer(app); // Tạo server HTTP
      console.log("✅ Đã kết nối MongoDB Cloud thành công!");
    } catch (err) {
      console.error("❌ Lỗi khi kết nối MongoDB:", err);
      throw err;
    }
  });
  afterEach(async () => {
    await Role.deleteMany({});
    await usersModel.deleteMany({});
    await roleModel.deleteMany({});
    await userRole.deleteMany({});
    await permissionModel.deleteMany({});
    await RolePermissionModel.deleteMany({});
  });

  afterAll(async () => {
    try {
      await mongoose.connection.close();
      if (server) {
        await new Promise((resolve) => server.close(resolve)); // Đóng server HTTP
      }
      console.log("🧹 Đã đóng kết nối MongoDB và server HTTP.");
    } catch (err) {
      console.error("❌ Lỗi khi đóng kết nối MongoDB hoặc server:", err);
    }
  });
  test("test tạo role permisson ", async () => {
    const data = {
      role_id: "68f856cdfedbdcb519d52451",
      permission_id: "68f856cdfedbdcb519d52451",
    };

    const res = await request(app).post("/api/RolePermission").send(data);
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("success", true);
    expect(res.body.data).toHaveProperty(
      "permission_id",
      "68f856cdfedbdcb519d52451"
    );
    expect(res.body.data).toHaveProperty("role_id", "68f856cdfedbdcb519d52451");
  });
  test("test tạo role permisson nhưng id không đúng ", async () => {
    const data = {
      role_id: "68f856cdfedbdcb519d524513r",
      permission_id: "68f856cdfedbdcb519d52451",
    };

    const res = await request(app).post("/api/RolePermission").send(data);
    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty("success", false);
    //  expect(res.body.data).toHaveProperty("description", "Role test");
  });
  test("test tạo role permisson thiếu trường truyền vào ", async () => {
    const data = {
      permission_id: "68f856cdfedbdcb519d52451",
    };

    const res = await request(app).post("/api/RolePermission").send(data);
    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty("success", false);
    //  expect(res.body.data).toHaveProperty("description", "Role test");
  });
  test("test get rolePermisson theo id", async () => {
    await RolePermissionModel.create({
      _id: "68f856cdfedbdcb519d52451",
      role_id: "68f856cdfedbdcb519d52451",
      permission_id: "68f856cdfedbdcb519d52451",
    });

    const res = await request(app).get(
      "/api/RolePermission/68f856cdfedbdcb519d52451"
    );

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("success", true);
    expect(res.body.data).toHaveProperty("_id", "68f856cdfedbdcb519d52451");
  });
  test("test get rolePermisson theo id nhưng sai id trên pamate", async () => {
    await RolePermissionModel.create({
      _id: "68f856cdfedbdcb519d52451",
      role_id: "68f856cdfedbdcb519d52451",
      permission_id: "68f856cdfedbdcb519d52451",
    });

    const res = await request(app).get(
      "/api/RolePermission/68f856cdfedbdscb519d52451"
    );

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty("success", false);
    //expect(res.body.data).toHaveProperty("_id", "68f856cdfedbdcb519d52451");
  });
});
