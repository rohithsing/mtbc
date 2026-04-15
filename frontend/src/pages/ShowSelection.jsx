import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getShowsByMovie } from '../apis';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const ShowSelection = () => {
    const { movieId } = useParams();
    const navigate = useNavigate();
    const [shows, setShows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(null);

    useEffect(() => {
        getShowsByMovie(movieId)
            .then(res => {
                setShows(res.data);
                if (res.data.length > 0) {
                    const firstDate = format(new Date(res.data[0].show_time), 'yyyy-MM-dd');
                    setSelectedDate(firstDate);
                }
            })
            .catch(() => toast.error("Failed to load shows"))
            .finally(() => setLoading(false));
    }, [movieId]);

    if (loading) return (
        <div className="bms-loading">
            <div className="spinner"></div>
            <p>Loading Shows...</p>
        </div>
    );

    const movieTitle = shows.length > 0 ? (shows[0]?.movie?.title || 'Show Times') : 'Show Times';

    // Get unique dates from shows
    const uniqueDates = [...new Set(
        shows.map(s => format(new Date(s.show_time), 'yyyy-MM-dd'))
    )].sort();

    // Filter shows by selected date
    const filteredShows = selectedDate
        ? shows.filter(s => format(new Date(s.show_time), 'yyyy-MM-dd') === selectedDate)
        : shows;

    return (
        <div style={{ minHeight: '100vh', background: '#f0f0f5' }}>

            {/* ── Navbar ── */}
            <nav className="bms-nav">
                <div className="logo">Picture<span>Dekho</span></div>
                <div className="nav-spacer" />
                <button
                    onClick={() => navigate('/movies')}
                    className="nav-user"
                    style={{ background: 'none', border: 'none', fontFamily: 'Poppins, sans-serif' }}
                >
                    ← All Movies
                </button>
            </nav>

            {/* ── Movie Header ── */}
            <div className="show-page-header">
                <button
                    className="back-link"
                    onClick={() => navigate('/movies')}
                >
                    ← Back to Movies
                </button>
                <h1>{movieTitle}</h1>
                <p>Select a date and show time to proceed</p>
            </div>

            {/* ── Date Tabs ── */}
            {uniqueDates.length > 0 && (
                <div className="date-tabs">
                    {uniqueDates.map(dateStr => {
                        const d = new Date(dateStr);
                        return (
                            <button
                                key={dateStr}
                                id={`date-tab-${dateStr}`}
                                className={`date-tab${selectedDate === dateStr ? ' active' : ''}`}
                                onClick={() => setSelectedDate(dateStr)}
                            >
                                <span className="day">{format(d, 'EEE')}</span>
                                <span className="date-num">{format(d, 'd')}</span>
                                <span className="month">{format(d, 'MMM')}</span>
                            </button>
                        );
                    })}
                </div>
            )}

            {/* ── Shows ── */}
            <div className="bms-section">
                {filteredShows.length === 0 ? (
                    <div style={{
                        background: '#fff',
                        borderRadius: 8,
                        padding: '48px 24px',
                        textAlign: 'center',
                        color: '#888',
                        fontSize: 15,
                        boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
                    }}>
                        No shows available for this date.
                    </div>
                ) : (
                    filteredShows.map(show => (
                        <div
                            key={show.show_id}
                            className="show-venue-card"
                            id={`show-${show.show_id}`}
                        >
                            <div className="show-venue-header">
                                <div>
                                    <h3>🖥️ {show.screen.screen_name}</h3>
                                    <p style={{ fontSize: 12, color: '#888', marginTop: 3 }}>
                                        {format(new Date(show.show_time), 'EEEE, MMMM do yyyy')}
                                    </p>
                                </div>
                                <div className="price-info">
                                    Tickets from &nbsp;<strong>₹{show.price}</strong>
                                </div>
                            </div>

                            <div className="show-times-row">
                                <button
                                    className="show-time-chip"
                                    onClick={() => navigate(`/booking/${show.show_id}`)}
                                >
                                    {format(new Date(show.show_time), 'hh:mm a')}
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* ── Footer ── */}
            <div className="bms-footer">
                &copy; {new Date().getFullYear()} &nbsp;<span>BookMyShow</span>&nbsp; MTBC
            </div>
        </div>
    );
};

export default ShowSelection;
