import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getShowSeats, createBooking } from '../apis';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const SeatSelection = ({ user }) => {
    const { showId } = useParams();
    const navigate = useNavigate();
    const [seats, setSeats] = useState([]);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [booking, setBooking] = useState(false);
    const [show, setShow] = useState(null);

    useEffect(() => {
        getShowSeats(showId)
            .then(res => {
                setSeats(res.data.seats);
                setShow(res.data.show);
            })
            .catch(() => toast.error("Failed to load seats"))
            .finally(() => setLoading(false));
    }, [showId]);

    const handleToggleSeat = (seat) => {
        if (seat.isBooked) return;
        setSelectedSeats(prev =>
            prev.includes(seat.seat_id)
                ? prev.filter(s => s !== seat.seat_id)
                : [...prev, seat.seat_id]
        );
    };

    const handleBook = () => {
        if (selectedSeats.length === 0) return toast.error("Select at least one seat");

        const totalCost = selectedSeats.length * (show?.price || 0);
        const confirmed = window.confirm(
            `Confirm Booking?\n\n` +
            `Movie: ${show?.movie?.title}\n` +
            `Screen: ${show?.screen?.screen_name}\n` +
            `Time: ${show ? format(new Date(show.show_time), 'dd MMM yyyy, hh:mm a') : ''}\n` +
            `Tickets: ${selectedSeats.length}  ×  ₹${show?.price}\n` +
            `Total: ₹${totalCost}\n\nProceed?`
        );
        if (!confirmed) return;

        setBooking(true);
        createBooking({
            user_id: user.user_id,
            show_id: parseInt(showId),
            seat_ids: selectedSeats
        })
        .then(res => {
            toast.success("Booking Confirmed! 🎉");
            setSeats(prev => prev.map(s =>
                selectedSeats.includes(s.seat_id) ? { ...s, isBooked: true } : s
            ));
            setSelectedSeats([]);
            navigate(`/booking-details/${res.data.booking_id}`);
        })
        .catch(err => {
            toast.error(err.response?.data?.error || "Booking failed");
        })
        .finally(() => setBooking(false));
    };

    if (loading) return (
        <div className="bms-loading">
            <div className="spinner"></div>
            <p>Loading Seats...</p>
        </div>
    );

    const totalAmount = selectedSeats.length * (show?.price || 0);

    // Group seats by row
    const seatsByRow = {};
    seats.forEach(seat => {
        const row = seat.seat_number.charAt(0);
        if (!seatsByRow[row]) seatsByRow[row] = [];
        seatsByRow[row].push(seat);
    });
    Object.values(seatsByRow).forEach(rowSeats =>
        rowSeats.sort((a, b) => parseInt(a.seat_number.slice(1)) - parseInt(b.seat_number.slice(1)))
    );

    return (
        <div style={{ minHeight: '100vh', background: '#f0f0f5', paddingBottom: selectedSeats.length > 0 ? 90 : 40 }}>

            {/* ── Navbar ── */}
            <nav className="bms-nav">
                <div className="logo">Picture<span>Dekho</span></div>
                <div className="nav-spacer" />
                <button
                    onClick={() => navigate(-1)}
                    className="nav-user"
                    style={{ background: 'none', border: 'none', fontFamily: 'Poppins, sans-serif' }}
                >
                    ← Back
                </button>
            </nav>

            {/* ── Page Header ── */}
            <div className="seat-page-header">
                <div className="movie-title">{show?.movie?.title || 'Select Your Seats'}</div>
                <div className="show-meta">
                    <span>🖥️ {show?.screen?.screen_name}</span>
                    <span>📅 {show ? format(new Date(show.show_time), 'EEE, dd MMM yyyy') : ''}</span>
                    <span>🕐 {show ? format(new Date(show.show_time), 'hh:mm a') : ''}</span>
                    <span>💰 ₹{show?.price} / ticket</span>
                </div>
            </div>

            {/* ── Seat Panel ── */}
            <div className="bms-section" style={{ paddingTop: 24 }}>
                <div className="seat-panel-bms">

                    {/* Screen */}
                    <div className="screen-curve"></div>
                    <p className="screen-text">All Eyes This Way Please!</p>

                    {/* Seat Grid */}
                    <div className="seat-grid-wrap">
                        {Object.entries(seatsByRow).map(([row, rowSeats]) => (
                            <div key={row} className="seat-row-bms">
                                <span className="seat-row-label">{row}</span>
                                <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', justifyContent: 'center' }}>
                                    {rowSeats.map(seat => {
                                        const isSelected = selectedSeats.includes(seat.seat_id);
                                        let cls = 'seat-bms';
                                        if (seat.isBooked) cls += ' seat-booked';
                                        else if (isSelected) cls += ' seat-selected';
                                        return (
                                            <button
                                                key={seat.seat_id}
                                                id={`seat-${seat.seat_number}`}
                                                disabled={seat.isBooked}
                                                onClick={() => handleToggleSeat(seat)}
                                                title={seat.seat_number}
                                                className={cls}
                                            >
                                                {seat.seat_number.slice(1)}
                                            </button>
                                        );
                                    })}
                                </div>
                                <span className="seat-row-label">{row}</span>
                            </div>
                        ))}
                    </div>

                    {/* Legend */}
                    <div className="seat-legend-bms">
                        <div className="seat-legend-item">
                            <div className="seat-legend-icon" style={{ background: '#fff', border: '1px solid #ccc' }}></div>
                            Available
                        </div>
                        <div className="seat-legend-item">
                            <div className="seat-legend-icon" style={{ background: '#cc0000', border: '1px solid #cc0000' }}></div>
                            Selected
                        </div>
                        <div className="seat-legend-item">
                            <div className="seat-legend-icon" style={{ background: '#f0f0f0', border: '1px solid #e0e0e0' }}></div>
                            Sold Out
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Sticky Booking Bar ── */}
            {selectedSeats.length > 0 && (
                <div className="bms-booking-bar">
                    <div>
                        <p className="count-label">
                            {selectedSeats.length} Ticket{selectedSeats.length > 1 ? 's' : ''} × ₹{show?.price}
                        </p>
                        <p className="total">₹{totalAmount}</p>
                    </div>

                    <button
                        className="pay-btn"
                        disabled={booking}
                        onClick={handleBook}
                    >
                        {booking ? 'Confirming...' : 'Pay  ₹' + totalAmount + ' →'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default SeatSelection;
