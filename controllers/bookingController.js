const prisma = require('../prismaClient');
const { sendBookingConfirmationEmail, sendCancellationEmail } = require('../utils/emailService');

// ✅ Create booking
exports.createBooking = async (req, res) => {
  try {
    const { user_id, show_id, seat_ids } = req.body;

    if (!user_id || !show_id || !seat_ids || seat_ids.length === 0) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const show = await prisma.show.findUnique({
      where: { show_id },
      include: { movie: true, screen: true }
    });

    if (!show) {
      return res.status(404).json({ error: "Show not found" });
    }

    // Prevent booking after show started
    if (new Date() > show.show_time) {
      return res.status(400).json({ error: "Cannot book after show has started" });
    }

    // Check if seats already booked for this show
    const existing = await prisma.bookingSeat.findMany({
      where: {
        seat_id: { in: seat_ids },
        status: "Active",
        booking: {
          show_id: show_id,
          status: { in: ["Booked", "Partially Cancelled"] }
        }
      }
    });

    if (existing.length > 0) {
      return res.status(400).json({ error: "Some seats are already booked" });
    }

    const total_amount = seat_ids.length * show.price;

    const booking = await prisma.booking.create({
      data: {
        total_amount,
        user: { connect: { user_id } },
        show: { connect: { show_id } },
        status: "Booked",
        booked_at: new Date(),
        seats: {
          create: seat_ids.map(seatId => ({
            seat: { connect: { seat_id: seatId } },
            status: "Active"
          }))
        }
      },
      include: {
        user: true,
        show: { include: { movie: true, screen: true } },
        seats: { include: { seat: true } }
      }
    });

    const seatNames = booking.seats.map(bs => bs.seat.seat_number);
    try {
      await sendBookingConfirmationEmail(
        booking.user.email,
        booking.user.name,
        booking.booking_id,
        total_amount,
        booking.show,
        seatNames,
        booking.booked_at
      );
    } catch(err) {
      console.error("Email send error:", err.message);
    }

    res.json({
      message: "Booking successful",
      booking_id: booking.booking_id,
      booked_at: booking.booked_at
    });

  } catch (error) {
    console.error("Booking error:", error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ Get all bookings
exports.getBookings = async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        user: true,
        show: { include: { movie: true, screen: true } },
        seats: { include: { seat: true } }
      }
    });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Get seats by show (returns show info + seat availability)
exports.getSeatsByShow = async (req, res) => {
  try {
    const { showId } = req.params;

    const show = await prisma.show.findUnique({
      where: { show_id: parseInt(showId) },
      include: { movie: true, screen: true }
    });

    if (!show) {
      return res.status(404).json({ error: "Show not found" });
    }

    const seats = await prisma.seat.findMany({
      where: { screen_id: show.screen_id },
      orderBy: { seat_number: 'asc' }
    });

    const bookedSeats = await prisma.bookingSeat.findMany({
      where: {
        status: "Active",
        booking: {
          show_id: parseInt(showId),
          status: { in: ["Booked", "Partially Cancelled"] }
        }
      }
    });

    const bookedSeatIds = bookedSeats.map(bs => bs.seat_id);

    const result = seats.map(seat => ({
      ...seat,
      isBooked: bookedSeatIds.includes(seat.seat_id)
    }));

    res.json({ show, seats: result });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Cancel booking (Partial or Full)
exports.cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { seat_ids } = req.body; // Array of seat_ids to cancel

    // Get booking + show details
    const booking = await prisma.booking.findUnique({
      where: { booking_id: parseInt(id) },
      include: { 
        show: { include: { movie: true, screen: true } },
        user: true,
        seats: { include: { seat: true } } 
      }
    });

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    if (booking.status === "Cancelled") {
      return res.status(400).json({ error: "Booking already cancelled completely" });
    }

    const currentTime = new Date();
    
    // ❗ 1-Hour Rule: Prevent cancellation within 1 hour of screening — no refund
    const timeDiff = booking.show.show_time.getTime() - currentTime.getTime();
    if (timeDiff < 60 * 60 * 1000) {
      return res.status(400).json({ 
        error: "Cannot cancel within 1 hour of screening. No refund is applicable." 
      });
    }

    // Determine seats to cancel
    let seatsToCancel = [];
    if (seat_ids && seat_ids.length > 0) {
      seatsToCancel = booking.seats.filter(bs => seat_ids.includes(bs.seat_id) && bs.status === "Active");
    } else {
      seatsToCancel = booking.seats.filter(bs => bs.status === "Active");
    }

    if (seatsToCancel.length === 0) {
      return res.status(400).json({ error: "No active seats selected for cancellation" });
    }

    const cancelledAt = new Date();

    // Mark seats as cancelled with timestamp
    await prisma.bookingSeat.updateMany({
      where: { id: { in: seatsToCancel.map(s => s.id) } },
      data: { status: "Cancelled", cancelled_at: cancelledAt }
    });

    // Determine new booking status
    const remainingActiveSeats = booking.seats.filter(
      bs => bs.status === "Active" && !seatsToCancel.find(c => c.id === bs.id)
    );
    const newStatus = remainingActiveSeats.length === 0 ? "Cancelled" : "Partially Cancelled";
    const newAmount = remainingActiveSeats.length * booking.show.price;

    await prisma.booking.update({
      where: { booking_id: booking.booking_id },
      data: { status: newStatus, total_amount: newAmount }
    });

    // Email notification
    const cancelledSeatNames = seatsToCancel.map(s => s.seat.seat_number);
    const remainingSeatNames = remainingActiveSeats.map(s => s.seat.seat_number);

    try {
      await sendCancellationEmail(
        booking.user.email,
        booking.user.name,
        booking.booking_id,
        booking.show,
        cancelledSeatNames,
        newStatus === "Cancelled",
        remainingSeatNames,
        cancelledAt,
        booking.booked_at
      );
    } catch(err) {
      console.error("Email send error:", err.message);
    }

    res.json({ 
      message: "Cancellation successful", 
      status: newStatus,
      cancelled_at: cancelledAt
    });

  } catch (error) {
    console.error("Cancellation error:", error);
    res.status(500).json({ error: error.message });
  }
};