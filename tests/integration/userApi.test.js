// tests/integration/userApi.test.js
const request = require("supertest");
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");

dotenv.config({ path: ".env.test" });

const userRouter = require("../../router/user.routes");
const roleRouter = require("../../router/role.router");
const User = require("../../models/usersModel");
const Role = require("../../models/role.model");

// Mock middleware auth
jest.mock("../../middlewares/auth", () => ({
  authenticateAny: (req, res, next) => {
    req.user = {
      id: global.testUserId,
      roles: ["admin", "System_Manager", "ROLE_CREATE", "USER_CREATE"],
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

// Mock services
jest.mock("../../services/keycloak.service", () => ({
  createUserWithPassword: jest.fn().mockResolvedValue({
    id: "keycloak123",
    username: "newbie",
    email: "newbie@example.com",
  }),
  getUsers: jest
    .fn()
    .mockResolvedValue([
      { id: "keycloak123", username: "newbie", email: "newbie@example.com" },
    ]),
}));

jest.mock("../../services/userRole.service", () => ({
  create: jest.fn().mockResolvedValue({}),
  getRoles: jest.fn().mockResolvedValue([{ role_id: { name: "user" } }]),
}));

jest.mock("../../services/centerMember.service", () => ({
  getCentersByUser: jest.fn().mockResolvedValue([]),
}));

// Thêm mock cho roleService
jest.mock("../../services/role.service", () => ({
  getIdByName: jest.fn().mockResolvedValue("role123"),
  createRole: jest.fn().mockImplementation(async (roleData) => {
    const Role = require("../../models/role.model");
    return await Role.create(roleData);
  }),
  getRoleByName: jest.fn().mockResolvedValue({ _id: "role123", name: "user" }),
}));

// Mock node-cron to prevent open handles
jest.mock("node-cron", () => ({
  schedule: jest.fn(),
}));

describe("🔹 Integration Test: /api (MongoDB Cloud)", () => {
  let app;

  beforeAll(async () => {
    try {
      await mongoose.connect(process.env.MONGO_URI);
      app = express();
      app.use(express.json());
      app.use("/api/user", userRouter);
      app.use("/api/role", roleRouter);
      console.log("✅ Đã kết nối MongoDB Cloud thành công!");
    } catch (err) {
      console.error("❌ Lỗi khi kết nối MongoDB:", err);
      throw err;
    }
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    await User.deleteMany({});
    await Role.deleteMany({});
    const user = await User.create({
      username: "nhat",
      email: "nhat@example.com",
      status: "active",
      typeAccount: "Local",
      password_hash: await bcrypt.hash("password123", 10),
    });
    global.testUserId = user._id.toString();
  });

  afterEach(async () => {
    await User.deleteMany({});
    await Role.deleteMany({});
  });

  afterAll(async () => {
    try {
      await mongoose.connection.close();
      console.log("🧹 Đã đóng kết nối MongoDB sau khi test xong.");
    } catch (err) {
      console.error("❌ Lỗi khi đóng kết nối MongoDB:", err);
    }
  });

  describe("POST /api/user", () => {
    test("✅ Tạo user mới", async () => {
      const newUser = {
        username: "newbie",
        email: "newbie@example.com",
        full_name: "Newbie User",
        password: "password123",
        status: "active",
        roles: ["user"],
      };
      const res = await request(app).post("/api/user").send(newUser);
      console.log(
        "POST /api/user response:",
        JSON.stringify(res.body, null, 2)
      );
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body.data).toHaveProperty("username", "newbie");
      expect(res.body.data).toHaveProperty("email", "newbie@example.com");

      const checkInDb = await User.findOne({ username: "newbie" });
      expect(checkInDb).not.toBeNull();
      expect(checkInDb.email).toBe("newbie@example.com");
    });
  });

  describe("GET /api/user/selectAll", () => {
    test("✅ Trả danh sách người dùng", async () => {
      const res = await request(app).get("/api/user/selectAll");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
      expect(Array.isArray(res.body.users)).toBe(true);
      expect(res.body.users).toHaveLength(1);
      expect(res.body.users[0]).toHaveProperty("username", "nhat");
    });
  });

  describe("POST /api/role", () => {
    test("✅ Tạo role mới", async () => {
      const newRole = {
        name: "test-role-" + Date.now(),
        description: "Role người dùng",
      };
      const res = await request(app).post("/api/role").send(newRole);
      console.log(
        "POST /api/role response:",
        JSON.stringify(res.body, null, 2)
      );
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body.data).toHaveProperty("name", newRole.name);
      expect(res.body.data).toHaveProperty("description", "Role người dùng");

      const checkInDb = await Role.findOne({ name: newRole.name });
      expect(checkInDb).not.toBeNull();
      expect(checkInDb.description).toBe("Role người dùng");
    });
  });
});
