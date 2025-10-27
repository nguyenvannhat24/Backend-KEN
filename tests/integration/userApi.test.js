// tests/integration/userApi.test.js
const request = require("supertest");
const express = require("express");

// Mock các middleware
jest.mock("../../middlewares/auth", () => ({
  authenticateAny: (req, res, next) => {
    req.user = { id: "user123", roles: ["admin"] };
    next();
  },
  authorizeAny: () => (req, res, next) => next(),
}));

// Mock controller đầy đủ
jest.mock("../../controllers/user.controller", () => ({
  viewProfile: jest.fn((req, res) => res.json({ username: "nhat" })),
  getMe: jest.fn((req, res) => res.json({ username: "user_one" })),
  updateMyProfile: jest.fn((req, res) =>
    res.json({ _id: req.params.id || "u789", updated: true })
  ),
  changePassword: jest.fn((req, res) => res.json({ success: true })),
  getByEmail: jest.fn((req, res) => res.json({ email: req.params.email })),
  getByName: jest.fn((req, res) => res.json({ name: req.params.name })),
  getByNumberPhone: jest.fn((req, res) =>
    res.json({ phone: req.params.numberphone })
  ),
  SelectAll: jest.fn((req, res) => res.json([{ _id: "u1", username: "nhat" }])),
  create: jest.fn((req, res) =>
    res.status(201).json({ _id: "new_user", ...req.body })
  ),
  update: jest.fn((req, res) =>
    res.json({ _id: req.params.id || "u789", updated: true })
  ),
  delete: jest.fn((req, res) => res.status(204).send()),
  softDelete: jest.fn((req, res) => res.json({ softDeleted: true })),
  restore: jest.fn((req, res) => res.json({ restored: true })),
  getAllWithDeleted: jest.fn((req, res) => res.json([])),
  getAllDeletedRecords: jest.fn((req, res) => res.json([])),
  findUsers: jest.fn((req, res) => res.json([])),
  searchUsers: jest.fn((req, res) => res.json([])),
  cloneUser: jest.fn((req, res) => res.json({ cloned: true })),
  createKeycloakUser: jest.fn((req, res) => res.json({ created: true })),
  createKeycloakUserPassword: jest.fn((req, res) =>
    res.json({ created: true })
  ),
  updateKeycloakUser: jest.fn((req, res) => res.json({ updated: true })),
  getAllKeycloakUsers: jest.fn((req, res) => res.json([])),
  getKeycloakUserById: jest.fn((req, res) => res.json({ id: req.params.id })),
  getKeycloakUserByName: jest.fn((req, res) =>
    res.json({ username: req.params.username })
  ),
  getKeycloakUserByMail: jest.fn((req, res) =>
    res.json({ email: req.params.email })
  ),
  deleteKeycloakUser: jest.fn((req, res) => res.status(204).send()),
  getById: jest.fn((req, res) =>
    res.json({ _id: req.params.id, username: "user_one" })
  ),
}));

const userRouter = require("../../router/user.routes");

describe("🔹 API /api/user", () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use("/api/user", userRouter);
  });

  test("✅ GET /api/user/selectAll", async () => {
    const res = await request(app).get("/api/user/selectAll");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].username).toBe("nhat");
  });

  test("✅ GET /api/user/:id", async () => {
    const res = await request(app).get("/api/user/u123");
    expect(res.status).toBe(200);
    expect(res.body._id).toBe("u123");
    expect(res.body.username).toBe("user_one");
  });

  test("✅ POST /api/user", async () => {
    const newUser = { username: "newbie", email: "newbie@example.com" };
    const res = await request(app).post("/api/user").send(newUser);
    expect(res.status).toBe(201);
    expect(res.body._id).toBe("new_user");
    expect(res.body.username).toBe("newbie");
  });

  test("✅ PUT /api/user/:id", async () => {
    const res = await request(app)
      .put("/api/user/u789")
      .send({ username: "updatedUser" });
    expect(res.status).toBe(200);
    expect(res.body._id).toBe("u789");
    expect(res.body.updated).toBe(true);
  });

  test("✅ DELETE /api/user/:id", async () => {
    const res = await request(app).delete("/api/user/u999");
    expect(res.status).toBe(204);
  });

  test("✅ POST /api/user/getprofile", async () => {
    const res = await request(app).post("/api/user/getprofile");
    expect(res.status).toBe(200);
    expect(res.body.username).toBe("nhat");
  });
});
