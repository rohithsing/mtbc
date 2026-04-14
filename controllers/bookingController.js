

const prisma = require('../prismaClient');

// ✅ Create booking
exports.createBooking = async (req, res) => {
  try {
    const { user_id, show_id, seat_ids } = req.body;

    if (!user_id || !show_id || !seat_ids || seat_ids.length === 0) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const show = await prisma.show.findUnique({
      where: { show_id }
    });

    if (!show) {
      return res.status(404).json({ error: "Show not found" });
    }

    // Check if seats already booked
    const existing = await prisma.bookingSeat.findMany({
      where: {
        seat_id: { in: seat_ids },
        booking: {
          show_id: show_id,
          status: "Booked"
        }
      }
    });

    if (existing.length > 0) {
      return res.status(400).json({ error: "Some seats already booked" });
    }
    // Prevent booking after show started
    if (new Date() > show.show_time) {
      return res.status(400).json({
       error: "Cannot book after show has started"
     });
    }
    const total_amount = seat_ids.length * show.price;

    const booking = await prisma.booking.create({
      data: {
        total_amount,
        user: { connect: { user_id } },
        show: { connect: { show_id } },
        seats: {
          create: seat_ids.map(seatId => ({
            seat: { connect: { seat_id: seatId } }
          }))
        }
      }
    });

    res.json({
      message: "Booking successful",
      booking_id: booking.booking_id
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Get all bookings
exports.getBookings = async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        user: true,
        show: true
      }
    });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Get seats by show
exports.getSeatsByShow = async (req, res) => {
  try {
    const { showId } = req.params;

    const show = await prisma.show.findUnique({
      where: { show_id: parseInt(showId) }
    });

    if (!show) {
      return res.status(404).json({ error: "Show not found" });
    }

    const seats = await prisma.seat.findMany({
      where: {
        screen_id: show.screen_id
      }
    });

    const bookedSeats = await prisma.bookingSeat.findMany({
      where: {
        booking: {
          show_id: parseInt(showId),
          status: "Booked"
        }
      }
    });

    const bookedSeatIds = bookedSeats.map(bs => bs.seat_id);

    const result = seats.map(seat => ({
      ...seat,
      isBooked: bookedSeatIds.includes(seat.seat_id)
    }));

    res.json(result);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Cancel booking
exports.cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;

    // Get booking + show details
    const booking = await prisma.booking.findUnique({
      where: { booking_id: parseInt(id) },
      include: { show: true }
    });

    // Check if booking exists
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    // Check if already cancelled
    if (booking.status === "Cancelled") {
      return res.status(400).json({ error: "Booking already cancelled" });
    }

    const currentTime = new Date();

    // ❗ Prevent cancellation after show has started
    if (currentTime > booking.show.show_time) {
      return res.status(400).json({
        error: "Cannot cancel after show has started"
      });
    }

    // Cancel booking
    await prisma.booking.update({
      where: { booking_id: booking.booking_id },
      data: { status: "Cancelled" }
    });

    res.json({ message: "Booking cancelled successfully" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};