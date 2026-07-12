import React, { useState, useEffect, useRef, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/axios';
import { AuthContext } from '../context/AuthContext';

const Home = () => {
    const { user } = useContext(AuthContext);
    const [events, setEvents] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('All');
    const [location, setLocation] = useState('Anywhere');
    const [showAllEvents, setShowAllEvents] = useState(false);
    const [loading, setLoading] = useState(true);
    const [loadingRecs, setLoadingRecs] = useState(false);
    const eventsSectionRef = useRef(null);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchEvents();
        }, 400); // 400ms debounce
        return () => clearTimeout(timeoutId);
    }, [search, category, location]);

    useEffect(() => {
        if (user && user.role !== 'admin') {
            fetchRecommendations();
        }
    }, [user]);

    const fetchRecommendations = async () => {
        setLoadingRecs(true);
        try {
            const { data } = await api.get('/recommendations');
            setRecommendations(data);
        } catch (error) {
            console.error('Error fetching recommendations:', error);
        } finally {
            setLoadingRecs(false);
        }
    };

    const fetchEvents = async () => {
        setLoading(true);
        try {
            let query = `/events?search=${search}`;
            if (category !== 'All') {
                query += `&category=${category}`;
            }
            const { data } = await api.get(query);
            
            let filteredData = Array.isArray(data) ? data : [];
            if (location !== 'Anywhere') {
                filteredData = filteredData.filter(e => e.location && e.location.toLowerCase().includes(location.split(',')[0].toLowerCase()));
            }
            
            setEvents(filteredData);
        } catch (error) {
            console.error('Error fetching events:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        fetchEvents();
        setShowAllEvents(true);
        if (eventsSectionRef.current) {
            eventsSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const handleViewAll = (e) => {
        if (e) e.preventDefault();
        setSearch('');
        setCategory('All');
        setLocation('Anywhere');
        setShowAllEvents(true);
    };

    return (
        <div className="min-h-screen flex flex-col antialiased bg-background text-on-background overflow-x-hidden">
            {/* TopNavBar Component is assumed to be in App.jsx or we can include it here, but let's keep it here for this specific landing page look if it's unique, or just rely on App.jsx. Assuming App.jsx has a nav, we might not need the nav here, but the Stitch design has a specific transparent/sticky nav. Let's include the main content. */}
            
            {/* Main Content Canvas */}
            <main className="flex-grow w-full flex flex-col gap-xl">
                
                {/* 100vh Hero Section */}
                <section className="relative w-full h-screen min-h-[700px] flex items-end pb-xl px-lg md:px-gutter overflow-hidden">
                    {/* Animated Ken Burns Background */}
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1470229722913-7c092bce36c2?auto=format&fit=crop&q=80&w=2000')] bg-cover bg-center animate-kenburns origin-center pointer-events-none"></div>
                    
                    {/* Dark gradient overlay for readability (darker at bottom and left) */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none z-0"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-transparent pointer-events-none z-0"></div>

                    <div className="relative z-10 w-full max-w-container-max mx-auto flex flex-col lg:flex-row justify-between items-end gap-xl pb-lg">
                        
                        {/* Left Side: Massive Typography & Subheadline */}
                        <div className="flex flex-col gap-md max-w-3xl text-white">
                            <h1 className="font-display text-[2.25rem] leading-[1.1] sm:text-[3rem] md:text-[6rem] md:leading-[1.05] tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/70 opacity-0 animate-fade-up delay-100">
                                Find your next<br/>unforgettable<br/>experience
                            </h1>
                            <p className="font-body-lg text-body-lg text-white/80 mt-sm max-w-lg opacity-0 animate-fade-up delay-300">
                                Discover thousands of live events, concerts, workshops, and more tailored to your interests.
                            </p>
                            
                            {/* Stats/Ratings block matching WoodNest bottom-left */}
                            <div className="flex items-center gap-sm mt-md opacity-0 animate-fade-up delay-500">
                                <span className="text-[#F6E05E] text-2xl drop-shadow-[0_0_8px_rgba(246,224,94,0.6)]">★</span>
                                <div>
                                    <span className="font-headline-sm text-headline-sm text-white drop-shadow-md">4.9</span>
                                    <span className="font-body-sm text-body-sm text-white/70 ml-2">from 10,000+ attendees</span>
                                </div>
                            </div>
                        </div>

                        {/* Right Side: Glassmorphism Search Card */}
                        <div className="w-full lg:w-[450px] backdrop-blur-2xl bg-white/10 border border-white/20 rounded-3xl p-xl flex flex-col shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] opacity-0 animate-fade-up delay-700 animate-float-glow">
                            <h2 className="font-headline-md text-headline-md text-white mb-lg flex items-center gap-2">
                                <span className="material-symbols-outlined text-white/80">travel_explore</span>
                                Search Events
                            </h2>
                            
                            <div className="flex flex-col gap-md">
                                {/* Search Input */}
                                <div className="bg-black/40 border border-white/10 rounded-xl flex items-center px-lg py-md focus-within:border-white/40 focus-within:bg-black/60 transition-all duration-300 group">
                                    <span className="material-symbols-outlined text-white/50 mr-sm group-focus-within:text-white transition-colors">search</span>
                                    <input 
                                        type="text" 
                                        placeholder="Events, artists, venues" 
                                        className="w-full bg-transparent border-none focus:ring-0 font-body-lg text-body-lg text-white placeholder:text-white/40 p-0 outline-none"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleSearch();
                                        }}
                                    />
                                </div>

                                {/* Location Dropdown */}
                                <div className="bg-black/40 border border-white/10 rounded-xl flex items-center px-lg py-md focus-within:border-white/40 focus-within:bg-black/60 transition-all duration-300 group">
                                    <span className="material-symbols-outlined text-white/50 mr-sm group-focus-within:text-white transition-colors">location_on</span>
                                    <select 
                                        className="w-full bg-transparent border-none focus:ring-0 font-body-lg text-body-lg text-white cursor-pointer p-0 outline-none appearance-none [&>option]:text-black"
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                    >
                                        <option value="New York, NY">New York, NY</option>
                                        <option value="London, UK">London, UK</option>
                                        <option value="Tokyo, JP">Tokyo, JP</option>
                                        <option value="India">India</option>
                                        <option value="Anywhere">Anywhere</option>
                                    </select>
                                    <span className="material-symbols-outlined text-white/50 ml-auto pointer-events-none group-focus-within:text-white transition-colors">expand_more</span>
                                </div>

                                <button onClick={handleSearch} className="w-full bg-white text-black font-label-lg text-label-lg py-4 rounded-xl hover:bg-gray-100 hover:scale-[1.02] active:scale-[0.98] transition-all mt-sm shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                                    Find Events
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Category Pills (Moved just below hero) */}
                <div className="max-w-container-max mx-auto px-lg md:px-gutter w-full relative z-20 -mt-8">
                    <div className="flex flex-wrap justify-center lg:justify-start gap-sm w-full opacity-0 animate-fade-up delay-900">
                        {['All', 'Music', 'Tech', 'Sports', 'Art', 'Food', 'Comedy'].map(cat => (
                            <button 
                                key={cat}
                                onClick={() => { setCategory(cat); setShowAllEvents(true); }}
                                className={`${category === cat ? 'bg-primary text-on-primary border-primary shadow-[0_4px_14px_0_rgba(0,118,255,0.39)]' : 'bg-surface-container-lowest text-on-surface border-outline-variant shadow-sm'} font-label-md text-label-md px-lg py-sm rounded-full border hover:-translate-y-1 hover:shadow-md transition-all duration-300`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="max-w-container-max mx-auto px-lg md:px-gutter w-full flex flex-col gap-xl">
                    {/* Stats Row */}
                <section className="flex flex-col sm:flex-row justify-center gap-lg sm:gap-xl py-lg border-y border-outline-variant">
                    <div className="text-center">
                        <p className="font-headline-md text-headline-md text-primary">10k+</p>
                        <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Live Events</p>
                    </div>
                    <div className="text-center">
                        <p className="font-headline-md text-headline-md text-primary">1M+</p>
                        <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Attendees</p>
                    </div>
                    <div className="text-center">
                        <p className="font-headline-md text-headline-md text-primary">500+</p>
                        <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Venues</p>
                    </div>
                </section>

                {/* Recommendations Section for Logged In Users */}
                {user && user.role !== 'admin' && !showAllEvents && (
                    <section className="flex flex-col gap-md w-full mt-sm">
                        <h2 className="font-headline-lg md:font-headline-lg text-headline-lg md:text-headline-lg text-primary flex items-center gap-2">
                            <span className="material-symbols-outlined">auto_awesome</span> Recommended for You
                        </h2>
                        
                        {loadingRecs ? (
                            <div className="text-center py-10 font-body-lg text-body-lg text-on-surface-variant">Finding perfect matches...</div>
                        ) : recommendations.length === 0 ? (
                            <div className="text-center py-10 font-body-lg text-body-lg text-on-surface-variant">No recommendations available yet.</div>
                        ) : (
                            <div className="flex overflow-x-auto pb-md gap-md snap-x snap-mandatory">
                                {recommendations.map((event) => {
                                    const isSoldOut = event.availableSeats === 0;
                                    const isLowSeats = event.availableSeats > 0 && event.availableSeats <= 10;
                                    
                                    return (
                                        <Link to={`/events/${event._id}`} key={event._id} className="min-w-[300px] w-[300px] md:min-w-[400px] md:w-[400px] snap-start bg-surface-container-lowest border border-outline-variant rounded-DEFAULT flex flex-col group cursor-pointer hover:border-outline transition-colors">
                                            <div className="h-48 w-full bg-surface-container-high rounded-t-DEFAULT overflow-hidden relative">
                                                {event.image ? (
                                                    <img src={event.image} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                                ) : (
                                                    <div className="w-full h-full bg-gradient-to-br from-secondary-fixed to-surface-variant flex items-center justify-center font-headline-sm text-on-surface-variant uppercase">{event.category}</div>
                                                )}
                                                <span className="absolute top-sm left-sm bg-surface-container-lowest text-on-surface font-label-sm text-label-sm px-sm py-xs rounded-sm shadow-sm">{event.category || 'Event'}</span>
                                            </div>
                                            <div className="p-md flex flex-col gap-xs flex-grow">
                                                <p className="font-label-md text-label-md text-primary uppercase">
                                                    {new Date(event.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} • 
                                                    {new Date(event.date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                                <h3 className="font-headline-sm text-headline-sm text-primary line-clamp-1">{event.title}</h3>
                                                <p className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-xs">
                                                    <span className="material-symbols-outlined text-[16px]">location_on</span> {event.location}
                                                </p>
                                                
                                                <div className="mt-auto pt-sm flex justify-between items-center border-t border-outline-variant border-dashed">
                                                    <span className="font-label-md text-label-md text-primary">
                                                        {event.ticketPrice === 0 ? 'FREE' : `₹${event.ticketPrice}`}
                                                    </span>
                                                    <div className="flex items-center gap-xs">
                                                        <div className={`w-2 h-2 rounded-full ${isSoldOut ? 'bg-error' : isLowSeats ? 'bg-[#F6E05E]' : 'bg-[#10b981]'}`}></div>
                                                        <span className="font-label-sm text-label-sm text-on-surface-variant">
                                                            {isSoldOut ? 'Sold out' : isLowSeats ? 'Few seats' : 'Available'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </section>
                )}

                {/* Featured Events */}
                <section ref={eventsSectionRef} className="flex flex-col gap-md w-full scroll-mt-24">
                    <div className="flex justify-between items-end">
                        <h2 className="font-headline-lg md:font-headline-lg text-headline-lg md:text-headline-lg text-primary">{showAllEvents ? 'All Events' : 'Featured Events'}</h2>
                        {!showAllEvents && (
                            <button onClick={handleViewAll} className="font-label-md text-label-md text-primary hover:underline">View all</button>
                        )}
                        {showAllEvents && (
                            <button onClick={() => setShowAllEvents(false)} className="font-label-md text-label-md text-primary hover:underline">Show less</button>
                        )}
                    </div>
                    
                    {loading ? (
                        <div className="text-center py-20 font-body-lg text-body-lg text-on-surface-variant">Loading events...</div>
                    ) : events.length === 0 ? (
                        <div className="text-center py-20 font-body-lg text-body-lg text-on-surface-variant">No events found matching your search.</div>
                    ) : (
                        <div className={showAllEvents ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-md" : "flex overflow-x-auto pb-md gap-md snap-x snap-mandatory"}>
                            {(showAllEvents ? events : events.slice(0, 4)).map((event) => {
                                const isSoldOut = event.availableSeats === 0;
                                const isLowSeats = event.availableSeats > 0 && event.availableSeats <= 10;
                                
                                return (
                                    <Link to={`/events/${event._id}`} key={event._id} className={`${showAllEvents ? 'w-full' : 'min-w-[300px] w-[300px] md:min-w-[400px] md:w-[400px] snap-start'} bg-surface-container-lowest border border-outline-variant rounded-DEFAULT flex flex-col group cursor-pointer hover:border-outline transition-colors`}>
                                        <div className="h-48 w-full bg-surface-container-high rounded-t-DEFAULT overflow-hidden relative">
                                            {event.image ? (
                                                <img src={event.image} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-secondary-fixed to-surface-variant flex items-center justify-center font-headline-sm text-on-surface-variant uppercase">{event.category}</div>
                                            )}
                                            <span className="absolute top-sm left-sm bg-surface-container-lowest text-on-surface font-label-sm text-label-sm px-sm py-xs rounded-sm shadow-sm">{event.category || 'Event'}</span>
                                        </div>
                                        <div className="p-md flex flex-col gap-xs flex-grow">
                                            <p className="font-label-md text-label-md text-primary uppercase">
                                                {new Date(event.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} • 
                                                {new Date(event.date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                            <h3 className="font-headline-sm text-headline-sm text-primary line-clamp-1">{event.title}</h3>
                                            <p className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-xs">
                                                <span className="material-symbols-outlined text-[16px]">location_on</span> {event.location}
                                            </p>
                                            
                                            <div className="mt-auto pt-sm flex justify-between items-center border-t border-outline-variant border-dashed">
                                                <span className="font-label-md text-label-md text-primary">
                                                    {event.ticketPrice === 0 ? 'FREE' : `₹${event.ticketPrice}`}
                                                </span>
                                                <div className="flex items-center gap-xs">
                                                    <div className={`w-2 h-2 rounded-full ${isSoldOut ? 'bg-error' : isLowSeats ? 'bg-[#F6E05E]' : 'bg-[#10b981]'}`}></div>
                                                    <span className="font-label-sm text-label-sm text-on-surface-variant">
                                                        {isSoldOut ? 'Sold out' : isLowSeats ? 'Few seats' : 'Available'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </section>
                </div>
            </main>

            {/* Footer Component */}
            <footer className="bg-surface-container-lowest border-t border-outline-variant w-full py-xl px-lg mt-xl flex flex-col md:flex-row justify-between items-center max-w-container-max mx-auto transition-all duration-200">
                <div className="flex flex-col gap-xs items-center md:items-start mb-md md:mb-0">
                    <span className="font-headline-sm text-headline-sm font-bold text-primary">Evenzo</span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">© {new Date().getFullYear()} Evenzo Platform. All rights reserved. | Designed by Rohit Mahato</span>
                </div>
                <div className="flex flex-wrap justify-center gap-md">
                    <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary underline transition-all duration-200" href="#">Terms of Service</a>
                    <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary underline transition-all duration-200" href="#">Privacy Policy</a>
                    <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary underline transition-all duration-200" href="#">Contact Support</a>
                    <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary underline transition-all duration-200" href="#">Help Center</a>
                </div>
            </footer>
        </div>
    );
};

export default Home;
