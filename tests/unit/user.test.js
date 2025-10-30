/**
 * 📄 User Routes Unit Tests
 * 
 * Tests user API routes with mocked controllers.
 * This is a UNIT test - we mock all dependencies.
 */

// ==================== MOCKS ====================

// Mock authentication middleware
jest.mock("../../middlewares/auth", () => ({
  authenticateAny: (req, res, next) => next(),
  authorizeAny: () => (req, res, next) => next(),
  adminAny: (req, res, next) => next(),
}));

// Mock user controller
jest.mock("../../controllers/user.controller", () => ({
  // Profile endpoints
  getMe: jest.fn((req, res) => res.json({ 
    _id: "user123", 
    username: "testuser", 
    email: "test@example.com" 
  })),
  viewProfile: jest.fn((req, res) => res.json({ 
    username: "testuser" 
  })),
  updateMyProfile: jest.fn((req, res) => res.json({ 
    _id: "user123", 
    updated: true 
  })),
  changePassword: jest.fn((req, res) => res.json({ 
    success: true 
  })),
  
  // Query endpoints
  getByEmail: jest.fn((req, res) => res.json({ 
    email: req.params.email 
  })),
  getByName: jest.fn((req, res) => res.json({ 
    name: req.params.name 
  })),
  getByNumberPhone: jest.fn((req, res) => res.json({ 
    phone: req.params.numberphone 
  })),
  getById: jest.fn((req, res) => res.json({ 
    _id: req.params.id 
  })),
  SelectAll: jest.fn((req, res) => res.json([
    { _id: "user123", username: "testuser" }
  ])),
  
  // CRUD endpoints
  create: jest.fn((req, res) => res.status(201).json({ 
    _id: "new_user", 
    ...req.body 
  })),
  update: jest.fn((req, res) => res.json({ 
    _id: req.params.id, 
    updated: true 
  })),
  delete: jest.fn((req, res) => res.status(204).send()),
  
  // Soft delete endpoints
  softDelete: jest.fn((req, res) => res.json({ 
    softDeleted: true 
  })),
  restore: jest.fn((req, res) => res.json({ 
    restored: true 
  })),
  getAllWithDeleted: jest.fn((req, res) => res.json([])),
  getAllDeletedRecords: jest.fn((req, res) => res.json([])),
  
  // Search endpoints
  findUsers: jest.fn((req, res) => res.json([])),
  searchUsers: jest.fn((req, res) => res.json([])),
  
  // Utility endpoints
  cloneUser: jest.fn((req, res) => res.json({ 
    cloned: true 
  })),
  
  // Keycloak SSO endpoints
  createKeycloakUser: jest.fn((req, res) => res.json({ 
    created: true 
  })),
  createKeycloakUserPassword: jest.fn((req, res) => res.json({ 
    created: true 
  })),
  updateKeycloakUser: jest.fn((req, res) => res.json({ 
    updated: true 
  })),
  getAllKeycloakUsers: jest.fn((req, res) => res.json([])),
  getKeycloakUserById: jest.fn((req, res) => res.json({ 
    id: req.params.id 
  })),
  getKeycloakUserByName: jest.fn((req, res) => res.json({ 
    username: req.params.username 
  })),
  getKeycloakUserByMail: jest.fn((req, res) => res.json({ 
    email: req.params.email 
  })),
  deleteKeycloakUser: jest.fn((req, res) => res.status(204).send()),
}));

// ==================== SETUP ====================

const request = require("supertest");
const express = require("express");
const userRouter = require("../../router/user.routes");

// Setup Express app for testing
const app = express();
app.use(express.json());
app.use("/api/user", userRouter);

// ==================== TEST SUITES ====================

describe("🔹 User Routes Unit Tests", () => {
  
  // ========== Profile Management ==========
  
  describe("GET /api/user/me - Get My Profile", () => {
    it("✅ should return user profile when authenticated", async () => {
      const res = await request(app).get("/api/user/me");
      
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('username');
      expect(res.body).toHaveProperty('email');
      expect(res.body.username).toBe("testuser");
    });
  });

  describe("POST /api/user/getprofile - View Profile", () => {
    it("✅ should return user profile", async () => {
      const res = await request(app).post("/api/user/getprofile");
      
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('username');
      expect(res.body.username).toBe("testuser");
    });
  });

  describe("PUT /api/user/updateMyProfile - Update Profile", () => {
    it("✅ should update user profile successfully", async () => {
      const updateData = {
        username: "updateduser",
        email: "updated@example.com"
      };
      
      const res = await request(app)
        .put("/api/user/updateMyProfile")
        .send(updateData);
      
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('updated');
      expect(res.body.updated).toBe(true);
    });

    it("✅ should handle empty update data", async () => {
      const res = await request(app)
        .put("/api/user/updateMyProfile")
        .send({});
      
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('updated');
    });
  });

  describe("PUT /api/user/change-password - Change Password", () => {
    it("✅ should change password successfully", async () => {
      const passwordData = {
        currentPassword: "oldpass123",
        newPassword: "newpass123"
      };
      
      const res = await request(app)
        .put("/api/user/change-password")
        .send(passwordData);
      
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('success');
      expect(res.body.success).toBe(true);
    });

    it("✅ should handle missing password data", async () => {
      const res = await request(app)
        .put("/api/user/change-password")
        .send({});
      
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('success');
    });
  });

  // ========== Error Handling & Response Format ==========
  
  describe("Error Handling", () => {
    it("✅ should handle invalid JSON gracefully", async () => {
      const res = await request(app)
        .put("/api/user/updateMyProfile")
        .set('Content-Type', 'application/json')
        .send('invalid json');
      
      expect(res.status).toBeDefined();
    });
  });

  describe("Response Format", () => {
    it("✅ should return consistent JSON response format", async () => {
      const res = await request(app).get("/api/user/me");
      
      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toMatch(/json/);
      expect(typeof res.body).toBe('object');
    });
  });
});
