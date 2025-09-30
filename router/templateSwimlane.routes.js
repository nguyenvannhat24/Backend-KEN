const express = require("express");
const router = express.Router();
const templateSwimlaneController = require("../controllers/templateSwimlane.controller");
const { authenticateAny, authorizeAny, adminAny } = require('../middlewares/auth');
// CRUD routes
router.post("/", authenticateAny, (req, res) => templateSwimlaneController.create(req, res));
router.get("/",authenticateAny, (req, res) => templateSwimlaneController.getAll(req, res));
router.get("/:id",authenticateAny, (req, res) => templateSwimlaneController.getById(req, res));
router.get("/template/:templateId",authenticateAny, (req, res) => templateSwimlaneController.getByTemplate(req, res));
router.put("/:id", authenticateAny,(req, res) => templateSwimlaneController.update(req, res));
router.delete("/:id",authenticateAny, (req, res) => templateSwimlaneController.delete(req, res));

module.exports = router;
