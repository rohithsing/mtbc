const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {

  // =====================
  // USERS
  // =====================
  const user1 = await prisma.user.create({
    data: {
      name: "Alice",
      email: "alice@test.com",
      phone: "9876543210",
    },
  });

  const user2 = await prisma.user.create({
    data: {
      name: "Bob",
      email: "bob@test.com",
      phone: "9123456780",
    },
  });

  // =====================
  // MOVIES
  // =====================
  const movie1 = await prisma.movie.create({
    data: {
      title: "Inception",
      duration: 148,
    },
  });

  const movie2 = await prisma.movie.create({
    data: {
      title: "Avengers Endgame",
      duration: 181,
    },
  });

  // =====================
  // SCREENS
  // =====================
  const screen1 = await prisma.screen.create({
    data: {
      screen_name: "Screen A",
      total_seats: 50,
    },
  });

  const screen2 = await prisma.screen.create({
    data: {
      screen_name: "Screen B",
      total_seats: 80,
    },
  });

  // =====================
  // SEATS (for Screen A only example)
  // =====================
  const seats = [];
  for (let i = 1; i <= 10; i++) {
    seats.push(
      await prisma.seat.create({
        data: {
          seat_number: `A${i}`,
          screen_id: screen1.screen_id,
        },
      })
    );
  }

  // =====================
  // SHOWS
  // =====================
  const show1 = await prisma.show.create({
    data: {
      movie_id: movie1.movie_id,
      screen_id: screen1.screen_id,
      show_time: new Date("2026-04-14T18:00:00Z"),
      price: 250,
    },
  });

  const show2 = await prisma.show.create({
    data: {
      movie_id: movie2.movie_id,
      screen_id: screen2.screen_id,
      show_time: new Date("2026-04-14T21:00:00Z"),
      price: 300,
    },
  });

  // =====================
  // BOOKING (sample)
  // =====================
  const booking = await prisma.booking.create({
    data: {
      user_id: user1.user_id,
      show_id: show1.show_id,
      total_amount: 3 * show1.price,
    },
  });

  // =====================
  // BOOKING SEATS
  // =====================
  await prisma.bookingSeat.createMany({
    data: [
      { booking_id: booking.booking_id, seat_id: seats[0].seat_id },
      { booking_id: booking.booking_id, seat_id: seats[1].seat_id },
      { booking_id: booking.booking_id, seat_id: seats[2].seat_id },
    ],
  });

  console.log("✅ Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });