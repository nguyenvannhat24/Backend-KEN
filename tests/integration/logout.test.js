/**
 * 🔹 Integration Test: /api/logout (MongoDB Cloud)
 * Kiểm tra quá trình đăng xuất, thu hồi token và phản hồi API
 */

const request = require("supertest");
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const authRoutes = require("../../router/auth.routes");
const jwt = require("jsonwebtoken");

dotenv.config({ path: ".env.test" });

// Mock bộ nhớ blacklist trong auth.controller
jest.mock("../../controllers/auth.controller", () => {
  const originalModule = jest.requireActual(
    "../../controllers/auth.controller"
  );
  return {
    ...originalModule,
    isTokenBlacklisted: jest.fn(() => false),
    tokenBlacklist: new Set(),
  };
});

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

let app;
let server;
let validToken;
let refreshToken;

beforeAll(async () => {
  console.log("🚀 Kết nối MongoDB Cloud...");
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  app = express();
  app.use(express.json());
  app.use("/api", authRoutes());

  // Tạo token hợp lệ cho test
  validToken = jwt.sign(
    { userId: "68ff72f5e36865ee93ce84d9", email: "testuser@example.com" },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  refreshToken = jwt.sign(
    { userId: "68ff72f5e36865ee93ce84d9" },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  server = app.listen(0); // dùng port ngẫu nhiên để tránh trùng
});

afterAll(async () => {
  await mongoose.connection.close();
  server.close();
  console.log("🧹 Đã đóng kết nối MongoDB và server HTTP.");
});

describe("🔹 Integration Test: /api/logout (MongoDB Cloud)", () => {
  beforeEach(() => {
    // Reset blacklist trước mỗi test để các test không phụ thuộc lẫn nhau
    const { tokenBlacklist } = require("../../controllers/auth.controller");
    tokenBlacklist.clear();
  });
  test("✅ Đăng xuất thành công khi cung cấp token hợp lệ", async () => {
    const res = await request(app)
      .post("/api/logout")
      .set("Authorization", `Bearer ${validToken}`)
      .send({ refreshToken });

    console.log("POST /api/logout response:", res.body);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("success", true);
    expect(res.body).toHaveProperty(
      "message",
      "Đăng xuất thành công. Token đã bị thu hồi."
    );
  });

  test("❌ Đăng xuất thất bại khi không gửi access token", async () => {
    const res = await request(app).post("/api/logout").send({ refreshToken });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("success", false);
    expect(res.body).toHaveProperty(
      "message",
      "Token không hợp lệ hoặc không cung cấp"
    );
  });

  test("❌ Đăng xuất thất bại khi token đã bị thu hồi", async () => {
    const res = await request(app)
      .post("/api/logout")
      .set("Authorization", `Bearer ${validToken}`)
      .send({ refreshToken });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("success", false);
    expect(res.body).toHaveProperty(
      "message",
      "Token đã bị thu hồi. Vui lòng đăng nhập lại."
    );
  });
});
