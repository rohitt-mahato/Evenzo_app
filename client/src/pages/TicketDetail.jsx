import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../utils/axios';
import { AuthContext } from '../context/AuthContext';
import { QRCodeSVG } from 'qrcode.react';

const TicketDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchBooking = async () => {
            try {
                // Fetch all user bookings and find the specific one
                const { data } = await api.get('/bookings/my');
                const foundBooking = data.find(b => b._id === id);
                if (foundBooking) {
                    setBooking(foundBooking);
                } else {
                    setError('Ticket not found.');
                }
            } catch (err) {
                setError('Failed to load ticket details.');
            } finally {
                setLoading(false);
            }
        };
        if (user) {
            fetchBooking();
        }
    }, [id, user]);

    if (loading) return <div className="text-center py-20 font-body-lg text-on-surface-variant min-h-[70vh] flex items-center justify-center">Loading ticket details...</div>;
    
    if (error || !booking) return (
        <div className="flex-grow flex flex-col items-center justify-center px-md md:px-lg max-w-container-max mx-auto w-full py-xl min-h-[70vh]">
            <div className="text-center max-w-2xl mb-xl">
                <span className="material-symbols-outlined text-[64px] text-error mb-sm">error</span>
                <h1 className="font-display text-display text-primary mb-sm">Ticket Not Found</h1>
                <p className="font-body-lg text-body-lg text-on-surface-variant mb-lg">{error}</p>
                <Link to="/dashboard" className="bg-primary-container text-on-primary font-label-md text-label-md py-sm px-md rounded transition-colors duration-200 hover:opacity-90">
                    Back to My Tickets
                </Link>
            </div>
        </div>
    );

    const event = booking.eventId;

    return (
        <div className="bg-surface font-sans text-on-surface antialiased min-h-screen flex flex-col">
            <style>
                {`
                .ticket-separator {
                    background-image: linear-gradient(to right, #c6c6cc 50%, transparent 50%);
                    background-position: bottom;
                    background-size: 10px 1px;
                    background-repeat: repeat-x;
                }
                `}
            </style>
            
            <main className="max-w-container-max mx-auto px-md md:px-lg py-lg md:py-xl w-full flex-grow">
                {/* Back Navigation */}
                <div className="mb-lg">
                    <Link to="/dashboard" className="inline-flex items-center gap-xs text-on-surface-variant hover:text-primary transition-colors font-label-md text-label-md">
                        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                        Back to My Tickets
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
                    {/* Left Column: Event Information */}
                    <div className="lg:col-span-8 flex flex-col gap-lg">
                        {/* Event Banner */}
                        <div className="w-full h-64 md:h-80 bg-surface-container-low border border-outline-variant overflow-hidden relative">
                            {event.image ? (
                                <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-surface-container-high flex items-center justify-center text-on-surface-variant text-4xl font-black uppercase tracking-widest">
                                    {event.category}
                                </div>
                            )}
                        </div>

                        {/* Event Details Header */}
                        <div className="flex flex-col gap-sm pt-md">
                            <div className="inline-flex">
                                <span className="bg-surface-container-low text-on-surface font-label-sm text-label-sm px-sm py-xs uppercase tracking-wider">
                                    {event.category}
                                </span>
                            </div>
                            <h1 className="font-headline-lg text-headline-lg text-on-background">{event.title}</h1>
                            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl line-clamp-3">
                                {event.description}
                            </p>
                        </div>

                        {/* Date & Location Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-md border-t border-b border-outline-variant py-md my-sm">
                            <div className="flex gap-md items-start">
                                <span className="material-symbols-outlined text-primary-container mt-xs">calendar_month</span>
                                <div className="flex flex-col">
                                    <span className="font-label-md text-label-md text-on-background">
                                        {new Date(event.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                    </span>
                                </div>
                            </div>
                            <div className="flex gap-md items-start">
                                <span className="material-symbols-outlined text-primary-container mt-xs">location_on</span>
                                <div className="flex flex-col">
                                    <span className="font-label-md text-label-md text-on-background">{event.location}</span>
                                </div>
                            </div>
                        </div>

                        {/* Description Summary */}
                        <div className="flex flex-col gap-sm">
                            <h2 className="font-headline-sm text-headline-sm text-on-background">Event Details</h2>
                            <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed whitespace-pre-wrap">
                                {event.description}
                            </p>
                        </div>
                    </div>

                    {/* Right Column: Digital Ticket & Actions */}
                    <div className="lg:col-span-4 flex flex-col gap-lg">
                        {/* Digital Ticket Card */}
                        <div className="bg-surface-container-lowest border border-outline-variant flex flex-col shadow-sm">
                            {/* Ticket Header / Info */}
                            <div className="p-lg flex flex-col gap-md relative">
                                <div className="flex justify-between items-start">
                                    <div className="flex flex-col">
                                        <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Attendee</span>
                                        <span className="font-headline-sm text-headline-sm text-on-background">{user?.name}</span>
                                    </div>
                                    <div className={`px-sm py-xs rounded ${booking.status === 'confirmed' ? 'bg-[#DEF7EC] text-[#03543F]' : (booking.status === 'cancelled' ? 'bg-error-container text-on-error-container' : 'bg-[#FEF3C7] text-[#92400E]')}`}>
                                        <span className="font-label-sm text-label-sm uppercase tracking-wide">
                                            {booking.status}
                                        </span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-md mt-sm">
                                    <div className="flex flex-col overflow-hidden">
                                        <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Reference No.</span>
                                        <span className="font-label-md text-label-md text-on-background font-mono truncate" title={booking._id}>
                                            {booking._id.substring(0, 10).toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Seat / Tier</span>
                                        <span className="font-label-md text-label-md text-on-background">General</span>
                                    </div>
                                </div>
                            </div>

                            {/* Separator */}
                            <div className="h-4 ticket-separator w-full opacity-50"></div>

                            {/* QR Code Section */}
                            <div className="p-lg flex flex-col items-center justify-center gap-md bg-surface-container-lowest">
                                <div className="w-48 h-48 bg-white border border-outline-variant p-sm flex items-center justify-center">
                                    {booking.ticketToken ? (
                                        <QRCodeSVG value={booking.ticketToken} size={160} />
                                    ) : (
                                        <div className="w-full h-full bg-surface-container-high flex flex-col items-center justify-center border-4 border-dashed border-outline-variant">
                                            <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-2">pending</span>
                                            <span className="font-label-sm text-label-sm text-on-surface-variant text-center px-2">PENDING<br/>CONFIRMATION</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-xs text-on-surface-variant">
                                    <span className="material-symbols-outlined text-[16px]">qr_code_scanner</span>
                                    <span className="font-label-sm text-label-sm">Show this at entry</span>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons Group */}
                        <div className="flex flex-col gap-sm w-full">
                            <button className="w-full bg-primary-container text-on-primary font-label-md text-label-md py-md border border-primary-container hover:bg-opacity-90 transition-opacity flex justify-center items-center gap-xs" onClick={() => window.print()}>
                                <span className="material-symbols-outlined text-[18px]">download</span>
                                Download PDF
                            </button>
                            <div className="grid grid-cols-2 gap-sm">
                                <button className="bg-surface-container-lowest text-on-background font-label-md text-label-md py-sm border border-outline-variant hover:bg-surface-container-low transition-colors flex justify-center items-center gap-xs">
                                    <span className="material-symbols-outlined text-[18px]">share</span>
                                    Share
                                </button>
                                <button className="bg-surface-container-lowest text-on-background font-label-md text-label-md py-sm border border-outline-variant hover:bg-surface-container-low transition-colors flex justify-center items-center gap-xs">
                                    <span className="material-symbols-outlined text-[18px]">calendar_add_on</span>
                                    Add to Calendar
                                </button>
                            </div>
                        </div>

                        {/* Danger Zone */}
                        {booking.status !== 'cancelled' && (
                            <div className="mt-xl pt-lg border-t border-outline-variant flex justify-center">
                                <button className="text-error border border-error bg-surface-container-lowest hover:bg-error-container hover:text-on-error-container font-label-md text-label-md py-sm px-lg transition-colors flex items-center gap-xs w-full justify-center">
                                    <span className="material-symbols-outlined text-[18px]">cancel</span>
                                    Cancel Booking
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default TicketDetail;
