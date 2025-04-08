const db = require("../db/connection");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.registerUser = (req, res) => {
  const { name, email, phone, password } = req.body;

  // Check if user already exists
  db.query(
    "SELECT * FROM user WHERE email = ?",
    [email],
    async (err, results) => {
      if (err) return res.status(500).json({ error: "Database error" });

      if (results.length > 0) {
        return res.status(400).json({ error: "User already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      db.query(
        "INSERT INTO user (full_name, email, phone_number, password) VALUES (?, ?, ?, ?)",
        [name, email, phone, hashedPassword],
        (err, result) => {
          if (err)
            return res.status(500).json({ error: "User registration failed" });

          res.status(201).json({ message: "User registered successfully" });
        }
      );
    }
  );
};

exports.loginUser = (req, res) => {
  const { email, password } = req.body;

  db.query(
    "SELECT * FROM user WHERE email = ?",
    [email],
    async (err, results) => {
      if (err) return res.status(500).json({ error: "Database error" });

      if (results.length === 0) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      const user = results[0];
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      const token = jwt.sign(
        { id: user.user_id, email: user.email },
        "your_jwt_secret",
        {
          expiresIn: "1d",
        }
      );

      res.json({ message: "Login successful", token });
    }
  );
};

exports.profile = (req, res) => {
  const userId = req.user.id; // Assumes JWT middleware sets req.user
  db.query(
    "SELECT user_id, full_name, email, phone_number FROM user WHERE user_id = ?",
    [userId],
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: "Database error" });
      }

      if (results.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      const user = results[0];
      res.json({ user });
    }
  );
};
