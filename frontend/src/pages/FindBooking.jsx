import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const FindBooking = () => {
    const [bookingId, setBookingId] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        const id = parseInt(bookingId.trim());
        if (!id || isNaN(id)) {
            return toast.error("Please enter a valid Booking ID");
        }
        navigate(`/cancel/${id}`);
    };

    return (
        <div className="bms-login-page">
            <div className="bms-login-card">
                <div className="bms-login-logo">
                    Find<span>Booking</span>
                </div>
                <p className="bms-login-tagline" style={{ marginBottom: 24 }}>
                    Enter your booking reference to view details or cancel tickets.
                </p>

                <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
                    <label style={{ fontSize: 12, color: '#888', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>
                        Booking Reference ID
                    </label>
                    <input 
                        type="text" 
                        placeholder="e.g., 42"
                        value={bookingId}
                        onChange={(e) => setBookingId(e.target.value)}
                        style={{ 
                            width: '100%', 
                            padding: '12px 16px', 
                            marginTop: 8, 
                            marginBottom: 24, 
                            borderRadius: 6, 
                            border: '1px solid #ccc',
                            fontSize: 16,
                            fontFamily: 'Poppins, sans-serif'
                        }}
                    />
                    <button type="submit" className="bms-google-btn" style={{ background: '#cc0000', color: '#fff', border: 'none', fontWeight: 600 }}>
                        Lookup Booking
                    </button>
                    <button type="button" onClick={() => navigate('/movies')} className="bms-google-btn" style={{ marginTop: 12, border: 'none', background: 'transparent', boxShadow: 'none' }}>
                        Return to Movies
                    </button>
                </form>
            </div>
        </div>
    );
};

export default FindBooking;
