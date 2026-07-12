import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../utils/axios';
import { AuthContext } from '../context/AuthContext';
import io from 'socket.io-client';

const EventDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [otp, setOtp] = useState('');
    const [showOTP, setShowOTP] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const { data } = await api.get(`/events/${id}`);
                setEvent(data);
            } catch (err) {
                setError('Failed to load event details.');
            } finally {
                setLoading(false);
            }
        };
        fetchEvent();

        // Setup Socket.IO connection for real-time seat updates
        const socket = io('https://evenzo-app.onrender.com');
        socket.emit('join:event', id);

        socket.on('seat:locked', (data) => {
            if (data.eventId === id) {
                setEvent(prev => {
                    if (!prev) return prev;
                    return { ...prev, availableSeats: data.availableSeats };
                });
            }
        });

        // Clean up socket on unmount
        return () => {
            socket.emit('leave:event', id);
            socket.disconnect();
        };
    }, [id]);

    const handleBooking = async () => {
        if (!user) {
            navigate('/login');
            return;
        }
        setBookingLoading(true);
        setError('');
        setSuccessMsg('');

        try {
            if (!showOTP) {
                await api.post('/bookings/send-otp');
                setShowOTP(true);
                setSuccessMsg('OTP sent to your email. Please verify to confirm booking.');
            } else {
                await api.post('/bookings', { eventId: event._id, otp });
                setSuccessMsg('Booking requested! Awaiting admin confirmation.');
                setShowOTP(false);
                // Navigate to success after a brief delay
                setTimeout(() => navigate('/success'), 1500);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Booking failed');
        } finally {
            setBookingLoading(false);
        }
    };

    if (loading) return <div className="text-center py-20 font-body-lg text-body-lg text-on-surface-variant h-screen flex items-center justify-center">Loading event details...</div>;
    if (error && !event) return (
        <div className="flex-grow flex flex-col items-center justify-center px-md md:px-lg max-w-container-max mx-auto w-full py-xl h-[70vh]">
            <div className="text-center max-w-2xl mb-xl">
                <span className="material-symbols-outlined text-[64px] text-error mb-sm">error</span>
                <h1 className="font-display text-display text-primary mb-sm">Event Not Found</h1>
                <p className="font-body-lg text-body-lg text-on-surface-variant mb-lg">{error}</p>
                <Link to="/" className="bg-primary-container text-on-primary font-label-md text-label-md py-sm px-md rounded transition-colors duration-200 hover:opacity-90">
                    Browse Events
                </Link>
            </div>
        </div>
    );

    const isSoldOut = event.availableSeats <= 0;

    return (
        <div className="bg-background text-on-background min-h-screen flex flex-col w-full">
            <main className="flex-grow w-full max-w-container-max mx-auto px-md md:px-lg py-xl">
                {/* Hero Banner */}
                <div className="w-full h-64 md:h-96 bg-surface-container-low rounded-xl overflow-hidden relative border border-outline-variant mb-xl">
                    {event.image ? (
                        <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-surface-container-high flex items-center justify-center text-on-surface-variant text-4xl font-black uppercase tracking-widest">
                            {event.category}
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-primary-container/90 via-primary-container/40 to-transparent flex items-end p-lg">
                        <div className="text-on-primary w-full">
                            <span className="inline-block bg-surface-container-lowest text-on-surface px-3 py-1 rounded-DEFAULT font-label-sm text-label-sm mb-sm uppercase tracking-wider">
                                {event.category}
                            </span>
                            <h1 className="font-display text-display md:text-display text-on-primary mb-sm">{event.title}</h1>
                            <div className="flex flex-wrap items-center gap-sm font-body-md text-body-md opacity-90">
                                <div className="flex items-center gap-xs">
                                    <span className="material-symbols-outlined text-[20px]">calendar_month</span>
                                    <span>{new Date(event.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                </div>
                                <span className="hidden md:inline mx-2">•</span>
                                <div className="flex items-center gap-xs">
                                    <span className="material-symbols-outlined text-[20px]">location_on</span>
                                    <span>{event.location}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-xl relative items-start">
                    {/* Left Column: Details */}
                    <div className="lg:col-span-8 flex flex-col gap-lg">
                        {/* Description */}
                        <section className="bg-surface-container-lowest border border-outline-variant p-lg rounded-xl shadow-sm">
                            <h2 className="font-headline-md text-headline-md text-on-surface mb-md">About the Event</h2>
                            <div className="font-body-md text-body-md text-on-surface-variant whitespace-pre-wrap">
                                {event.description}
                            </div>
                        </section>

                        {/* Venue */}
                        <section className="bg-surface-container-lowest border border-outline-variant p-lg rounded-xl shadow-sm">
                            <h2 className="font-headline-md text-headline-md text-on-surface mb-md">Venue Location</h2>
                            <p className="font-body-md text-body-md text-on-surface-variant mb-md">{event.location}</p>
                            <div className="w-full h-64 bg-surface-container-high rounded-DEFAULT border border-outline-variant relative overflow-hidden flex flex-col items-center justify-center">
                                <span className="material-symbols-outlined text-4xl mb-2 text-on-surface-variant">map</span>
                                <span className="font-label-md text-label-md text-on-surface-variant">Map View ({event.location})</span>
                            </div>
                        </section>
                    </div>

                    {/* Right Column: Booking Widget */}
                    <div className="lg:col-span-4 lg:sticky lg:top-24">
                        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm">
                            <h3 className="font-headline-md text-headline-md text-on-surface mb-sm">Booking Details</h3>
                            <div className="space-y-md mb-lg">
                                {/* Price */}
                                <div className="flex items-center gap-4 text-on-surface">
                                    <div className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center shrink-0">
                                        <span className="material-symbols-outlined">payments</span>
                                    </div>
                                    <div>
                                        <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Ticket Price</p>
                                        <p className="font-headline-sm text-headline-sm text-primary">{event.ticketPrice === 0 ? 'Free' : `₹${event.ticketPrice}`}</p>
                                    </div>
                                </div>

                                {/* Availability */}
                                <div className="flex items-center gap-4 text-on-surface">
                                    <div className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center shrink-0">
                                        <span className="material-symbols-outlined">confirmation_number</span>
                                    </div>
                                    <div>
                                        <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Availability</p>
                                        <p className="font-headline-sm text-headline-sm text-primary">
                                            <span className={event.availableSeats < 10 ? 'text-error' : ''}>{event.availableSeats}</span> / {event.totalSeats} seats
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* OTP Section */}
                            {showOTP && (
                                <div className="mb-md p-md bg-surface-container-low rounded-DEFAULT border border-outline-variant">
                                    <label className="font-label-sm text-label-sm text-on-surface-variant mb-2 block uppercase tracking-wider">Enter OTP to Confirm</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="6-digit code"
                                        className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-DEFAULT focus:border-primary focus:ring-0 text-center text-xl tracking-[0.5em] font-bold text-on-surface transition-colors outline-none"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        maxLength="6"
                                    />
                                    <p className="font-body-sm text-body-sm text-[#059669] mt-2 text-center">{successMsg}</p>
                                </div>
                            )}

                            {error && <div className="mb-md p-sm bg-error-container text-error font-body-sm text-body-sm rounded-DEFAULT text-center">{error}</div>}
                            {!showOTP && successMsg && <div className="mb-md p-sm bg-[#DEF7EC] text-[#03543F] font-body-sm text-body-sm rounded-DEFAULT text-center">{successMsg}</div>}

                            {/* Action Button */}
                            <button
                                onClick={handleBooking}
                                disabled={bookingLoading || (showOTP && !otp)}
                                className={`w-full py-3 px-6 rounded-DEFAULT font-label-md text-label-md transition-colors ${(successMsg && !showOTP)
                                    ? 'bg-surface-variant text-on-surface-variant cursor-not-allowed border border-outline-variant'
                                    : 'bg-primary text-on-primary hover:bg-primary-container border border-primary text-center shadow-sm'
                                    }`}
                            >
                                {bookingLoading ? 'Processing...' : (showOTP ? 'Verify OTP & Confirm' : (successMsg && !showOTP ? 'Request Sent' : (isSoldOut ? 'Join Waitlist' : 'Book Now')))}
                            </button>
                            <p className="text-center font-label-sm text-label-sm text-on-surface-variant mt-sm">Secure booking powered by Evenzo</p>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-surface-container-lowest border-t border-outline-variant w-full py-xl px-lg mt-auto flex flex-col md:flex-row justify-between items-center max-w-container-max mx-auto">
                <div className="mb-md md:mb-0 text-center md:text-left">
                    <span className="font-headline-sm text-headline-sm font-bold text-primary block mb-xs">Evenzo</span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">© {new Date().getFullYear()} Evenzo Platform. All rights reserved. | Designed by Rohit Mahato</span>
                </div>
                <div className="flex flex-wrap justify-center gap-md font-label-sm text-label-sm text-on-surface-variant">
                    <Link to="#" className="hover:text-primary underline transition-all duration-200">Terms of Service</Link>
                    <Link to="#" className="hover:text-primary underline transition-all duration-200">Privacy Policy</Link>
                    <Link to="#" className="hover:text-primary underline transition-all duration-200">Contact Support</Link>
                </div>
            </footer>
        </div>
    );
};

export default EventDetail;
