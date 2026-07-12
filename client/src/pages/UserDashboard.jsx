import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/axios';
import { Link, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';

const UserDashboard = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingRecs, setLoadingRecs] = useState(true);
    const [activeTab, setActiveTab] = useState('All'); // 'All', 'Upcoming', 'Past', 'Cancelled'

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetchBookings();
        fetchRecommendations();

        // Socket connection for real-time updates
        const socket = io('https://evenzo-app.onrender.com');
        socket.emit('join:user', user._id);

        socket.on('booking:confirmed', (data) => {
            fetchBookings(); // Refresh bookings automatically
        });

        return () => {
            socket.disconnect();
        };
    }, [user, navigate]);

    const fetchBookings = async () => {
        try {
            const { data } = await api.get('/bookings/my');
            setBookings(data);
        } catch (error) {
            console.error('Error fetching bookings', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchRecommendations = async () => {
        try {
            const { data } = await api.get('/recommendations');
            setRecommendations(data);
        } catch (error) {
            console.error('Error fetching recommendations', error);
        } finally {
            setLoadingRecs(false);
        }
    };

    const cancelBooking = async (id) => {
        if (window.confirm('Are you sure you want to cancel this booking request?')) {
            try {
                await api.delete(`/bookings/${id}`);
                fetchBookings();
            } catch (error) {
                alert(error.response?.data?.message || 'Error cancelling booking');
            }
        }
    };

    if (loading) return <div className="text-center py-20 font-body-lg text-body-lg text-on-surface-variant h-screen flex items-center justify-center">Loading dashboard...</div>;

    const filteredBookings = bookings.filter(booking => {
        if (activeTab === 'All') return true;
        if (activeTab === 'Cancelled') return booking.status === 'cancelled';
        if (activeTab === 'Upcoming') return booking.status !== 'cancelled' && booking.eventId && new Date(booking.eventId.date) >= new Date();
        if (activeTab === 'Past') return booking.status !== 'cancelled' && booking.eventId && new Date(booking.eventId.date) < new Date();
        return true;
    });

    return (
        <div className="bg-background text-on-background min-h-full flex flex-col font-body-md w-full">
            {/* Main Content Canvas */}
            <main className="flex-grow w-full max-w-container-max mx-auto px-md md:px-lg py-xl flex flex-col gap-xl">
                <section className="flex flex-col gap-lg">
                    <div className="flex items-center gap-md">
                        <div className="w-12 h-12 bg-primary-container text-on-primary rounded-full flex items-center justify-center text-xl font-bold uppercase tracking-widest shrink-0">
                            {user?.name?.charAt(0) || 'U'}
                        </div>
                        <div>
                            <h1 className="font-headline-lg text-headline-lg text-on-surface">My Bookings</h1>
                            <p className="font-body-sm text-body-sm text-on-surface-variant">Welcome back, {user?.name}</p>
                        </div>
                    </div>
                    {/* Tabs */}
                    <div className="flex border-b border-outline-variant gap-lg overflow-x-auto">
                        {['All', 'Upcoming', 'Past', 'Cancelled'].map(tab => (
                            <button 
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`font-label-md text-label-md pb-sm px-xs whitespace-nowrap transition-colors ${activeTab === tab ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant hover:text-primary'}`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </section>

                {/* Bookings List */}
                <section className="flex flex-col gap-md">
                    {filteredBookings.length === 0 ? (
                        <div className="bg-surface-container-lowest rounded-DEFAULT border border-outline-variant p-xl text-center flex flex-col items-center">
                            <div className="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center mb-md">
                                <span className="material-symbols-outlined text-3xl text-on-surface-variant">confirmation_number</span>
                            </div>
                            <p className="font-headline-sm text-headline-sm text-on-surface mb-xs">No bookings found</p>
                            <p className="font-body-md text-body-md text-on-surface-variant mb-lg">You don't have any {activeTab.toLowerCase()} event bookings yet.</p>
                            <Link to="/" className="font-label-md text-label-md bg-primary-container text-on-primary px-lg py-sm rounded-DEFAULT hover:opacity-90 transition-opacity">
                                Browse Events
                            </Link>
                        </div>
                    ) : (
                        filteredBookings.map((booking) => {
                            const isCancelled = booking.status === 'cancelled';
                            const statusColor = booking.status === 'confirmed' ? 'bg-[#DEF7EC] text-[#03543F]' : isCancelled ? 'bg-error-container text-error' : 'bg-[#FEF3C7] text-[#92400E]';
                            
                            return (
                                <div key={booking._id} className="flex bg-surface-container-lowest border border-outline-variant rounded-DEFAULT overflow-hidden group">
                                    <div className={`w-sm shrink-0 ${isCancelled ? 'bg-error' : 'bg-primary-container'}`}></div>
                                    <div className="p-lg flex flex-col gap-md w-full">
                                        {booking.eventId ? (
                                            <>
                                                <div className="flex justify-between items-start w-full">
                                                    <div className="flex flex-col gap-xs">
                                                        <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                                                            {new Date(booking.eventId.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} • 
                                                            {new Date(booking.eventId.date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                        <h3 className="font-headline-sm text-headline-sm text-on-surface">{booking.eventId.title}</h3>
                                                        <div className="flex items-center gap-sm mt-xs text-on-surface-variant">
                                                            <span className="material-symbols-outlined text-[16px]">location_on</span>
                                                            <span className="font-body-sm text-body-sm">{booking.eventId.location}</span>
                                                        </div>
                                                        <div className="flex items-center gap-sm text-on-surface-variant mt-xs">
                                                            <span className="material-symbols-outlined text-[16px]">payments</span>
                                                            <span className="font-body-sm text-body-sm">{booking.amount === 0 ? 'Free' : `₹${booking.amount}`} • {booking.paymentStatus.replace('_', ' ')}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col items-end gap-sm shrink-0 ml-4">
                                                        <span className={`font-label-sm text-label-sm px-sm py-xs rounded-sm uppercase tracking-wider ${statusColor}`}>
                                                            {booking.status}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-md mt-sm border-t border-outline-variant pt-md">
                                                    <Link to={`/events/${booking.eventId._id}`} className="font-label-md text-label-md bg-surface-container-lowest text-on-surface border border-outline-variant px-md py-sm rounded-DEFAULT hover:bg-surface-container-low transition-colors">View Event</Link>
                                                    <Link to={`/ticket/${booking._id}`} className="font-label-md text-label-md bg-primary-container text-on-primary px-md py-sm rounded-DEFAULT hover:opacity-90 transition-opacity">View Ticket</Link>
                                                    {!isCancelled && (
                                                        <button onClick={() => cancelBooking(booking._id)} className="font-label-md text-label-md border border-outline-variant text-error hover:bg-error-container hover:border-error hover:text-error px-md py-sm rounded-DEFAULT transition-colors">Cancel Booking</button>
                                                    )}
                                                </div>
                                            </>
                                        ) : (
                                            <div className="py-md text-error italic font-body-sm text-body-sm">
                                                Event details unavailable (might have been deleted by admin).
                                                {isCancelled ? null : (
                                                    <button onClick={() => cancelBooking(booking._id)} className="ml-4 font-label-md text-label-md border border-outline-variant text-error hover:bg-error-container px-md py-sm rounded-DEFAULT transition-colors">Dismiss</button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </section>

                {/* Recommendations Section */}
                <section className="flex flex-col gap-md mt-lg border-t border-outline-variant pt-xl">
                    <h2 className="font-headline-md text-headline-md text-on-surface flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">auto_awesome</span>
                        Recommended for You
                    </h2>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mb-sm">Based on your past bookings and interests.</p>
                    
                    {loadingRecs ? (
                        <div className="py-8 text-center text-on-surface-variant font-body-sm">Loading recommendations...</div>
                    ) : recommendations.length === 0 ? (
                        <div className="py-8 text-center text-on-surface-variant font-body-sm bg-surface-container-lowest rounded border border-outline-variant">No recommendations available right now.</div>
                    ) : (
                        <div className="flex overflow-x-auto pb-md gap-md snap-x snap-mandatory">
                            {recommendations.map(event => (
                                <Link to={`/events/${event._id}`} key={event._id} className="min-w-[280px] w-[280px] md:min-w-[320px] md:w-[320px] snap-start bg-surface-container-lowest border border-outline-variant rounded-DEFAULT flex flex-col group cursor-pointer hover:border-outline transition-colors">
                                    <div className="h-40 w-full bg-surface-container-high rounded-t-DEFAULT overflow-hidden relative">
                                        {event.image ? (
                                            <img src={event.image} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center font-headline-sm text-on-surface-variant uppercase">{event.category}</div>
                                        )}
                                        <span className="absolute top-sm left-sm bg-surface-container-lowest text-on-surface font-label-sm text-label-sm px-sm py-xs rounded-sm shadow-sm">{event.category}</span>
                                    </div>
                                    <div className="p-md flex flex-col gap-xs flex-grow">
                                        <p className="font-label-md text-label-md text-primary uppercase">
                                            {new Date(event.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                        </p>
                                        <h3 className="font-headline-sm text-headline-sm text-primary line-clamp-1">{event.title}</h3>
                                        <div className="mt-auto pt-sm flex justify-between items-center border-t border-outline-variant border-dashed">
                                            <span className="font-label-md text-label-md text-primary">
                                                {event.ticketPrice === 0 ? 'FREE' : `₹${event.ticketPrice}`}
                                            </span>
                                            <span className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1">
                                                <span className="material-symbols-outlined text-[14px]">visibility</span> View
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </section>
            </main>

            {/* Footer */}
            <footer className="bg-surface-container-lowest border-t border-outline-variant w-full py-xl px-lg mt-auto flex flex-col md:flex-row justify-between items-center max-w-container-max mx-auto transition-all duration-200">
                <div className="font-body-sm text-body-sm text-on-surface-variant mb-md md:mb-0 flex flex-col gap-xs">
                    <span className="font-headline-sm text-headline-sm font-bold text-primary">Evenzo</span>
                    <span>© {new Date().getFullYear()} Evenzo Platform. All rights reserved. | Designed by Rohit Mahato</span>
                </div>
                <nav className="flex flex-wrap justify-center gap-lg">
                    <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary underline transition-colors" href="#">Terms of Service</a>
                    <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary underline transition-colors" href="#">Privacy Policy</a>
                    <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary underline transition-colors" href="#">Contact Support</a>
                    <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary underline transition-colors" href="#">Help Center</a>
                </nav>
            </footer>
        </div>
    );
};

export default UserDashboard;
