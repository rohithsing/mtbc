import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyBookings } from '../apis';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const UserBookings = ({ user }) => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        getMyBookings()
            .then(res => {
                // Filter specifically for the logged-in user
                const myTickets = res.data.filter(b => b.user_id === user.user_id);
                // Sort by most recently booked
                myTickets.sort((a, b) => new Date(b.booked_at) - new Date(a.booked_at));
                setBookings(myTickets);
            })
            .catch(() => toast.error("Failed to load your bookings."))
            .finally(() => setLoading(false));
    }, [user.user_id]);

    if (loading) return (
        <div className="bms-loading">
            <div className="spinner"></div>
            <p>Loading Your Tickets...</p>
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', background: '#f0f0f5', padding: '40px 5%', fontFamily: 'Poppins, sans-serif' }}>
            {/* Navbar */}
            <nav className="bms-nav" style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100 }}>
                <div className="logo" onClick={() => navigate('/movies')} style={{ cursor: 'pointer' }}>
                    Book<span>My</span>Show
                </div>
                <div className="nav-spacer" />
                <button 
                    onClick={() => navigate('/movies')} 
                    className="nav-user" 
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'Poppins, sans-serif' }}
                >
                    ← Back to Movies
                </button>
            </nav>

            <div style={{ maxWidth: 800, margin: '80px auto 0' }}>
                <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24, color: '#1a1a2e' }}>Your Bookings</h2>

                {bookings.length === 0 ? (
                    <div style={{ background: '#fff', padding: 40, borderRadius: 12, textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                        <p style={{ color: '#888', fontSize: 16 }}>You have no bookings yet.</p>
                        <button 
                            className="bms-google-btn" 
                            style={{ background: '#cc0000', color: '#fff', border: 'none', marginTop: 16, display: 'inline-block', width: 'auto', padding: '10px 24px' }}
                            onClick={() => navigate('/movies')}
                        >
                            Browse Movies
                        </button>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gap: 20 }}>
                        {bookings.map(b => {
                            const showTime = new Date(b.show.show_time);
                            const activeSeats = b.seats.filter(s => s.status === 'Active');
                            const isCancelled = b.status === "Cancelled";

                            return (
                                <div key={b.booking_id} style={{ 
                                    background: '#fff', 
                                    borderRadius: 12, 
                                    padding: 24, 
                                    display: 'flex', 
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                                    opacity: isCancelled ? 0.7 : 1
                                }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                                            <h3 style={{ margin: 0, fontSize: 18 }}>{b.show.movie.title}</h3>
                                            <span className={`badge-bms ${isCancelled ? 'badge-cancelled' : b.status === 'Partially Cancelled' ? 'badge-partial' : 'badge-active'}`}>
                                                {b.status}
                                            </span>
                                        </div>
                                        <p style={{ margin: '0 0 4px', fontSize: 13, color: '#666' }}>
                                            <strong>{format(showTime, 'EEE, dd MMM yyyy • hh:mm a')}</strong> | {b.show.screen.screen_name}
                                        </p>
                                        <p style={{ margin: 0, fontSize: 13, color: '#888' }}>
                                            Booking ID: #{b.booking_id} • Amount: ₹{b.total_amount}
                                        </p>
                                        <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                            {b.seats.map(seatBooking => (
                                                <span key={seatBooking.id} style={{
                                                    fontSize: 11,
                                                    padding: '2px 8px',
                                                    borderRadius: 4,
                                                    background: seatBooking.status === 'Active' ? '#e6f3e6' : '#ffe6e6',
                                                    color: seatBooking.status === 'Active' ? '#2e7d32' : '#c62828',
                                                    border: `1px solid ${seatBooking.status === 'Active' ? '#c8e6c9' : '#ffcdd2'}`
                                                }}>
                                                    Seat {seatBooking.seat.seat_number} {seatBooking.status !== 'Active' ? '(Voided)' : ''}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <button 
                                            className="bms-google-btn"
                                            style={{ 
                                                background: 'transparent', 
                                                color: '#cc0000', 
                                                border: '1px solid #cc0000', 
                                                width: 'max-content',
                                                padding: '8px 16px',
                                                fontSize: 13
                                            }}
                                            onClick={() => navigate(`/booking-details/${b.booking_id}`)}
                                        >
                                            View Ticket
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserBookings;
