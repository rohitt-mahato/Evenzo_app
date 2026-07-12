import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/axios';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, CartesianGrid } from 'recharts';

const AdminDashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [usersList, setUsersList] = useState([]);
    const [analytics, setAnalytics] = useState({
        revenue: [],
        peakHours: [],
        categories: [],
        cancellations: { cancellationRate: 0 }
    });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, events, bookings

    const [showEventForm, setShowEventForm] = useState(false);
    const [formData, setFormData] = useState({
        title: '', description: '', date: '', location: '', category: '', totalSeats: '', ticketPrice: '', image: ''
    });

    useEffect(() => {
        if (!user || user.role !== 'admin') {
            navigate('/login');
            return;
        }
        fetchData();
    }, [user, navigate]);

    const fetchData = async () => {
        try {
            const [eventsRes, bookingsRes, revRes, peakRes, catRes, cancRes, usersRes] = await Promise.all([
                api.get('/events'),
                api.get('/bookings/my'),
                api.get('/analytics/revenue'),
                api.get('/analytics/peak-hours'),
                api.get('/analytics/categories'),
                api.get('/analytics/cancellations'),
                api.get('/users/all')
            ]);
            setEvents(eventsRes.data);
            setBookings(bookingsRes.data);
            setUsersList(usersRes.data);
            setAnalytics({
                revenue: revRes.data,
                peakHours: peakRes.data,
                categories: catRes.data,
                cancellations: cancRes.data
            });
        } catch (error) {
            console.error('Error fetching admin data', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateEvent = async (e) => {
        e.preventDefault();
        try {
            await api.post('/events', formData);
            setShowEventForm(false);
            setFormData({ title: '', description: '', date: '', location: '', category: '', totalSeats: '', ticketPrice: '', image: '' });
            fetchData();
        } catch (error) {
            alert(error.response?.data?.message || 'Error creating event');
        }
    };

    const handleDeleteEvent = async (id) => {
        if (window.confirm('Are you sure you want to delete this event?')) {
            try {
                await api.delete(`/events/${id}`);
                fetchData();
            } catch (error) {
                alert('Error deleting event');
            }
        }
    };

    const handleConfirmBooking = async (id, paymentStatus) => {
        try {
            await api.put(`/bookings/${id}/confirm`, { paymentStatus });
            fetchData();
        } catch (error) {
            alert(error.response?.data?.message || 'Error confirming booking');
        }
    };

    const handleCancelBooking = async (id) => {
        if (window.confirm('Cancel this user\'s booking request?')) {
            try {
                await api.delete(`/bookings/${id}`);
                fetchData();
            } catch (error) {
                alert(error.response?.data?.message || 'Error cancelling booking');
            }
        }
    };

    const handleDeleteUser = async (id) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await api.delete(`/users/${id}`);
                fetchData();
            } catch (error) {
                alert(error.response?.data?.message || 'Error deleting user');
            }
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (loading) return <div className="text-center py-20 font-body-lg text-body-lg text-on-surface-variant h-screen flex items-center justify-center">Loading admin panel...</div>;

    const totalRevenue = bookings.reduce((sum, b) => b.paymentStatus === 'paid' && b.status === 'confirmed' ? sum + b.amount : sum, 0);
    const paidClientsCount = new Set(bookings.filter(b => b.paymentStatus === 'paid' && b.status === 'confirmed').map(b => b.userId?._id)).size;
    const pendingBookings = bookings.filter(b => b.status === 'pending');

    return (
        <div className="flex h-[calc(100vh-0px)] overflow-hidden w-full bg-background text-on-background">
            {/* SideNavBar */}
            <nav className="hidden md:flex flex-col h-screen w-64 fixed left-0 top-0 z-40 p-md bg-surface-container-lowest border-r border-outline-variant">
                <div className="mb-lg px-sm">
                    <h1 className="font-headline-sm text-headline-sm font-bold text-primary">Admin Panel</h1>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">Evenzo Management</p>
                </div>
                <ul className="flex-1 space-y-2">
                    <li>
                        <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-bold font-label-md text-label-md transition-all duration-150 ease-in-out ${activeTab === 'dashboard' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-surface-container-low'}`}>
                            <span className="material-symbols-outlined text-[20px]">dashboard</span>
                            Dashboard
                        </button>
                    </li>
                    <li>
                        <button onClick={() => setActiveTab('events')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-bold font-label-md text-label-md transition-all duration-150 ease-in-out ${activeTab === 'events' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-surface-container-low'}`}>
                            <span className="material-symbols-outlined text-[20px]">event</span>
                            Events
                        </button>
                    </li>
                    <li>
                        <button onClick={() => setActiveTab('users')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-bold font-label-md text-label-md transition-all duration-150 ease-in-out ${activeTab === 'users' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-surface-container-low'}`}>
                            <span className="material-symbols-outlined text-[20px]">people</span>
                            Users
                        </button>
                    </li>
                    <li>
                        <button onClick={() => setActiveTab('bookings')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-bold font-label-md text-label-md transition-all duration-150 ease-in-out ${activeTab === 'bookings' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-surface-container-low'}`}>
                            <span className="material-symbols-outlined text-[20px]">confirmation_number</span>
                            Bookings
                            {pendingBookings.length > 0 && (
                                <span className="ml-auto bg-error text-on-error px-1.5 py-0.5 rounded-sm text-[10px]">{pendingBookings.length}</span>
                            )}
                        </button>
                    </li>
                </ul>
                <div className="mt-auto pt-md border-t border-outline-variant flex flex-col gap-sm">
                    <div className="flex items-center gap-3 px-3">
                        <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-bold">
                            {user.name?.charAt(0) || 'A'}
                        </div>
                        <div>
                            <p className="font-label-md text-label-md font-bold text-on-surface line-clamp-1">{user.name}</p>
                            <p className="font-label-sm text-label-sm text-on-surface-variant">System Admin</p>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-error hover:bg-error-container hover:text-on-error-container transition-all duration-150 ease-in-out font-label-md text-label-md">
                        <span className="material-symbols-outlined text-[20px]">logout</span>
                        Sign out
                    </button>
                </div>
            </nav>

            {/* Main Content Area */}
            <main className="flex-1 ml-0 md:ml-64 flex flex-col h-screen overflow-y-auto w-full">
                {/* TopAppBar */}
                <header className="sticky top-0 z-30 bg-surface-container-lowest border-b border-outline-variant px-lg py-md flex justify-between items-center w-full">
                    <div className="flex items-center gap-4">
                        <button className="md:hidden text-on-surface">
                            <span className="material-symbols-outlined">menu</span>
                        </button>
                        <h2 className="font-headline-md text-headline-md text-primary md:hidden">Admin</h2>
                        <div className="hidden md:flex items-center gap-2">
                            <span className="bg-surface-container px-2 py-1 rounded-sm font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Live Environment</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/')} className="text-on-surface-variant hover:text-primary transition-colors font-label-md text-label-md flex items-center gap-1">
                            <span className="material-symbols-outlined text-[18px]">open_in_new</span> Go to Site
                        </button>
                    </div>
                </header>

                <div className="p-lg md:p-xl space-y-lg max-w-container-max mx-auto w-full pb-20">
                    
                    {activeTab === 'dashboard' && (
                        <>
                            <div className="flex justify-between items-end mb-md">
                                <div>
                                    <h2 className="font-headline-lg text-headline-lg text-primary">Overview</h2>
                                    <p className="font-body-md text-body-md text-on-surface-variant mt-1">Real-time metrics for today.</p>
                                </div>
                                <div className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-[#10B981]"></span>
                                    Last updated: Just now
                                </div>
                            </div>

                            {/* KPI Bento Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md">
                                <div className="bg-surface-container-lowest p-md rounded-lg border border-outline-variant flex flex-col justify-between h-32 relative overflow-hidden">
                                    <div className="flex justify-between items-start">
                                        <span className="font-label-md text-label-md text-on-surface-variant">Total Revenue</span>
                                        <span className="material-symbols-outlined text-on-surface-variant">payments</span>
                                    </div>
                                    <div>
                                        <div className="font-headline-md text-headline-md text-primary">₹{totalRevenue.toLocaleString()}</div>
                                        <div className="font-label-sm text-label-sm text-[#10B981] flex items-center mt-1">Confirmed</div>
                                    </div>
                                </div>
                                <div className="bg-surface-container-lowest p-md rounded-lg border border-outline-variant flex flex-col justify-between h-32 relative overflow-hidden">
                                    <div className="flex justify-between items-start">
                                        <span className="font-label-md text-label-md text-on-surface-variant">Paid Clients</span>
                                        <span className="material-symbols-outlined text-on-surface-variant">group</span>
                                    </div>
                                    <div>
                                        <div className="font-headline-md text-headline-md text-primary">{paidClientsCount}</div>
                                        <div className="font-label-sm text-label-sm text-on-surface-variant mt-1 flex items-center gap-1">Unique users</div>
                                    </div>
                                </div>
                                <div className="bg-surface-container-lowest p-md rounded-lg border border-outline-variant flex flex-col justify-between h-32 relative overflow-hidden">
                                    <div className="flex justify-between items-start">
                                        <span className="font-label-md text-label-md text-on-surface-variant">Active Events</span>
                                        <span className="material-symbols-outlined text-on-surface-variant">event</span>
                                    </div>
                                    <div>
                                        <div className="font-headline-md text-headline-md text-primary">{events.length}</div>
                                        <div className="font-label-sm text-label-sm text-on-surface-variant mt-1">Published events</div>
                                    </div>
                                </div>
                                <div className="bg-surface-container-lowest p-md rounded-lg border border-outline-variant flex flex-col justify-between h-32 relative overflow-hidden">
                                    <div className="flex justify-between items-start">
                                        <span className="font-label-md text-label-md text-on-surface-variant">Pending Bookings</span>
                                        <span className="material-symbols-outlined text-on-surface-variant">hourglass_empty</span>
                                    </div>
                                    <div>
                                        <div className="font-headline-md text-headline-md text-primary">{pendingBookings.length}</div>
                                        <div className="font-label-sm text-label-sm text-error mt-1 flex items-center gap-1">Requires approval</div>
                                    </div>
                                </div>
                            </div>

                            {/* Main Data Section */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg mt-lg">
                                {/* Revenue Chart */}
                                <div className="bg-surface-container-lowest p-md rounded-lg border border-outline-variant flex flex-col h-[350px]">
                                    <div className="flex justify-between items-center mb-md">
                                        <h3 className="font-headline-sm text-headline-sm text-primary">Revenue Trend (₹)</h3>
                                    </div>
                                    <div className="flex-1 w-full text-body-sm font-body-sm">
                                        {analytics.revenue.length > 0 ? (
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={analytics.revenue}>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                                    <XAxis dataKey="_id" tick={{fill: '#76777c'}} axisLine={{stroke: '#e2e8f0'}} tickLine={false} />
                                                    <YAxis tick={{fill: '#76777c'}} axisLine={false} tickLine={false} />
                                                    <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: 'none', backgroundColor: '#1e293b', color: '#fff' }} cursor={{fill: 'rgba(255,255,255,0.1)'}} />
                                                    <Bar dataKey="totalRevenue" fill="#6366f1" radius={[4, 4, 0, 0]} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <div className="h-full flex items-center justify-center text-on-surface-variant">No revenue data yet.</div>
                                        )}
                                    </div>
                                </div>

                                {/* Categories Pie Chart */}
                                <div className="bg-surface-container-lowest p-md rounded-lg border border-outline-variant flex flex-col h-[350px]">
                                    <div className="flex justify-between items-center mb-md">
                                        <h3 className="font-headline-sm text-headline-sm text-primary">Bookings by Category</h3>
                                    </div>
                                    <div className="flex-1 w-full">
                                        {analytics.categories.length > 0 ? (
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie data={analytics.categories} dataKey="count" nameKey="category" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} label={({category, percent}) => `${category} (${(percent * 100).toFixed(0)}%)`}>
                                                        {analytics.categories.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'][index % 5]} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: 'none', backgroundColor: '#1e293b', color: '#fff' }} />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <div className="h-full flex items-center justify-center text-on-surface-variant">No category data yet.</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === 'events' && (
                        <>
                            <div className="flex justify-between items-end mb-md">
                                <div>
                                    <h2 className="font-headline-lg text-headline-lg text-primary">Manage Events</h2>
                                    <p className="font-body-md text-body-md text-on-surface-variant mt-1">Create and manage your events.</p>
                                </div>
                                <button onClick={() => setShowEventForm(!showEventForm)} className="bg-primary-container text-on-primary font-label-md text-label-md px-md py-sm rounded-DEFAULT hover:bg-on-surface transition-colors flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[18px]">{showEventForm ? 'close' : 'add'}</span>
                                    {showEventForm ? 'Cancel' : 'New Event'}
                                </button>
                            </div>

                            {showEventForm && (
                                <div className="bg-surface-container-lowest p-lg rounded-lg border border-outline-variant mb-lg animate-in fade-in slide-in-from-top-4">
                                    <h3 className="font-headline-sm text-headline-sm text-primary mb-md">Event Details</h3>
                                    <form onSubmit={handleCreateEvent} className="grid grid-cols-1 md:grid-cols-2 gap-md">
                                        <div className="flex flex-col gap-xs">
                                            <label className="font-label-sm text-label-sm text-on-surface">Title</label>
                                            <input required type="text" className="w-full bg-surface border border-outline-variant rounded px-sm py-2 font-body-sm focus:outline-none focus:border-primary-container" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                                        </div>
                                        <div className="flex flex-col gap-xs">
                                            <label className="font-label-sm text-label-sm text-on-surface">Category</label>
                                            <input required type="text" className="w-full bg-surface border border-outline-variant rounded px-sm py-2 font-body-sm focus:outline-none focus:border-primary-container" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} />
                                        </div>
                                        <div className="flex flex-col gap-xs">
                                            <label className="font-label-sm text-label-sm text-on-surface">Date</label>
                                            <input required type="date" className="w-full bg-surface border border-outline-variant rounded px-sm py-2 font-body-sm focus:outline-none focus:border-primary-container" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
                                        </div>
                                        <div className="flex flex-col gap-xs">
                                            <label className="font-label-sm text-label-sm text-on-surface">Location</label>
                                            <input required type="text" className="w-full bg-surface border border-outline-variant rounded px-sm py-2 font-body-sm focus:outline-none focus:border-primary-container" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} />
                                        </div>
                                        <div className="flex flex-col gap-xs">
                                            <label className="font-label-sm text-label-sm text-on-surface">Total Seats</label>
                                            <input required type="number" className="w-full bg-surface border border-outline-variant rounded px-sm py-2 font-body-sm focus:outline-none focus:border-primary-container" value={formData.totalSeats} onChange={e => setFormData({ ...formData, totalSeats: e.target.value })} />
                                        </div>
                                        <div className="flex flex-col gap-xs">
                                            <label className="font-label-sm text-label-sm text-on-surface">Ticket Price (₹)</label>
                                            <input required type="number" className="w-full bg-surface border border-outline-variant rounded px-sm py-2 font-body-sm focus:outline-none focus:border-primary-container" value={formData.ticketPrice} onChange={e => setFormData({ ...formData, ticketPrice: e.target.value })} />
                                        </div>
                                        <div className="md:col-span-2 flex flex-col gap-xs">
                                            <label className="font-label-sm text-label-sm text-on-surface">Image URL</label>
                                            <input type="text" className="w-full bg-surface border border-outline-variant rounded px-sm py-2 font-body-sm focus:outline-none focus:border-primary-container" value={formData.image} onChange={e => setFormData({ ...formData, image: e.target.value })} />
                                        </div>
                                        <div className="md:col-span-2 flex flex-col gap-xs">
                                            <label className="font-label-sm text-label-sm text-on-surface">Description</label>
                                            <textarea required rows="4" className="w-full bg-surface border border-outline-variant rounded px-sm py-2 font-body-sm focus:outline-none focus:border-primary-container resize-none" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}></textarea>
                                        </div>
                                        <button type="submit" className="md:col-span-2 bg-primary-container text-on-primary font-label-md text-label-md py-sm rounded-DEFAULT hover:bg-on-surface transition-colors mt-2">Publish Event</button>
                                    </form>
                                </div>
                            )}

                            {/* Data Table */}
                            <div className="bg-surface-container-lowest rounded-lg border border-outline-variant overflow-hidden">
                                <div className="overflow-x-auto w-full">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm border-b border-outline-variant">
                                                <th className="p-4 font-semibold">Event Details</th>
                                                <th className="p-4 font-semibold">Category</th>
                                                <th className="p-4 font-semibold text-right">Seats</th>
                                                <th className="p-4 font-semibold text-right">Price</th>
                                                <th className="p-4 font-semibold text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="font-body-sm text-body-sm">
                                            {events.length === 0 ? (
                                                <tr><td colSpan="5" className="p-8 text-center text-on-surface-variant">No events found.</td></tr>
                                            ) : events.map(event => (
                                                <tr key={event._id} className="border-b border-outline-variant hover:bg-surface-bright transition-colors group">
                                                    <td className="p-4">
                                                        <div className="font-medium text-on-surface group-hover:text-primary transition-colors">{event.title}</div>
                                                        <div className="text-on-surface-variant text-[12px] mt-0.5">{new Date(event.date).toLocaleDateString()} • {event.location}</div>
                                                    </td>
                                                    <td className="p-4">
                                                        <span className="bg-surface-container text-on-surface px-2 py-0.5 rounded-sm text-[11px] font-bold tracking-wide uppercase">{event.category || 'Event'}</span>
                                                    </td>
                                                    <td className="p-4 text-right">
                                                        <span className={event.availableSeats === 0 ? 'text-error font-bold' : ''}>{event.availableSeats} / {event.totalSeats}</span>
                                                    </td>
                                                    <td className="p-4 text-right font-medium">
                                                        {event.ticketPrice === 0 ? 'Free' : `₹${event.ticketPrice}`}
                                                    </td>
                                                    <td className="p-4 text-right">
                                                        <button onClick={() => handleDeleteEvent(event._id)} className="text-error hover:bg-error-container p-1 rounded transition-colors" title="Delete">
                                                            <span className="material-symbols-outlined text-[20px]">delete</span>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === 'bookings' && (
                        <>
                            <div className="flex justify-between items-end mb-md">
                                <div>
                                    <h2 className="font-headline-lg text-headline-lg text-primary">Booking Approvals</h2>
                                    <p className="font-body-md text-body-md text-on-surface-variant mt-1">Review and manage incoming booking requests.</p>
                                </div>
                                <div className="bg-surface-container px-3 py-1 rounded-sm font-label-sm text-label-sm text-on-surface-variant">
                                    {pendingBookings.length} Pending
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-md">
                                {bookings.length === 0 ? (
                                    <div className="col-span-full p-8 text-center text-on-surface-variant bg-surface-container-lowest rounded-lg border border-outline-variant">No bookings yet.</div>
                                ) : bookings.map(booking => {
                                    const isPending = booking.status === 'pending';
                                    const isConfirmed = booking.status === 'confirmed';
                                    const statusColor = isConfirmed ? 'text-[#10B981] bg-[#DEF7EC]' : booking.status === 'cancelled' ? 'text-error bg-error-container' : 'text-[#D69E2E] bg-[#FEF3C7]';
                                    
                                    return (
                                        <div key={booking._id} className="bg-surface-container-lowest p-md rounded-lg border border-outline-variant flex flex-col gap-sm">
                                            <div className="flex justify-between items-start border-b border-outline-variant pb-sm">
                                                <div>
                                                    <h3 className="font-headline-sm text-headline-sm text-on-surface line-clamp-1">{booking.eventId?.title || 'Deleted Event'}</h3>
                                                    <p className="font-label-sm text-label-sm text-on-surface-variant mt-0.5">{new Date(booking.bookedAt).toLocaleString()}</p>
                                                </div>
                                                <span className={`px-2 py-0.5 rounded-sm text-[11px] font-bold tracking-wide uppercase shrink-0 ml-2 ${statusColor}`}>
                                                    {booking.status}
                                                </span>
                                            </div>
                                            
                                            <div className="flex flex-col gap-xs font-body-sm text-body-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-on-surface-variant">User:</span>
                                                    <span className="font-medium text-on-surface">{booking.userId?.name}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-on-surface-variant">Email:</span>
                                                    <span className="font-medium text-on-surface truncate ml-2">{booking.userId?.email}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-on-surface-variant">Amount:</span>
                                                    <span className="font-medium text-on-surface">{booking.amount === 0 ? 'Free' : `₹${booking.amount}`}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-on-surface-variant">Payment:</span>
                                                    <span className="font-medium text-on-surface">{booking.paymentStatus.replace('_', ' ')}</span>
                                                </div>
                                            </div>

                                            {isPending && (
                                                <div className="mt-auto pt-sm flex gap-2 border-t border-outline-variant">
                                                    <button onClick={() => handleConfirmBooking(booking._id, 'paid')} className="flex-1 bg-[#10B981] text-white hover:bg-[#059669] font-label-sm text-label-sm py-1.5 rounded-sm transition-colors text-center" title="Approve as Paid">
                                                        Approve Paid
                                                    </button>
                                                    <button onClick={() => handleConfirmBooking(booking._id, 'not_paid')} className="flex-1 bg-surface-container-high text-on-surface hover:bg-outline-variant font-label-sm text-label-sm py-1.5 rounded-sm transition-colors text-center" title="Approve Undecided">
                                                        Approve
                                                    </button>
                                                    <button onClick={() => handleCancelBooking(booking._id)} className="w-10 bg-error-container text-error hover:bg-error hover:text-white font-label-sm text-label-sm py-1.5 rounded-sm transition-colors flex items-center justify-center">
                                                        <span className="material-symbols-outlined text-[16px]">close</span>
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}

                    {activeTab === 'users' && (
                        <>
                            <div className="flex justify-between items-end mb-md">
                                <div>
                                    <h2 className="font-headline-lg text-headline-lg text-primary">Manage Users</h2>
                                    <p className="font-body-md text-body-md text-on-surface-variant mt-1">Review registered users and their status.</p>
                                </div>
                                <div className="bg-surface-container px-3 py-1 rounded-sm font-label-sm text-label-sm text-on-surface-variant">
                                    {usersList.length} Total Users
                                </div>
                            </div>
                            <div className="bg-surface-container-lowest rounded-lg border border-outline-variant overflow-hidden">
                                <div className="overflow-x-auto w-full">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm border-b border-outline-variant">
                                                <th className="p-4 font-semibold">User</th>
                                                <th className="p-4 font-semibold">Email</th>
                                                <th className="p-4 font-semibold">Role</th>
                                                <th className="p-4 font-semibold">Status</th>
                                                <th className="p-4 font-semibold text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="font-body-sm text-body-sm">
                                            {usersList.length === 0 ? (
                                                <tr><td colSpan="5" className="p-8 text-center text-on-surface-variant">No users found.</td></tr>
                                            ) : usersList.map(u => (
                                                <tr key={u._id} className="border-b border-outline-variant hover:bg-surface-bright transition-colors group">
                                                    <td className="p-4">
                                                        <div className="font-medium text-on-surface flex items-center gap-2">
                                                            <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
                                                                {u.profilePicture ? <img src={u.profilePicture} alt="Avatar" className="w-full h-full object-cover" /> : u.name?.charAt(0)}
                                                            </div>
                                                            {u.name}
                                                        </div>
                                                    </td>
                                                    <td className="p-4">{u.email}</td>
                                                    <td className="p-4">
                                                        <span className="bg-surface-container text-on-surface px-2 py-0.5 rounded-sm text-[11px] font-bold tracking-wide uppercase">{u.role}</span>
                                                    </td>
                                                    <td className="p-4">
                                                        {u.isVerified ? <span className="text-[#10B981] font-medium">Verified</span> : <span className="text-[#D69E2E] font-medium">Unverified</span>}
                                                    </td>
                                                    <td className="p-4 text-right">
                                                        {u.role !== 'admin' && (
                                                            <button onClick={() => handleDeleteUser(u._id)} className="text-error hover:bg-error-container p-1 rounded transition-colors" title="Delete">
                                                                <span className="material-symbols-outlined text-[20px]">delete</span>
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    )}

                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
