const prisma = require('../prismaClient');

// Get all movies
exports.getMovies = async (req, res) => {
  try {
    const movies = await prisma.movie.findMany();
    res.json(movies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create movie
exports.createMovie = async (req, res) => {
  try {
    const { title, duration } = req.body;

    const movie = await prisma.movie.create({
      data: {
        title,
        duration
      }
    });

    res.json(movie);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getShowsByMovie = async (req, res) => {
  try {
    const { movieId } = req.params;

    const shows = await prisma.show.findMany({
      where: {
        movie_id: parseInt(movieId)
      },
      include: {
        screen: true  // gives theatre/screen info
      }
    });

    res.json(shows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};