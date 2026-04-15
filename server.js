const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());   
app.use(express.json());

// Routes
const authRoutes = require('./routes/authRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const movieRoutes = require('./routes/movieRoutes');
const userRoutes = require('./routes/userRoutes');

// Auth & Session Middleware
const session = require('express-session');
const passport = require('./config/passport');
require('dotenv').config();

app.use(session({
  secret: process.env.SESSION_SECRET || 'secret',
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());

app.use('/auth', authRoutes);
app.use('/booking', bookingRoutes);
app.use('/movies', movieRoutes);
app.use('/users', userRoutes);

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