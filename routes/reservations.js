const express = require("express");
const router = express.Router();
const {
  createReservation,
  listReservation,
} = require("../controllers/reservationController");
const authenticateToken = require("../middleware/auth");

router.post("/create", authenticateToken, createReservation);
router.get("/list", listReservation);

module.exports = router;
