import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { cancelBooking } from '../apis';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const CancellationPortal = ({ user }) => {
    const { bookingId } = useParams();
    const navigate = useNavigate();

    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedToCancel, setSelectedToCancel] = useState([]);
    const [cancelling, setCancelling] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");
        axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:3000"}/booking`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(res => {
            const found = res.data.find(b => b.booking_id === parseInt(bookingId));
            setBooking(found);
        })
        .catch(() => toast.error("Failed to load booking"))
        .finally(() => setLoading(false));
    }, [bookingId]);

    if (loading) return (
        <div className="bms-loading">
            <div className="spinner"></div>
            <p>Accessing secure portal...</p>
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

    const activeSeats = booking.seats.filter(s => s.status === 'Active');
    const isTotallyCancelled = booking.status === "Cancelled" || activeSeats.length === 0;
    const showTime = new Date(booking.show.show_time);
    const isWithinOneHour = (showTime.getTime() - Date.now()) < 60 * 60 * 1000;

    const handleToggle = (seatId) =>
        setSelectedToCancel(prev =>
            prev.includes(seatId) ? prev.filter(id => id !== seatId) : [...prev, seatId]
        );

    const handleCancel = () => {
        if (selectedToCancel.length === 0) return toast.error("Select seats to cancel");
        if (!window.confirm("WARNING: No refunds will be issued. Proceed?")) return;

        setCancelling(true);
        cancelBooking(bookingId, { seat_ids: selectedToCancel })
            .then(() => {
                toast.success("Seats cancelled successfully");
                setBooking(prev => {
                    const newSeats = prev.seats.map(s =>
                        selectedToCancel.includes(s.seat_id) ? { ...s, status: 'Cancelled' } : s
                    );
                    const remaining = newSeats.filter(s => s.status === 'Active');
                    return {
                        ...prev,
                        seats: newSeats,
                        status: remaining.length === 0 ? "Cancelled" : "Partially Cancelled",
                        total_amount: remaining.length * prev.show.price
                    };
                });
                setSelectedToCancel([]);
            })
            .catch(err => toast.error(err.response?.data?.error || "Cancellation failed"))
            .finally(() => setCancelling(false));
    };

    const statusClass =
        booking.status === 'Cancelled' ? 'badge-bms badge-cancelled' :
        booking.status === 'Partially Cancelled' ? 'badge-bms badge-partial' :
        'badge-bms badge-active';

    return (
        <div className="cancel-page-bms">

            {/* Header */}
            <div style={{ maxWidth: 820, margin: '0 auto 28px', textAlign: 'center', paddingTop: 10 }}>
                <div style={{ marginBottom: 10 }}>
                    <span style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>
                        Picture<span style={{ color: '#cc0000' }}>Dekho</span>
                    </span>
                </div>
                <h1 className="cancel-page-title">
                    Cancellation <span>Portal</span>
                </h1>
                <p className="cancel-page-sub">Manage your ticket cancellations</p>
            </div>

            {/* Main Card */}
            <div className="cancel-card-bms">

                {/* Booking ID + Status */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                    <div>
                        <p style={{ fontSize: 10, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 4 }}>
                            Booking Reference
                        </p>
                        <p style={{ fontSize: 26, fontWeight: 700, color: '#fff' }}>#{booking.booking_id}</p>
                    </div>
                    <span className={statusClass}>{booking.status}</span>
                </div>

                {/* Show Details */}
                <div className="cancel-info-grid">
                    {[
                        { label: 'Movie', value: booking.show?.movie?.title || 'N/A' },
                        { label: 'Screen', value: booking.show?.screen?.screen_name || 'N/A' },
                        { label: 'Date', value: format(showTime, 'dd MMM yyyy') },
                        { label: 'Time', value: format(showTime, 'hh:mm a') },
                    ].map(item => (
                        <div className="cancel-info-item" key={item.label}>
                            <label>{item.label}</label>
                            <p>{item.value}</p>
                        </div>
                    ))}
                </div>

                {booking.booked_at && (
                    <p style={{ fontSize: 11, color: '#4b5563', marginBottom: 24 }}>
                        Booked on: {format(new Date(booking.booked_at), 'dd MMM yyyy, hh:mm a')}
                    </p>
                )}

                {/* Body */}
                {isTotallyCancelled ? (
                    <div style={{ textAlign: 'center', padding: '48px 0' }}>
                        <p style={{ color: '#6b7280', fontSize: 16, marginBottom: 20 }}>
                            This booking has been fully cancelled.
                        </p>
                        <button
                            onClick={() => navigate('/movies')}
                            className="btn-cancel-ghost"
                        >
                            Browse Movies
                        </button>
                    </div>
                ) : (
                    <>
                        {/* 1-hour block warning */}
                        {isWithinOneHour && (
                            <div style={{
                                background: 'rgba(185,28,28,0.2)',
                                border: '1px solid rgba(239,68,68,0.3)',
                                borderRadius: 8,
                                padding: '14px 18px',
                                marginBottom: 24,
                                textAlign: 'center'
                            }}>
                                <p style={{ color: '#fca5a5', fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
                                    ⚠️ Cancellation Blocked
                                </p>
                                <p style={{ color: '#9ca3af', fontSize: 12, marginTop: 4 }}>
                                    Show starts within 1 hour — cancellations are locked.
                                </p>
                            </div>
                        )}

                        {/* Seat selection */}
                        <h3 style={{ color: '#d1d5db', fontSize: 14, fontWeight: 500, marginBottom: 14 }}>
                            Select seats to void
                        </h3>
                        <div className="cancel-seat-grid">
                            {activeSeats.map(bs => {
                                const isSelected = selectedToCancel.includes(bs.seat_id);
                                return (
                                    <button
                                        key={bs.id}
                                        id={`void-seat-${bs.seat?.seat_number}`}
                                        onClick={() => handleToggle(bs.seat_id)}
                                        disabled={isWithinOneHour}
                                        className={`cancel-seat-tile${isSelected ? ' selected-void' : ''}`}
                                    >
                                        <span className="tile-label">Seat</span>
                                        <span className="tile-num">{bs.seat?.seat_number}</span>
                                        <span className="tile-price">₹{booking.show.price}</span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Policy */}
                        <div className="policy-box">
                            <p className="policy-title">Cancellation Policy</p>
                            <ul>
                                <li>• Cancellation within 1 hour of screening is NOT permitted.</li>
                                <li>• NO financial refunds will be issued for any cancellation.</li>
                                <li>• Voided seats are immediately released to the public.</li>
                            </ul>
                        </div>

                        {/* Actions */}
                        <div className="cancel-actions">
                            <div className="ticket-count">
                                <label>Tickets to Void</label>
                                <span>{selectedToCancel.length}</span>
                            </div>

                            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                                <button
                                    onClick={() => navigate('/movies')}
                                    className="btn-cancel-ghost"
                                >
                                    Back to Movies
                                </button>
                                <button
                                    id="void-tickets-btn"
                                    onClick={handleCancel}
                                    disabled={cancelling || selectedToCancel.length === 0 || isWithinOneHour}
                                    className="btn-void"
                                >
                                    {cancelling ? 'Processing...' : 'Void Tickets'}
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Footer */}
            <div className="bms-footer" style={{ marginTop: 32 }}>
                &copy; {new Date().getFullYear()} &nbsp;<span>PictureDekho</span>&nbsp; MTBC
            </div>
        </div>
    );
};

export default CancellationPortal;
