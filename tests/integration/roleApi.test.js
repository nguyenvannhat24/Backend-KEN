// tests/integration/loginApi.test.js
const request = require("supertest");
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
const http = require("http");

dotenv.config({ path: ".env.test" });
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
      app.use("/api/role", roleRouter);
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
  describe("POST /api/role/", () => {
    test("test tạo role thành công ", async () => {
      const data = {
        name: "roletest",
        description: "test thêm role",
      };
      const res = await request(app).post("/api/role/").send(data);
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body).toHaveProperty("message", "Tạo role thành công");
      expect(res.body.data).toHaveProperty("name", "roletest");
    });

    test("test tạo role thiếu tên role ", async () => {
      const data = {
        description: "test thêm role",
      };
      const res = await request(app).post("/api/role/").send(data);
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("success", false);
      expect(res.body).toHaveProperty("message", "Tên role là bắt buộc");
    });

    test("test tạo role đã có tên trong database ", async () => {
      const data = {
        name: "roletest",
        description: "test thêm role",
      };
      const user = await roleModel.create({
        name: "roletest",
      });
      const res = await request(app).post("/api/role/").send(data);

      expect(res.body).toHaveProperty("success", false);
      expect(res.body).toHaveProperty(
        "message",
        "Không thể tạo role Tên role đã tồn tại"
      );
    });

    test("test cập nhật role đã có tên trong database ", async () => {
      const dataUpdate = {
        name: "roletest1",
      };
      const user = await roleModel.create({
        _id: "68f04aa8a8d72d344f0b9156",
        name: "roletest",
        description: "test thêm role",
      });
      const res = await request(app)
        .put("/api/role/68f04aa8a8d72d344f0b9156")
        .send(dataUpdate);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body).toHaveProperty("message", "Cập nhật role thành công");
      const updatedRole = await roleModel.findById("68f04aa8a8d72d344f0b9156");
      expect(updatedRole.name).toBe("roletest1");
      expect(res.body.data.data.name).toBe("roletest1");
    });

    test("test cập nhật role ko có trong database ", async () => {
      const dataUpdate = {
        name: "roletest1",
      };

      const res = await request(app)
        .put("/api/role/68f04aa8a8d72d344f0b9156")
        .send(dataUpdate);

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("success", false);
      expect(res.body).toHaveProperty(
        "message",
        "Không tìm thấy role với ID này"
      );
    });

    test("test cập nhật role đã có tên trong database ", async () => {
      const dataUpdate = {
        name: "roletest2",
      };
      const role1 = await roleModel.create({
        _id: "68f04aa8a8d72d344f0b9156",
        name: "roletest1",
        description: "test thêm role",
      });
      const role2 = await roleModel.create({
        _id: "68f04aa8a8d72d344f0b9151",
        name: "roletest2",
        description: "test thêm role",
      });
      const res = await request(app)
        .put("/api/role/68f04aa8a8d72d344f0b9156")
        .send(dataUpdate);

      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty("success", false);
    });

    test("xóa role với dữ liệu đúng ", async () => {
      const role = await roleModel.create({
        _id: "68f04aa8a8d72d344f0b9151",
        name: "roletest2",
        description: "test thêm role",
      });
      const res = await request(app).delete(
        "/api/role/68f04aa8a8d72d344f0b9151"
      );

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
    });

    test("xóa role với dữ liệu đúng id ko có trên databe ", async () => {
      const res = await request(app).delete(
        "/api/role/68f04aa8a8d72d344f0b9151"
      );

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("success", false);
    });

    test("xóa role với dữ liệu đúng sai id", async () => {
      const res = await request(app).delete("/api/role/adds");
      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty("success", false);
    });

    test("lấy role theo tên", async () => {
      const role = await roleModel.create({
        _id: "68f04aa8a8d72d344f0b9151",
        name: "roletest2",
        description: "test thêm role",
      });
      const res = await request(app).get("/api/role/name/roletest2");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body.data).toHaveProperty("name", "roletest2");
    });

    test("lấy role theo tên ko có trong database", async () => {
      const res = await request(app).get("/api/role/name/roletest2");
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("success", false);
    });

    test("lấy role theo tên nhưng ko truyền tên vào", async () => {
      const role = await roleModel.create({
        _id: "68f04aa8a8d72d344f0b9151",
        name: "roletest2",
        description: "test thêm role",
      });
      const res = await request(app).get("/api/role/name/");
      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty("success", false);
    });

    test("lấy role theo tên nhưng ko đúng tên", async () => {
      const role = await roleModel.create({
        _id: "68f04aa8a8d72d344f0b9151",
        name: "roletest2",
        description: "test thêm role",
      });
      const res = await request(app).get("/api/role/name/roletest");
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("success", false);
    });

    test("lấy tất cả role", async () => {
      const role = await roleModel.create({
        _id: "68f04aa8a8d72d344f0b9151",
        name: "roletest2",
        description: "test thêm role",
      });
      await roleModel.create({
        _id: "68f04aa8a8d72d344f0b9152",
        name: "roletest1",
        description: "test thêm role",
      });
      await roleModel.create({
        _id: "68f04aa8a8d72d344f0b9153",
        name: "roletest3",
        description: "test thêm role",
      });

      const res = await request(app).get("/api/role/");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    test("lấy role của user", async () => {
      await roleModel.create({
        _id: "68f04aa8a8d72d344f0b9152",
        name: "roletest1",
        description: "test thêm role",
      });
      await usersModel.create({
        _id: "68f04aa8a8d72d344f0b9151",
        full_name: "nguyễn văn nhất",
        email: "nhatx5xxx@gmail.com",
        username: "vannhat",
        password_hash: "1234567",
        status: "active",
      });
      await userRole.create({
        user_id: "68f04aa8a8d72d344f0b9151",
        role_id: "68f04aa8a8d72d344f0b9152",
      });
      const res = await request(app).get("/api/role/my-role");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body.data.includes("roletest1")).toBe(true);
    });

    test("lấy role của user ko co role", async () => {
      await roleModel.create({
        _id: "68f04aa8a8d72d344f0b9152",
        name: "roletest1",
        description: "test thêm role",
      });
      await usersModel.create({
        _id: "68f04aa8a8d72d344f0b9151",
        full_name: "nguyễn văn nhất",
        email: "nhatx5xxx@gmail.com",
        username: "vannhat",
        password_hash: "1234567",
        status: "active",
      });

      const res = await request(app).get("/api/role/my-role");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBe(0);
    });
  });
});
