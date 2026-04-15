import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const BookingDetails = ({ user }) => {
    const { bookingId } = useParams();
    const navigate = useNavigate();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("token");
        axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:3000"}/booking`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(res => {
            const found = res.data.find(b => b.booking_id === parseInt(bookingId));
            setBooking(found);
        })
        .catch(() => toast.error("Failed to load booking details"))
        .finally(() => setLoading(false));
    }, [bookingId]);

    if (loading) return (
        <div className="bms-loading">
            <div className="spinner"></div>
            <p>Fetching Your Ticket...</p>
        </div>
    );

    if (!booking) return (
        <div className="bms-loading">
            <p style={{ color: '#cc0000', fontSize: 18, fontWeight: 600 }}>Booking not found.</p>
            <button
                onClick={() => navigate('/movies')}
                style={{ color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, textDecoration: 'underline', marginTop: 8 }}
            >
                Return to Movies
            </button>
        </div>
    );

    const activeSeats = booking.seats.filter(s => s.status === 'Active').map(s => s.seat.seat_number);
    const showTime = new Date(booking.show.show_time);

    return (
        <div style={{ minHeight: '100vh', background: '#f0f0f5', padding: '40px 5%', fontFamily: 'Poppins, sans-serif' }}>
            
            <nav className="bms-nav" style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100 }}>
                <div className="logo" onClick={() => navigate('/movies')} style={{ cursor: 'pointer' }}>
                    Picture<span>Dekho</span>
                </div>
            </nav>

            <div style={{ maxWidth: 600, margin: '80px auto 0', background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
                {/* Header */}
                <div style={{ background: '#cc0000', color: '#fff', padding: '32px 24px', textAlign: 'center', position: 'relative' }}>
                    <div style={{
                        position: 'absolute', bottom: -12, left: -12, width: 24, height: 24, background: '#f0f0f5', borderRadius: '50%'
                    }}></div>
                    <div style={{
                        position: 'absolute', bottom: -12, right: -12, width: 24, height: 24, background: '#f0f0f5', borderRadius: '50%'
                    }}></div>

                    <h2 style={{ fontSize: 14, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 }}>
                        Booking Confirmed!
                    </h2>
                    <h1 style={{ fontSize: 32, fontWeight: 700, margin: '10px 0' }}>{booking.show?.movie?.title}</h1>
                    <p style={{ fontSize: 14, opacity: 0.9 }}>Booking ID: <strong>#{booking.booking_id}</strong></p>
                </div>

                {/* Ticket Details */}
                <div style={{ padding: '32px 24px', borderBottom: '2px dashed #e0e0e0', position: 'relative' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
                        <div>
                            <p style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Date & Time</p>
                            <p style={{ fontSize: 16, fontWeight: 600, color: '#222' }}>{format(showTime, 'EEE, dd MMM yyyy')}</p>
                            <p style={{ fontSize: 15, fontWeight: 500, color: '#444' }}>{format(showTime, 'hh:mm a')}</p>
                        </div>
                        <div>
                            <p style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Screen</p>
                            <p style={{ fontSize: 16, fontWeight: 600, color: '#222' }}>{booking.show?.screen?.screen_name}</p>
                        </div>
                    </div>

                    <div>
                        <p style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Seats ({activeSeats.length})</p>
                        <p style={{ fontSize: 18, fontWeight: 700, color: '#cc0000', wordWrap: 'break-word' }}>
                            {activeSeats.join(', ')}
                        </p>
                    </div>
                </div>

                {/* Summary & Actions */}
                <div style={{ padding: '24px', background: '#fafafa' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                        <span style={{ fontSize: 14, color: '#555' }}>Total Amount Paid</span>
                        <span style={{ fontSize: 24, fontWeight: 700, color: '#222' }}>₹{booking.total_amount}</span>
                    </div>

                    <div style={{ display: 'flex', gap: 12, flexDirection: 'column' }}>
                        <button 
                            className="bms-google-btn" 
                            style={{ background: '#1a1a2e', color: '#fff', border: 'none', fontWeight: 600 }}
                            onClick={() => navigate('/movies')}
                        >
                            Return to Home
                        </button>
                        <button 
                            className="bms-google-btn" 
                            style={{ background: 'transparent', color: '#cc0000', border: '1px solid #cc0000', fontWeight: 600 }}
                            onClick={() => navigate(`/cancel/${booking.booking_id}`)}
                        >
                            Manage / Cancel Booking
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingDetails;
