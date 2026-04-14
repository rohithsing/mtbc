
const express = require('express');
const router = express.Router();

const {
  getMovies,
  createMovie,
  getShowsByMovie   // ✅ add this
} = require('../controllers/movieController');

router.get('/', getMovies);
router.post('/create', createMovie);

// ✅ NEW route (VERY IMPORTANT for frontend)
router.get('/shows/:movieId', getShowsByMovie);

module.exports = router;