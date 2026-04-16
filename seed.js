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
  const moviesList = [
    { title: "Inception", duration: 148 },
    { title: "Avengers Endgame", duration: 181 },
    { title: "Iron Man", duration: 126 },
    { title: "Iron Man 2", duration: 124 },
    { title: "Little Miss Sunshine", duration: 101 },
    { title: "Project Hail Mary", duration: 140 },
    { title: "Chandramukhi", duration: 166 },
    { title: "Khaleja", duration: 170 }
  ];

  const createdMovies = [];
  for (const m of moviesList) {
    const movie = await prisma.movie.create({ data: m });
    createdMovies.push(movie);
  }
  console.log("🎬 Movies created.");

  // =====================
  // SCREENS
  // =====================
  const screenNames = ["Screen A", "Screen B", "Screen C", "Screen D", "Screen E", "Screen F", "Screen G", "Screen H"];
  const screens = [];
  for (const sName of screenNames) {
    const s = await prisma.screen.create({
      data: { screen_name: sName, total_seats: 40 },
    });
    screens.push(s);
  }
  console.log(`🖥️  ${screens.length} Screens created.`);

  // =====================
  // SEATS — 40 per screen (A1-D10)
  // =====================
  const allSeats = [];
  const rows = ['A', 'B', 'C', 'D'];
  for (const screen of screens) {
    for (const row of rows) {
      for (let i = 1; i <= 10; i++) {
        allSeats.push({ seat_number: `${row}${i}`, screen_id: screen.screen_id });
      }
    }
  }

  await prisma.seat.createMany({ data: allSeats });
  console.log(`💺 ${allSeats.length} seats created (${allSeats.length / screens.length} per screen).`);

  // =====================
  // SHOWS — Multiple timings per movie starting from today
  // =====================
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfter = new Date();
  dayAfter.setDate(dayAfter.getDate() + 2);

  const days = [today, tomorrow, dayAfter];
  const setTime = (date, hours, minutes) => {
    const d = new Date(date);
    d.setHours(hours, minutes, 0, 0);
    return d;
  };

  const allShows = [];
  
  // 8 movies, distributed among screens
  createdMovies.forEach((movie, index) => {
    const screen = screens[index % screens.length];
    
    // Each movie gets 4 shows per day over the 3 days
    days.forEach((dayLabel) => {
      // 9:00 AM, 1:30 PM, 5:00 PM, 9:00 PM (staggered slightly by movie index)
      const timings = [
        { hr: 9 + (index % 2), min: 0 },
        { hr: 13 + (index % 2), min: 30 },
        { hr: 17 + (index % 2), min: 0 },
        { hr: 21 + (index % 2), min: 30 }
      ];

      timings.forEach((t, tIdx) => {
        allShows.push({
          movie_id: movie.movie_id,
          screen_id: screen.screen_id,
          show_time: setTime(dayLabel, t.hr, t.min),
          price: 150 + (tIdx * 30) + (index * 10) // varies price by time and movie
        });
      });
    });
  });

  await prisma.show.createMany({ data: allShows });

  console.log(`🎥 ${allShows.length} Shows created for all movies.`);
  console.log("\n✅ Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });