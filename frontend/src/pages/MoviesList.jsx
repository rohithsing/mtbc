import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMovies } from '../apis';
import toast from 'react-hot-toast';

const MoviesList = ({ user }) => {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        getMovies()
            .then(res => setMovies(res.data))
            .catch(() => toast.error("Failed to load movies"))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="min-h-screen text-book-brand flex items-center justify-center font-bold text-2xl">Loading Movies...</div>;

    return (
        <div className="min-h-screen bg-book-bg font-sans pb-24 text-gray-800">
            {/* Header */}
            <header className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white p-6 shadow-md text-center">
                <h1 className="text-3xl font-bold tracking-tight">Now Showing</h1>
                <p className="text-cyan-100 opacity-90 mt-1">Welcome back, {user.name}!</p>
            </header>

            <main className="max-w-5xl mx-auto px-4 mt-12 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {movies.map(movie => (
                        <div key={movie.movie_id} className="glass rounded-3xl p-6 transition transform hover:scale-105 hover:shadow-2xl flex flex-col justify-between h-56 cursor-pointer" onClick={() => navigate(`/movie/${movie.movie_id}`)}>
                            <div>
                                <h3 className="text-2xl font-bold tracking-tight text-gray-900 mb-2">{movie.title}</h3>
                                <p className="text-sm text-gray-500">{movie.duration} mins • English</p>
                            </div>
                            <button className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 mt-4 rounded-xl shadow-sm transition">
                                View Shows
                            </button>
                        </div>
                    ))}
                </div>
                {movies.length === 0 && <p className="text-center text-gray-500 text-xl font-bold mt-10">No movies currently screening.</p>}
            </main>
        </div>
    );
};

export default MoviesList;
