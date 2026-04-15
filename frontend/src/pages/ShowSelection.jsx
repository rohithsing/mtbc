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

    useEffect(() => {
        getShowsByMovie(movieId)
            .then(res => setShows(res.data))
            .catch(() => toast.error("Failed to load shows"))
            .finally(() => setLoading(false));
    }, [movieId]);

    if (loading) return <div className="min-h-screen text-book-brand flex items-center justify-center font-bold text-2xl">Loading Shows...</div>;

    return (
        <div className="min-h-screen bg-book-bg font-sans pb-24 text-gray-800">
            <header className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 shadow-md text-center">
                <button onClick={() => navigate('/movies')} className="absolute left-6 text-sm underline opacity-80 hover:opacity-100">&larr; Back</button>
                <h1 className="text-3xl font-bold tracking-tight">Select Show Timing</h1>
                <p className="text-indigo-200 opacity-90 mt-1">Pick your preferred screen and time</p>
            </header>

            <main className="max-w-4xl mx-auto px-4 mt-8">
                {shows.length === 0 ? (
                    <div className="glass p-12 text-center rounded-3xl mt-10 text-gray-500 font-medium text-lg">No shows currently found for this movie.</div>
                ) : (
                    <div className="flex flex-col gap-4 mt-10">
                        {shows.map(show => (
                            <div key={show.show_id} className="glass rounded-xl p-6 flex flex-col md:flex-row items-center justify-between transition hover:shadow-lg">
                                <div className="mb-4 md:mb-0 text-center md:text-left">
                                    <h3 className="text-xl font-bold text-indigo-900 mb-1">{format(new Date(show.show_time), 'EEEE, MMMM do, yyyy')}</h3>
                                    <p className="text-3xl font-black text-gray-800 mb-1">{format(new Date(show.show_time), 'hh:mm a')}</p>
                                    <p className="text-sm text-gray-500 uppercase tracking-widest">{show.screen.screen_name}</p>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="text-right hidden md:block">
                                        <p className="text-xs text-gray-500 uppercase tracking-wider">Ticket Cost</p>
                                        <p className="text-xl font-bold text-gray-800">₹{show.price}</p>
                                    </div>
                                    <button 
                                        onClick={() => navigate(`/booking/${show.show_id}`)}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-full shadow-md transition transform hover:scale-105"
                                    >
                                        Select Seats
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default ShowSelection;
