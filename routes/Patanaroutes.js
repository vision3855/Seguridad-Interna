const express = require("express");
const router = express.Router();
const { getPatanas, getPatanaById, getPatanaStats } = require("../controllers/filterController");
const authMiddleware = require("../middleware/auth");


router.use(authMiddleware.protect);

// GET /api/patanas/stats  ← must be before /:id to avoid "stats" being treated as an id
router.get("/stats", getPatanaStats);

// GET /api/patanas?patanaType=TERCERO&driver=walkins&...
router.get("/", getPatanas);

// GET /api/patanas/:id
router.get("/:id", getPatanaById);

module.exports = router;