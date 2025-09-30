const express = require("express");
const router = express.Router();
const templateColumnController = require("../controllers/templateColumn.controller");
const { authenticateAny, authorizeAny, adminAny } = require('../middlewares/auth');
// CRUD routes
router.post("/", (req, res) => templateColumnController.create(req, res));
router.get("/", (req, res) => templateColumnController.getAll(req, res));
router.get("/:id", (req, res) => templateColumnController.getById(req, res));
router.get("/template/:templateId", (req, res) => templateColumnController.getByTemplate(req, res));
router.put("/:id", (req, res) => templateColumnController.update(req, res));
router.delete("/:id", (req, res) => templateColumnController.delete(req, res));

module.exports = router;
