const express = require('express');
const router = express.Router();

const {
  createBooking,
  getBookings,
  getSeatsByShow,   // ✅ MUST be here
  cancelBooking     // ✅ (if used)
} = require('../controllers/bookingController');

router.post('/create', createBooking);
router.get('/getBookings', getBookings);

// ✅ THESE WERE CAUSING ERROR
router.get('/seats/:showId', getSeatsByShow);
router.delete('/:id', cancelBooking);

module.exports = router;