const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const reservationRoutes = require("./routes/reservations");
const restaurantRoutes = require("./routes/restaurants");
const userRoutes = require("./routes/users");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/reservations", reservationRoutes);
app.use("/api/restaurants", restaurantRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
