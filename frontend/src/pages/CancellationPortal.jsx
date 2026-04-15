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
        .catch(() => toast.error("Failed to load booking details"))
        .finally(() => setLoading(false));
    }, [bookingId]);

    if (loading) return <div className="min-h-screen bg-cancel-bg text-white flex items-center justify-center text-xl">Accessing secure portal...</div>;
    
    if (!booking) return (
        <div className="min-h-screen bg-cancel-bg text-cancel-danger flex flex-col items-center justify-center gap-4">
            <p className="text-xl font-bold">Booking Record Not Found.</p>
            <button onClick={() => navigate('/movies')} className="text-sm underline text-gray-400 hover:text-white transition">Return to Movies</button>
        </div>
    );

    const activeSeats = booking.seats.filter(s => s.status === 'Active');
    const isTotallyCancelled = booking.status === "Cancelled" || activeSeats.length === 0;

    // Check if show is within 1 hour
    const showTime = new Date(booking.show.show_time);
    const now = new Date();
    const timeDiffMs = showTime.getTime() - now.getTime();
    const isWithinOneHour = timeDiffMs < 60 * 60 * 1000;

    const handleToggle = (seatId) => {
        setSelectedToCancel(prev => 
            prev.includes(seatId) ? prev.filter(id => id !== seatId) : [...prev, seatId]
        );
    }

    const handleCancel = () => {
        if(selectedToCancel.length === 0) return toast.error("Select tickets to cancel");
        
        if(!window.confirm("WARNING: No refunds are issued. Proceed with cancellation?")) return;

        setCancelling(true);
        cancelBooking(bookingId, { seat_ids: selectedToCancel })
            .then(res => {
                toast.success("Seats successfully cancelled");
                setBooking(prev => {
                    const newSeats = prev.seats.map(s => selectedToCancel.includes(s.seat_id) ? {...s, status: 'Cancelled'} : s);
                    const remainingActive = newSeats.filter(s => s.status === 'Active');
                    return {
                        ...prev, 
                        seats: newSeats,
                        status: remainingActive.length === 0 ? "Cancelled" : "Partially Cancelled",
                        total_amount: remainingActive.length * prev.show.price
                    }
                });
                setSelectedToCancel([]);
            })
            .catch(err => {
                toast.error(err.response?.data?.error || "Error executing cancellation");
            })
            .finally(() => setCancelling(false));
    }

    return (
        <div className="min-h-screen bg-cancel-bg text-gray-200 font-sans p-6">
            <div className="max-w-3xl mx-auto mt-10">
                <header className="mb-10 text-center">
                    <h1 className="text-3xl font-bold tracking-[0.2em] text-white uppercase flex flex-col items-center gap-2">
                        <span>Cancellation</span>
                        <span className="text-cancel-danger drop-shadow-[0_0_15px_rgba(220,38,38,0.5)]">Portal</span>
                    </h1>
                </header>

                <div className="glass-dark rounded-xl p-8 shadow-2xl relative overflow-hidden">
                    {/* Warning Tape Decoration */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cancel-danger to-transparent"></div>
                    
                    {/* Booking Info Header */}
                    <div className="mb-6 pb-6 border-b border-gray-800">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-gray-500 uppercase text-xs tracking-widest mb-1">Booking Ref</p>
                                <p className="text-2xl font-bold text-white">#{booking.booking_id}</p>
                            </div>
                            <div className="text-right">
                                <span className={`px-4 py-1 rounded inline-block font-semibold text-xs uppercase tracking-wider
                                    ${booking.status === 'Cancelled' ? 'bg-red-900/50 text-red-400 border border-red-800/50' : 
                                      booking.status === 'Partially Cancelled' ? 'bg-yellow-900/50 text-yellow-400 border border-yellow-800/50' : 
                                      'bg-green-900/50 text-green-400 border border-green-800/50'}
                                `}>
                                    {booking.status}
                                </span>
                            </div>
                        </div>
                        
                        {/* Show Details */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                                <p className="text-gray-500 uppercase text-xs tracking-wider mb-1">Movie</p>
                                <p className="text-white font-medium">{booking.show?.movie?.title || "N/A"}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 uppercase text-xs tracking-wider mb-1">Screen</p>
                                <p className="text-white font-medium">{booking.show?.screen?.screen_name || "N/A"}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 uppercase text-xs tracking-wider mb-1">Show Date</p>
                                <p className="text-white font-medium">{format(showTime, 'dd MMM yyyy')}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 uppercase text-xs tracking-wider mb-1">Show Time</p>
                                <p className="text-white font-medium">{format(showTime, 'hh:mm a')}</p>
                            </div>
                        </div>
                        {booking.booked_at && (
                            <p className="text-gray-600 text-xs mt-3">Booked on: {format(new Date(booking.booked_at), 'dd MMM yyyy, hh:mm a')}</p>
                        )}
                    </div>

                    {isTotallyCancelled ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500 text-lg">This booking has been fully cancelled.</p>
                            <button onClick={() => navigate('/movies')} className="mt-6 text-sm underline text-gray-400 hover:text-white transition">Book New Tickets</button>
                        </div>
                    ) : (
                        <>
                            {/* 1-Hour Warning */}
                            {isWithinOneHour && (
                                <div className="bg-red-950/50 border border-red-800/50 p-4 mb-6 rounded-lg text-center">
                                    <p className="text-red-400 font-bold uppercase tracking-wider text-sm">⚠️ Cancellation Blocked</p>
                                    <p className="text-gray-400 text-xs mt-1">This show starts within 1 hour. Cancellation is no longer permitted.</p>
                                </div>
                            )}

                            <div className="mb-8">
                                <h3 className="text-lg font-medium text-white mb-4">Select tickets to void</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {activeSeats.map(bs => {
                                        const isSelected = selectedToCancel.includes(bs.seat_id);
                                        return (
                                            <button 
                                                key={bs.id}
                                                onClick={() => handleToggle(bs.seat_id)}
                                                disabled={isWithinOneHour}
                                                className={`
                                                    py-4 px-2 rounded-lg border transition-all flex flex-col items-center group
                                                    ${isWithinOneHour ? 'opacity-50 cursor-not-allowed bg-gray-800 border-gray-700 text-gray-500' :
                                                      isSelected 
                                                        ? 'bg-cancel-danger/90 border-cancel-danger text-white hover:bg-cancel-danger' 
                                                        : 'bg-cancel-surface border-gray-700 hover:border-cancel-danger text-gray-300'}
                                                `}
                                            >
                                                <span className="text-xs text-gray-500 uppercase tracking-wider mb-1">Seat</span>
                                                <span className="text-xl font-bold">{bs.seat.seat_number}</span>
                                                <span className="text-xs text-gray-500 mt-1">₹{booking.show.price}</span>
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>

                            <div className="bg-red-950/30 border-l-4 border-cancel-danger p-4 mb-8 rounded-r-md">
                                <p className="text-red-400 text-sm font-medium uppercase tracking-wider mb-1">Strict Policy Enforcement</p>
                                <p className="text-gray-400 text-xs leading-relaxed">
                                    • Cancellation within 1 hour of screening is NOT allowed.<br/>
                                    • NO financial refunds will be processed for any cancellations.<br/>
                                    • Cancelled seats are released back to the public pool.
                                </p>
                            </div>

                            <div className="flex items-center justify-between mt-10">
                                <div>
                                    <p className="text-gray-500 text-xs uppercase mb-1">Tickets to Cancel</p>
                                    <p className="text-white font-bold text-xl">{selectedToCancel.length}</p>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => navigate('/movies')}
                                        className="border border-gray-600 text-gray-400 hover:text-white hover:border-gray-400 font-medium py-3 px-6 rounded transition"
                                    >
                                        Back to Movies
                                    </button>
                                    <button
                                        onClick={handleCancel}
                                        disabled={cancelling || selectedToCancel.length === 0 || isWithinOneHour}
                                        className="bg-cancel-danger hover:bg-red-700 text-white font-bold uppercase tracking-wider py-3 px-8 rounded disabled:opacity-50 disabled:cursor-not-allowed transition shadow-[0_0_15px_rgba(220,38,38,0.3)] hover:shadow-[0_0_25px_rgba(220,38,38,0.5)]"
                                    >
                                        {cancelling ? "Executing Void..." : "Void Tickets"}
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CancellationPortal;
