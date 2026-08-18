const express = require("express");
const router = express.Router();
const { listPrograms } = require("../controllers/programsController");

// Public: catalog + authoritative pricing for the website to render.
router.get("/", listPrograms);

module.exports = router;
