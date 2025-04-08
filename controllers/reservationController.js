const db = require("../db/connection");

exports.createReservation = (req, res) => {
  const userId = req.user?.id;
  const { table, date, time, guests } = req.body;

  if (!userId || !table || !date || !time || !guests) {
    return res.status(400).json({ error: "Missing required reservation data" });
  }

  // Step 1: Check table capacity
  const capacityQuery = "SELECT number_of_seats FROM tables WHERE table_id = ?";

  db.query(capacityQuery, [table], (err, capacityResults) => {
    if (err) {
      console.error("Error fetching table capacity:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (capacityResults.length === 0) {
      return res.status(404).json({ error: "Table not found" });
    }

    const capacity = capacityResults[0].number_of_seats;

    if (guests > capacity) {
      return res.status(400).json({
        error: `Too many guests for this table. Max capacity is ${capacity}`,
      });
    }

    // Step 2: Check for time conflicts (±30 minutes)
    const conflictQuery = `
      SELECT * FROM reservation 
      WHERE table_id = ? 
        AND reservation_date = ? 
        AND ABS(TIMESTAMPDIFF(MINUTE, 
              STR_TO_DATE(CONCAT(reservation_date, ' ', reservation_time), '%Y-%m-%d %H:%i:%s'), 
              STR_TO_DATE(?, '%Y-%m-%d %H:%i:%s')
            )) < 30
    `;

    const datetimeStr = `${date} ${time}`;

    db.query(
      conflictQuery,
      [table, date, datetimeStr],
      (conflictErr, conflictResults) => {
        if (conflictErr) {
          console.error("Error checking reservation conflicts:", conflictErr);
          return res.status(500).json({ error: "Database error" });
        }

        if (conflictResults.length > 0) {
          return res.status(409).json({
            message: "This table is already booked within a 30-minute window.",
          });
        }

        // Step 3: Insert reservation
        const insertQuery = `
        INSERT INTO reservation (user_id, reservation_date, reservation_time, number_of_guests, table_id)
        VALUES (?, ?, ?, ?, ?)
      `;

        db.query(
          insertQuery,
          [userId, date, time, guests, table],
          (insertErr, result) => {
            if (insertErr && insertErr.code === "ER_DUP_ENTRY") {
              return res.status(409).json({
                message: "Table is already reserved at the selected time.",
              });
            }

            if (insertErr) {
              console.error("Database error:", insertErr);
              return res
                .status(500)
                .json({ error: "Failed to create reservation" });
            }

            res.status(201).json({
              message: "Reservation confirmed",
              reservationId: result.insertId,
            });
          }
        );
      }
    );
  });
};

exports.listReservation = (req, res) => {
  db.query("SELECT * FROM reservation", (err, results) => {
    if (err) {
      console.error("Failed to fetch reservations:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
};
