import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/axios';

const NotFound = () => {
    const navigate = useNavigate();
    const [featuredEvents, setFeaturedEvents] = useState([]);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const { data } = await api.get('/events');
                setFeaturedEvents(data.slice(0, 3)); // Show top 3
            } catch (error) {
                console.error('Error fetching events:', error);
            }
        };
        fetchEvents();
    }, []);

    return (
        <div className="bg-background text-on-background min-h-[80vh] flex flex-col font-sans antialiased w-full">
            <main className="flex-grow flex flex-col items-center justify-center px-md md:px-lg max-w-container-max mx-auto w-full py-xl">
                <div className="text-center max-w-2xl mb-xl">
                    <h1 className="font-display text-display text-primary mb-sm">404</h1>
                    <h2 className="font-headline-lg md:font-headline-lg-mobile text-headline-lg md:text-headline-lg-mobile text-on-surface mb-md">This page took the night off</h2>
                    <p className="font-body-lg text-body-lg text-on-surface-variant mb-lg">We couldn't find the page you're looking for. It might have been moved, deleted, or never existed in the first place.</p>
                    <div className="flex flex-col sm:flex-row gap-md justify-center">
                        <Link to="/" className="bg-primary-container text-on-primary font-label-md text-label-md py-sm px-md rounded transition-colors duration-200 hover:bg-on-primary-fixed text-center">
                            Go to Homepage
                        </Link>
                        <Link to="/" className="bg-surface-container-lowest text-on-surface font-label-md text-label-md py-sm px-md rounded border border-outline-variant transition-colors duration-200 hover:bg-surface-container-low text-center">
                            Browse Events
                        </Link>
                    </div>
                </div>

                {featuredEvents.length > 0 && (
                    <section className="w-full mt-xl border-t border-outline-variant pt-xl">
                        <h3 className="font-headline-md text-headline-md text-on-surface mb-lg text-center">Featured upcoming events</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
                            {featuredEvents.map(event => (
                                <div key={event._id} onClick={() => navigate(`/events/${event._id}`)} className="bg-surface-container-lowest border border-outline-variant rounded flex flex-col overflow-hidden hover:bg-surface-container-low transition-colors duration-200 cursor-pointer">
                                    <div className="h-48 w-full bg-surface-container-high relative overflow-hidden">
                                        {event.image ? (
                                            <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-surface-container-high flex items-center justify-center text-on-surface-variant text-2xl font-black uppercase tracking-widest">
                                                {event.category}
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-md flex flex-col flex-grow">
                                        <div className="font-label-sm text-label-sm text-on-surface-variant mb-xs">
                                            {new Date(event.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }).toUpperCase()}
                                        </div>
                                        <h4 className="font-headline-sm text-headline-sm text-on-surface mb-sm">{event.title}</h4>
                                        <div className="flex items-center text-on-surface-variant font-body-sm text-body-sm mt-auto">
                                            <span className="material-symbols-outlined mr-xs text-sm" style={{ fontSize: '16px' }}>location_on</span>
                                            <span>{event.location}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
};

export default NotFound;
