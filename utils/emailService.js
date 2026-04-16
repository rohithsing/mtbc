const nodemailer = require("nodemailer");
const Mailgen = require("mailgen");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const MailGenerator = new Mailgen({
  theme: "default",
  product: {
    name: "PictureDekho - Movie Ticket Booking",
    link: process.env.FRONTEND_URL || "http://localhost:5173",
  },
});

// Format date to readable string
const formatDate = (date) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata'
  });
};

exports.sendBookingConfirmationEmail = async (userEmail, userName, bookingId, totalAmount, show, seats, bookedAt) => {
  if (!userEmail || !process.env.EMAIL_USERNAME) return;

  const pricePerTicket = show.price;
  const ticketCount = seats.length;

  const email = {
    body: {
      name: userName || "Valued Customer",
      intro: "🎬 Your booking is confirmed! Here are your e-ticket details:",
      table: {
        data: [
          { item: "Booking ID", description: `#${bookingId}` },
          { item: "Movie", description: show.movie.title },
          { item: "Screen", description: show.screen.screen_name },
          { item: "Show Date & Time", description: formatDate(show.show_time) },
          { item: "Booked On", description: formatDate(bookedAt) },
          { item: "Seats", description: seats.join(", ") },
          { item: "Price per Ticket", description: `₹${pricePerTicket}` },
          { item: "Number of Tickets", description: `${ticketCount}` },
          { item: "Total Amount", description: `₹${ticketCount} × ₹${pricePerTicket} = ₹${totalAmount}` },
        ],
      },
      outro: [
        "Please show this email at the theater entrance as your e-ticket.",
        "Cancellation Policy: Cancellations within 1 hour of screening are NOT allowed. No refunds are issued.",
        "Enjoy the movie! 🍿"
      ],
    },
  };

  const emailBody = MailGenerator.generate(email);
  try {
    await transporter.sendMail({
      from: `"MTBC Bookings" <${process.env.EMAIL_USERNAME}>`,
      to: userEmail,
      subject: `🎟️ Booking Confirmed #${bookingId} — ${show.movie.title}`,
      html: emailBody,
    });
    console.log(`📧 Booking confirmation sent to ${userEmail}`);
  } catch (err) {
    console.log("Error sending booking email:", err.message);
  }
};

exports.sendCancellationEmail = async (userEmail, userName, bookingId, show, cancelledSeats, isFullyCancelled, remainingSeats, cancelledAt, bookedAt, refundStatus) => {
  if (!userEmail || !process.env.EMAIL_USERNAME) return;

  let refundMsg = "";
  if (refundStatus === "refund_initiated") {
    refundMsg = "Refund according to ticket will be initiated in about 2 days.";
  } else {
    refundMsg = "No money refund.";
  }

  const intro = isFullyCancelled
    ? `⚠️ Your booking has been fully cancelled. ${refundMsg}`
    : `⚠️ Partial cancellation processed. Seats cancelled: ${cancelledSeats.join(", ")}. ${refundMsg}`;

  const tableData = [
    { item: "Booking ID", description: `#${bookingId}` },
    { item: "Movie", description: show.movie.title },
    { item: "Screen", description: show.screen.screen_name },
    { item: "Show Date & Time", description: formatDate(show.show_time) },
    { item: "Booked On", description: formatDate(bookedAt) },
    { item: "Cancelled On", description: formatDate(cancelledAt) },
    { item: "Cancelled Seats", description: cancelledSeats.join(", ") },
    { item: "Status", description: isFullyCancelled ? "Fully Cancelled" : "Partially Cancelled" },
  ];

  if (!isFullyCancelled && remainingSeats && remainingSeats.length > 0) {
    tableData.push({
      item: "Remaining Active Seats",
      description: remainingSeats.join(", ")
    });
    tableData.push({
      item: "Updated Total",
      description: `₹${remainingSeats.length} × ₹${show.price} = ₹${remainingSeats.length * show.price}`
    });
  }

  const email = {
    body: {
      name: userName || "Valued Customer",
      intro,
      table: { data: tableData },
      outro: [
        "Thank you for booking with PictureDekho!"
      ],
    },
  };

  const emailBody = MailGenerator.generate(email);
  try {
    await transporter.sendMail({
      from: `"MTBC Bookings" <${process.env.EMAIL_USERNAME}>`,
      to: userEmail,
      subject: `❌ Booking Cancellation #${bookingId} — ${show.movie.title}`,
      html: emailBody,
    });
    console.log(`📧 Cancellation email sent to ${userEmail}`);
  } catch (err) {
    console.log("Error sending cancellation email:", err.message);
  }
};
