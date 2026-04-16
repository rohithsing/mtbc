import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMovies } from '../apis';
import toast from 'react-hot-toast';

const movieMetadata = {
    "Iron Man": { image: "https://m.media-amazon.com/images/I/61yvz+ELKyS._AC_UF894,1000_QL80_.jpg", rating: "8.5", genres: ["Action", "Sci-Fi"] },
    "Avengers Endgame": { image: "https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg", rating: "8.4", genres: ["Action", "Sci-Fi"] },
    "Iron Man 2": { image: "https://i.pinimg.com/736x/f0/9f/79/f09f793b5cc11cde8f9b1a6faa9a69d7.jpg", rating: "8.5", genres: ["Action", "Thriller"] },
    "Little Miss Sunshine": { image: "https://m.media-amazon.com/images/I/61cLJMc1W0L._AC_UF1000,1000_QL80_.jpg", rating: "7.8", genres: ["Comedy", "Drama"] },
    "Project Hail Mary": { image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSzLBwOe5BX2b1ke0zM-zvzk2cmvKZfSJQs_w&s", rating: "8.2", genres: ["Sci-Fi", "Adventure"] },
    "Chandramukhi": { image: "data:image/jpeg;base64,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", rating: "7.1", genres: ["Horror", "Comedy"] },
    "Khaleja": { image: "https://upload.wikimedia.org/wikipedia/en/d/dc/Mahesh_khaleja_poster.jpg", rating: "8.2", genres: ["Action", "Comedy"] },
    "Devara: Part 1": { image: "https://image.tmdb.org/t/p/w500/A1nwMwBwEcEJzGBlEnBtswQ4T71.jpg", rating: "7.5", genres: ["Action", "Drama"] },
    "Kalki 2898 AD": { image: "https://image.tmdb.org/t/p/w500/xqp0t3oikgK63zB5n1w3y3b7iB5.jpg", rating: "8.1", genres: ["Sci-Fi", "Action"] },
    "Guntur Kaaram": { image: "https://image.tmdb.org/t/p/w500/n3F2vSOP8gG1sI3gY6n0o82G3Jq.jpg", rating: "6.5", genres: ["Action", "Drama"] },
    "Pushpa 2: The Rule": { image: "https://image.tmdb.org/t/p/w500/1wU5wKnt2z7cYYQyN7t6oE0cE4X.jpg", rating: "8.8", genres: ["Action", "Thriller"] },
    "Salaar: Part 1 - Ceasefire": { image: "https://image.tmdb.org/t/p/w500/6v0WbJj2h4VnXZL4d7KzK2eE2Z1.jpg", rating: "8.0", genres: ["Action", "Crime"] }
};

const MoviesList = ({ user }) => {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        getMovies()
            .then(res => setMovies(res.data))
            .catch(() => toast.error("Failed to load movies"))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="bms-loading">
            <div className="spinner"></div>
            <p>Loading Movies...</p>
        </div>
    );

    const filtered = movies.filter(m =>
        m.title.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div style={{ minHeight: '100vh', background: '#f0f0f5' }}>

            {/* ── Navbar ── */}
            <nav className="bms-nav">
                <div className="logo"><span>Picture</span>Dekho</div>

                {/* Search */}
                <div className="bms-search">
                    <span className="search-icon">🔍</span>
                    <input
                        id="movie-search"
                        type="text"
                        placeholder="Search for movies..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>

                <div className="nav-spacer" />

                <div style={{ display: 'flex', gap: 16, marginRight: 16, alignItems: 'center' }}>
                    <a
                        href="/my-bookings"
                        style={{ color: '#cc0000', fontSize: 12, textDecoration: 'underline', fontWeight: 600 }}
                    >
                        My Bookings
                    </a>
                    <a
                        href="/find-booking"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#fff', fontSize: 12, textDecoration: 'underline', opacity: 0.8 }}
                    >
                        Cancel my ticket
                    </a>
                </div>

                <div className="nav-location">
                    <span>📍</span> Hyderabad
                </div>

                <div className="nav-user-dropdown" style={{ position: 'relative' }}>
                    <button
                        className="nav-user"
                        onClick={() => setShowDropdown(!showDropdown)}
                        style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', padding: '6px 12px', borderRadius: 4, cursor: 'pointer', fontFamily: 'Poppins, sans-serif' }}
                    >
                        👤 {user.name} ▾
                    </button>

                    {showDropdown && (
                        <div style={{
                            position: 'absolute', top: '100%', right: 0, marginTop: 8,
                            background: '#fff', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            width: 160, overflow: 'hidden', zIndex: 50
                        }}>
                            <div
                                onClick={() => navigate('/my-bookings')}
                                style={{ padding: '12px 16px', color: '#1a1a2e', fontSize: 13, cursor: 'pointer', borderBottom: '1px solid #f0f0f5' }}
                                onMouseOver={e => e.target.style.background = '#f9f9f9'}
                                onMouseOut={e => e.target.style.background = 'transparent'}
                            >
                                🎟️ Your Bookings
                            </div>
                            <div
                                onClick={() => {
                                    localStorage.removeItem('token');
                                    window.location.href = '/';
                                }}
                                style={{ padding: '12px 16px', color: '#cc0000', fontSize: 13, cursor: 'pointer' }}
                                onMouseOver={e => e.target.style.background = '#f9f9f9'}
                                onMouseOut={e => e.target.style.background = 'transparent'}
                            >
                                🚪 Sign Out
                            </div>
                        </div>
                    )}
                </div>
            </nav>

            {/* ── Hero Banner ── */}
            <div className="bms-hero">
                {/* Decorative circles */}
                <div className="decor-circle" style={{ width: 400, height: 400, top: -100, right: -80, opacity: 0.3 }}></div>
                <div className="decor-circle" style={{ width: 200, height: 200, bottom: -60, left: 40, opacity: 0.2 }}></div>

                <div className="bms-hero-content">
                    <h1>
                        Don't <span>Miss</span> Out!!
                    </h1>
                    <p>It could top your list of favourites. Book Now!!</p>

                    <div style={{
                        marginTop: 20,
                        display: 'inline-flex',
                        gap: 8,
                        background: 'rgba(255,255,255,0.08)',
                        backdropFilter: 'blur(8px)',
                        borderRadius: 8,
                        padding: '8px 20px',
                        border: '1px solid rgba(255,255,255,0.12)'
                    }}>
                        <span style={{ color: '#cc0000', fontWeight: 700, fontSize: 13 }}>
                            {movies.length}
                        </span>
                        <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>
                            movies currently screening
                        </span>
                    </div>
                </div>
            </div>

            {/* ── Now Showing Section ── */}
            <div className="bms-section">
                <div className="bms-section-header">
                    <h2>Now Showing</h2>
                    <span style={{ fontSize: 12, color: '#888' }}>
                        {filtered.length} movie{filtered.length !== 1 ? 's' : ''}
                    </span>
                </div>

                {filtered.length === 0 ? (
                    <div style={{
                        background: '#fff',
                        borderRadius: 8,
                        padding: '48px 24px',
                        textAlign: 'center',
                        color: '#888',
                        fontSize: 15,
                        boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
                    }}>
                        {search ? `No results for "${search}"` : 'No movies currently screening.'}
                    </div>
                ) : (
                    <div className="movie-grid">
                        {filtered.map(movie => {
                            const meta = movieMetadata[movie.title] || {
                                image: "https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
                                rating: "7.0",
                                genres: ["Drama"]
                            };

                            return (
                                <div
                                    key={movie.movie_id}
                                    id={`movie-${movie.movie_id}`}
                                    className="movie-card"
                                    onClick={() => navigate(`/movie/${movie.movie_id}`)}
                                >
                                    <img
                                        src={meta.image}
                                        alt={movie.title}
                                        className="movie-poster"
                                    />

                                    {/* Hover overlay with Book button */}
                                    <div className="movie-card-overlay">
                                        <button
                                            className="book-btn"
                                            onClick={e => { e.stopPropagation(); navigate(`/movie/${movie.movie_id}`); }}
                                        >
                                            Book Tickets
                                        </button>
                                    </div>

                                    {/* Card Info */}
                                    <div className="movie-card-info">
                                        <h3 title={movie.title}>{movie.title}</h3>

                                        <div className="genres">
                                            {meta.genres.map(g => (
                                                <span key={g} className="genre-tag">{g}</span>
                                            ))}
                                        </div>

                                        <div className="rating-row">
                                            <span className="rating-badge">{meta.rating}</span>
                                            <span>Votes</span>
                                        </div>

                                        <div style={{ marginTop: 8, fontSize: 11, color: '#888' }}>
                                            ⏱ {movie.duration} mins
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ── Footer ── */}
            <div className="bms-footer">
                &copy; {new Date().getFullYear()} &nbsp;<span>PictureDekho</span>&nbsp; MTBC &mdash; All rights reserved
            </div>
        </div>
    );
};

export default MoviesList;
