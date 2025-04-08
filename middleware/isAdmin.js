const db = require("../db/connection");

function isAdmin(req, res, next) {
  const userId = req.user.id;

  db.query(
    "SELECT role FROM user WHERE user_id = ?",
    [userId],
    (err, results) => {
      if (err)
        return res
          .status(500)
          .json({ error: "Failed to create rest: Database error" });

      if (!results.length || results[0].role !== "admin") {
        return res.status(403).json({ error: "Access denied. Admins only." });
      }

      next();
    }
  );
}

module.exports = isAdmin;
