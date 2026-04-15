const express = require('express');
const router = express.Router();

const {
  createBooking,
  getBookings,
  getSeatsByShow,   // ✅ MUST be here
  cancelBooking     // ✅ (if used)
} = require('../controllers/bookingController');

router.post('/', createBooking);
router.get('/', getBookings);
router.get('/show/:showId/seats', getSeatsByShow);
router.post('/:id/cancel', cancelBooking);

module.exports = router;