const db = require("../db/connection");

exports.createRestaurant = (req, res) => {
  const { name, cuisine, location, description, image_url } = req.body;

  const query =
    "INSERT INTO restaurant (name, cuisine_type, location, description, image_url) VALUES (?, ?, ?, ?, ?)";

  db.query(
    query,
    [name, cuisine, location, description, image_url],
    (err, result) => {
      if (err)
        return res.status(500).json({ error: "Failed to create restaurant" });
      res.status(201).json({
        message: "restaurant created",
        restaurantid: result.insertId,
      });
    }
  );
};

exports.createTable = (req, res) => {
  const { restaurantid, seats, isAvailable } = req.body;

  const query =
    "INSERT INTO tables (restaurant_id, number_of_seats, is_available) VALUES (?, ?, ?)";

  db.query(query, [restaurantid, seats, isAvailable], (err, result) => {
    if (err) {
      console.error("MySQL Error:", err);
      return res.status(500).json({ error: "Failed to create table" });
    }
    res.status(201).json({
      message: "table created",
      table: {
        id: result.insertId,
        restaurantid,
        seats,
        isAvailable,
      },
    });
  });
};

exports.listRestaurant = (req, res) => {
  const query = "SELECT * FROM restaurant";
  db.query(query, (err, result) => {
    if (err)
      return res.status(500).json({ error: "Failed to list restaurants" });
    res.status(201).json({
      result,
    });
  });
};

exports.listTables = (req, res) => {
  const restaurant = req.query.rest || 0;
  const query = "SELECT * FROM tables WHERE restaurant_id = ?";
  db.query(query, restaurant, (err, result) => {
    if (err) return res.status(500).json({ error: "Failed to list tables" });
    res.status(201).json({
      result,
    });
  });
};
