const express = require("express");
const authenticateToken = require("../middleware/auth");
const router = express.Router();
const {
  registerUser,
  loginUser,
  profile,
} = require("../controllers/userController");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", authenticateToken, profile);

module.exports = router;
