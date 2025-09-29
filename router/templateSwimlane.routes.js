const express = require("express");
const router = express.Router();
const templateSwimlaneController = require("../controllers/templateSwimlane.controller");

// CRUD routes
router.post("/", (req, res) => templateSwimlaneController.create(req, res));
router.get("/", (req, res) => templateSwimlaneController.getAll(req, res));
router.get("/:id", (req, res) => templateSwimlaneController.getById(req, res));
router.get("/template/:templateId", (req, res) => templateSwimlaneController.getByTemplate(req, res));
router.put("/:id", (req, res) => templateSwimlaneController.update(req, res));
router.delete("/:id", (req, res) => templateSwimlaneController.delete(req, res));

module.exports = router;
