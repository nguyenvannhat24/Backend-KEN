// 📄 tests/unit/user.test.js
jest.mock("../../middlewares/auth", () => ({
  authenticateAny: (req, res, next) => next(),
  authorizeAny: () => (req, res, next) => next(),
  adminAny: (req, res, next) => next(),
}));

const request = require("supertest");
const express = require("express");
const userRouter = require("../../router/user.routes");

const app = express();
app.use(express.json());
app.use("/api/users", userRouter);

describe("User Routes", () => {
  it("GET /api/users/me should return 401 without auth header", async () => {
    const res = await request(app).get("/api/users/me");
    expect(res.statusCode).toBe(401);
  });
});
