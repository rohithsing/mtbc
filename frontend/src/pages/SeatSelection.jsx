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
        if (selectedSeats.length === 0) return toast.error("Select seats first");
        
        const totalCost = selectedSeats.length * (show?.price || 0);
        const confirmed = window.confirm(
            `Confirm Booking?\n\n` +
            `Movie: ${show?.movie?.title}\n` +
            `Screen: ${show?.screen?.screen_name}\n` +
            `Time: ${show ? format(new Date(show.show_time), 'dd MMM yyyy, hh:mm a') : ''}\n` +
            `Tickets: ${selectedSeats.length}\n` +
            `Total: ₹${totalCost}\n\n` +
            `Proceed?`
        );
        if (!confirmed) return;

        setBooking(true);
        createBooking({
            user_id: user.user_id,
            show_id: parseInt(showId),
            seat_ids: selectedSeats
        })
        .then(res => {
            toast.success("Booking Confirmed!");
            setSeats(prev => prev.map(s => selectedSeats.includes(s.seat_id) ? {...s, isBooked: true} : s));
            setSelectedSeats([]);
            navigate(`/cancel/${res.data.booking_id}`);
        })
        .catch(err => {
            toast.error(err.response?.data?.error || "Booking failed");
        })
        .finally(() => setBooking(false));
    }

    if (loading) return <div className="min-h-screen text-book-brand flex items-center justify-center font-bold text-2xl">Loading...</div>;

    const totalAmount = selectedSeats.length * (show?.price || 0);

    // Group seats by row for grid display
    const seatsByRow = {};
    seats.forEach(seat => {
        const row = seat.seat_number.charAt(0);
        if (!seatsByRow[row]) seatsByRow[row] = [];
        seatsByRow[row].push(seat);
    });
    // Sort seats within each row
    Object.values(seatsByRow).forEach(rowSeats => {
        rowSeats.sort((a, b) => {
            const numA = parseInt(a.seat_number.slice(1));
            const numB = parseInt(b.seat_number.slice(1));
            return numA - numB;
        });
    });

    return (
        <div className="min-h-screen bg-book-bg font-sans pb-28 text-gray-800">
            {/* Header with show info */}
            <header className="bg-gradient-to-r from-book-brand to-pink-500 text-white p-6 shadow-md">
                <div className="max-w-4xl mx-auto">
                    <button onClick={() => navigate(-1)} className="text-sm text-pink-200 hover:text-white mb-2 inline-block">&larr; Back to shows</button>
                    <h1 className="text-3xl font-bold tracking-tight">{show?.movie?.title || "Select Your Seats"}</h1>
                    <div className="flex flex-wrap gap-6 mt-2 text-pink-100 text-sm">
                        <span>🖥️ {show?.screen?.screen_name}</span>
                        <span>📅 {show ? format(new Date(show.show_time), 'EEEE, dd MMM yyyy') : ''}</span>
                        <span>🕐 {show ? format(new Date(show.show_time), 'hh:mm a') : ''}</span>
                        <span>💰 ₹{show?.price}/ticket</span>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 mt-8">
                <div className="glass p-8 rounded-3xl">
                    
                    {/* Screen Curve */}
                    <div className="relative w-full max-w-xl mx-auto mb-12 mt-4">
                      <div className="h-6 w-full border-t-[8px] border-solid border-gray-300 rounded-[100%] shadow-[0_-15px_30px_rgba(255,51,102,0.15)]"></div>
                      <p className="text-center text-xs text-gray-400 mt-2 tracking-widest uppercase">Screen</p>
                    </div>

                    {/* Seat Grid — organized by rows */}
                    <div className="flex flex-col gap-3 items-center">
                        {Object.entries(seatsByRow).map(([row, rowSeats]) => (
                            <div key={row} className="flex items-center gap-2">
                                <span className="w-6 text-center text-xs font-bold text-gray-400">{row}</span>
                                <div className="flex gap-2">
                                    {rowSeats.map(seat => {
                                        const isSelected = selectedSeats.includes(seat.seat_id);
                                        return (
                                            <button
                                                key={seat.seat_id}
                                                disabled={seat.isBooked}
                                                onClick={() => handleToggleSeat(seat)}
                                                title={seat.seat_number}
                                                className={`
                                                    w-10 h-10 rounded-lg flex items-center justify-center text-xs font-semibold transition-all duration-200 transform
                                                    ${seat.isBooked 
                                                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-50' 
                                                        : isSelected 
                                                            ? 'bg-book-brand text-white shadow-lg scale-110' 
                                                            : 'bg-white border-2 border-gray-200 text-gray-600 hover:border-book-brand hover:text-book-brand hover:scale-105 shadow-sm'
                                                    }
                                                `}
                                            >
                                                {seat.seat_number.slice(1)}
                                            </button>
                                        );
                                    })}
                                </div>
                                <span className="w-6 text-center text-xs font-bold text-gray-400">{row}</span>
                            </div>
                        ))}
                    </div>
                    
                    {/* Legend */}
                    <div className="mt-10 flex items-center justify-center gap-8 text-sm">
                        <div className="flex items-center gap-2">
                             <div className="w-5 h-5 bg-white border-2 border-gray-200 rounded"></div> Available
                        </div>
                        <div className="flex items-center gap-2">
                             <div className="w-5 h-5 bg-book-brand rounded shadow"></div> Selected
                        </div>
                        <div className="flex items-center gap-2">
                             <div className="w-5 h-5 bg-gray-200 rounded"></div> Booked
                        </div>
                    </div>
                </div>
            </main>

            {/* Bottom Sticky Footer */}
            {selectedSeats.length > 0 && (
                <div className="fixed bottom-0 left-0 w-full glass border-t border-gray-200 py-4 px-6 bg-white/95">
                    <div className="max-w-4xl mx-auto flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 font-medium">{selectedSeats.length} Ticket{selectedSeats.length > 1 ? 's' : ''} × ₹{show?.price}</p>
                            <p className="text-2xl font-bold text-gray-900">₹{totalAmount}</p>
                        </div>
                        
                        <button 
                            disabled={booking}
                            onClick={handleBook}
                            className="bg-book-brand hover:bg-pink-600 text-white font-bold py-3 px-10 rounded-full shadow-xl transition transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed active:scale-95"
                        >
                            {booking ? "Confirming..." : "Book Tickets"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SeatSelection;
