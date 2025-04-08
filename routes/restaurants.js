const express = require("express");
const router = express.Router();
const {
  createRestaurant,
  listRestaurant,
  createTable,
  listTables,
} = require("../controllers/restaurantController");
const authenticateToken = require("../middleware/auth");
const isAdmin = require("../middleware/isAdmin");

router.post("/create", authenticateToken, isAdmin, createRestaurant);
router.post("/tables/create", authenticateToken, isAdmin, createTable);
router.get("/tables", listTables);
router.get("/list", listRestaurant);

module.exports = router;
