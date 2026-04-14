const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());   
app.use(express.json());

// Routes
app.use('/booking', require('./routes/bookingRoutes'));
app.use('/movies', require('./routes/movieRoutes'));
app.use('/users', require('./routes/userRoutes'));

// Root route (optional, for testing)
app.get('/', (req, res) => {
  res.send('Movie Booking API is running');
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Something went wrong" });
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});