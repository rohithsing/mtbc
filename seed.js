const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {

  // =====================
  // CLEAR DATABASE
  // =====================
  await prisma.bookingSeat.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.seat.deleteMany();
  await prisma.show.deleteMany();
  await prisma.movie.deleteMany();
  await prisma.screen.deleteMany();
  await prisma.user.deleteMany();

  console.log("🗑️  Database cleared.");

  // =====================
  // USERS
  // =====================
  const user1 = await prisma.user.create({
    data: { name: "Alice", email: "alice@test.com", phone: "9876543210" },
  });
  console.log("👤 Users created.");

  // =====================
  // MOVIES
  // =====================
  const movie1 = await prisma.movie.create({
    data: { title: "Inception", duration: 148 },
  });

  const movie2 = await prisma.movie.create({
    data: { title: "Avengers Endgame", duration: 181 },
  });
  console.log("🎬 Movies created.");

  // =====================
  // SCREENS
  // =====================
  const screen1 = await prisma.screen.create({
    data: { screen_name: "Screen A", total_seats: 40 },
  });

  const screen2 = await prisma.screen.create({
    data: { screen_name: "Screen B", total_seats: 40 },
  });
  console.log("🖥️  Screens created.");

  // =====================
  // SEATS — 40 per screen (A1-D10)
  // Using createMany for minimal DB connections
  // =====================
  const allSeats = [];
  const rows = ['A', 'B', 'C', 'D'];
  for (const row of rows) {
    for (let i = 1; i <= 10; i++) {
      allSeats.push({ seat_number: `${row}${i}`, screen_id: screen1.screen_id });
      allSeats.push({ seat_number: `${row}${i}`, screen_id: screen2.screen_id });
    }
  }

  await prisma.seat.createMany({ data: allSeats });
  console.log(`💺 ${allSeats.length} seats created (${allSeats.length / 2} per screen).`);

  // =====================
  // SHOWS — Multiple timings per movie, using FUTURE dates
  // =====================
  // Use dates 1-3 days from now so they're always bookable
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfter = new Date();
  dayAfter.setDate(dayAfter.getDate() + 2);
  const dayAfter2 = new Date();
  dayAfter2.setDate(dayAfter2.getDate() + 3);

  // Helper: set time on a date
  const setTime = (date, hours, minutes) => {
    const d = new Date(date);
    d.setHours(hours, minutes, 0, 0);
    return d;
  };

  // Inception shows — on Screen A
  await prisma.show.createMany({
    data: [
      { movie_id: movie1.movie_id, screen_id: screen1.screen_id, show_time: setTime(tomorrow, 10, 0),  price: 180 },
      { movie_id: movie1.movie_id, screen_id: screen1.screen_id, show_time: setTime(tomorrow, 14, 30), price: 220 },
      { movie_id: movie1.movie_id, screen_id: screen1.screen_id, show_time: setTime(tomorrow, 19, 0),  price: 250 },
      { movie_id: movie1.movie_id, screen_id: screen1.screen_id, show_time: setTime(dayAfter, 11, 0),  price: 180 },
      { movie_id: movie1.movie_id, screen_id: screen1.screen_id, show_time: setTime(dayAfter, 18, 0),  price: 250 },
    ]
  });

  // Endgame shows — on Screen B
  await prisma.show.createMany({
    data: [
      { movie_id: movie2.movie_id, screen_id: screen2.screen_id, show_time: setTime(tomorrow, 11, 0),  price: 200 },
      { movie_id: movie2.movie_id, screen_id: screen2.screen_id, show_time: setTime(tomorrow, 15, 0),  price: 250 },
      { movie_id: movie2.movie_id, screen_id: screen2.screen_id, show_time: setTime(tomorrow, 20, 30), price: 300 },
      { movie_id: movie2.movie_id, screen_id: screen2.screen_id, show_time: setTime(dayAfter, 12, 0),  price: 200 },
      { movie_id: movie2.movie_id, screen_id: screen2.screen_id, show_time: setTime(dayAfter, 17, 30), price: 300 },
      { movie_id: movie2.movie_id, screen_id: screen2.screen_id, show_time: setTime(dayAfter2, 14, 0), price: 250 },
    ]
  });

  console.log("🎥 Shows created (5 for Inception, 6 for Endgame).");
  console.log("\n✅ Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });