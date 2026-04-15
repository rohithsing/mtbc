const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedTeluguMovies() {
  console.log("Seeding Telugu Movies and Screens...");

  // 1. Create Movies
  const moviesData = [
    { title: "Devara: Part 1", duration: 178 },
    { title: "Kalki 2898 AD", duration: 181 },
    { title: "Guntur Kaaram", duration: 159 },
    { title: "Pushpa 2: The Rule", duration: 165 },
    { title: "Salaar: Part 1 - Ceasefire", duration: 175 }
  ];

  const createdMovies = [];
  for (const m of moviesData) {
    const movie = await prisma.movie.create({ data: m });
    createdMovies.push(movie);
  }
  console.log(`✅ Added ${createdMovies.length} Telugu movies.`);

  // 2. Create Screens
  const screensData = [
    { screen_name: "PVR: Orion Mall (Screen 1)", total_seats: 30 },
    { screen_name: "INOX: GVK One (Screen 2)", total_seats: 40 },
    { screen_name: "AMB Cinemas: Screen 1", total_seats: 50 }
  ];

  const createdScreens = [];
  for (const s of screensData) {
    const screen = await prisma.screen.create({ data: s });
    createdScreens.push(screen);

    // 3. Create Seats for each screen (Rows A, B, C)
    const seatsToCreate = [];
    const rows = ['A', 'B', 'C', 'D', 'E'];
    const seatsPerRow = s.total_seats / rows.length; 

    for (let i = 0; i < rows.length; i++) {
        for (let j = 1; j <= seatsPerRow; j++) {
            seatsToCreate.push({
                seat_number: `${rows[i]}${j}`,
                screen_id: screen.screen_id
            });
        }
    }

    await prisma.seat.createMany({ data: seatsToCreate });
  }
  console.log(`✅ Added ${createdScreens.length} screens and their seats.`);

  // 4. Create Shows for the next few days
  const today = new Date();
  const showsToCreate = [];

  createdMovies.forEach((movie, index) => {
    createdScreens.forEach((screen, screenIndex) => {
      // Create a few shows per movie-screen combination
      for(let day = 0; day < 3; day++) {
        const showTime1 = new Date(today);
        showTime1.setDate(today.getDate() + day);
        showTime1.setHours(10 + (index * 2), 30, 0, 0); // Morning/Afternoon

        const showTime2 = new Date(today);
        showTime2.setDate(today.getDate() + day);
        showTime2.setHours(16 + (screenIndex * 2), 0, 0, 0); // Evening Night

        showsToCreate.push({
          movie_id: movie.movie_id,
          screen_id: screen.screen_id,
          show_time: showTime1,
          price: 150 + (index * 20)
        });

        showsToCreate.push({
          movie_id: movie.movie_id,
          screen_id: screen.screen_id,
          show_time: showTime2,
          price: 200 + (screenIndex * 30)
        });
      }
    });
  });

  await prisma.show.createMany({ data: showsToCreate });
  console.log(`✅ Added ${showsToCreate.length} shows scheduled.`);
  
  console.log("🎉 Seeding complete!");
}

seedTeluguMovies()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
