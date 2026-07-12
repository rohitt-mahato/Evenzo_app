import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/axios';

const Profile = () => {
    const { user, updateUser } = useContext(AuthContext);
    
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phone, setPhone] = useState('');
    const [city, setCity] = useState('');
    
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const { data } = await api.get('/users/profile');
                if (data.name) {
                    const parts = data.name.split(' ');
                    setFirstName(parts[0] || '');
                    setLastName(parts.slice(1).join(' ') || '');
                }
                setPhone(data.phone || '');
                setCity(data.city || '');
            } catch (err) {
                setError('Failed to load profile data.');
            } finally {
                setFetching(false);
            }
        };

        if (user) {
            fetchProfile();
        } else {
            setFetching(false);
        }
    }, [user]);

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');
        
        try {
            const name = `${firstName} ${lastName}`.trim();
            const { data } = await api.put('/users/profile', { name, phone, city });
            
            updateUser(data);
            setSuccess('Profile updated successfully.');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update profile.');
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const formData = new FormData();
        formData.append('image', file);
        
        try {
            setLoading(true);
            const { data } = await api.post('/users/profile-picture', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            updateUser({ ...user, profilePicture: data.profilePicture });
            setSuccess('Profile picture updated!');
        } catch (err) {
            setError(err.response?.data?.message || 'Error uploading picture');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return <div className="text-center py-20 font-body-lg text-on-surface-variant h-screen flex items-center justify-center">Loading profile...</div>;
    }

    if (!user) {
        return <div className="text-center py-20 font-body-lg text-on-surface-variant h-screen flex items-center justify-center">Please log in to view your profile.</div>;
    }

    return (
        <div className="bg-background text-on-background font-body-md text-body-md antialiased min-h-screen flex flex-col w-full">
            <main className="flex-grow w-full max-w-container-max mx-auto px-lg py-xl grid grid-cols-1 lg:grid-cols-12 gap-xl">
                {/* Left Sidebar - Settings Navigation */}
                <aside className="lg:col-span-3 flex flex-col gap-lg border-r border-outline-variant pr-md lg:min-h-[calc(100vh-100px)] hidden md:flex">
                    {/* User Summary */}
                    <div className="flex items-center gap-md mb-md">
                        <div className="w-16 h-16 rounded-full bg-surface-container-high overflow-hidden border border-outline-variant flex-shrink-0 flex items-center justify-center text-xl font-bold">
                            {user.profilePicture ? (
                                <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                `${firstName.charAt(0)}${lastName.charAt(0) || user.email.charAt(0).toUpperCase()}`
                            )}
                        </div>
                        <div className="flex flex-col overflow-hidden text-ellipsis whitespace-nowrap">
                            <h2 className="font-headline-sm text-headline-sm text-on-surface truncate">{firstName} {lastName}</h2>
                            <span className="font-body-sm text-body-sm text-on-surface-variant truncate">{user.email}</span>
                        </div>
                    </div>
                    
                    {/* Settings Links */}
                    <nav className="flex flex-col gap-xs">
                        <a className="flex items-center gap-md px-md py-sm bg-surface-container text-on-surface rounded font-label-md text-label-md transition-colors" href="#">
                            <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
                            Profile
                        </a>
                        <a className="flex items-center gap-md px-md py-sm text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface rounded font-body-md text-body-md transition-colors" href="#">
                            <span className="material-symbols-outlined">lock</span>
                            Security
                        </a>
                        <a className="flex items-center gap-md px-md py-sm text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface rounded font-body-md text-body-md transition-colors" href="#">
                            <span className="material-symbols-outlined">notifications_active</span>
                            Notifications
                        </a>
                        <a className="flex items-center gap-md px-md py-sm text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface rounded font-body-md text-body-md transition-colors" href="#">
                            <span className="material-symbols-outlined">credit_card</span>
                            Payment Methods
                        </a>
                    </nav>
                </aside>

                {/* Main Panel - Profile Details */}
                <section className="lg:col-span-9 flex flex-col gap-xl">
                    <div className="border-b border-outline-variant pb-md">
                        <h1 className="font-headline-lg text-headline-lg text-on-background">Profile Settings</h1>
                        <p className="font-body-md text-body-md text-on-surface-variant mt-xs">Manage your personal information and preferences.</p>
                    </div>

                    {/* Profile Picture Section */}
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-md sm:gap-lg text-center sm:text-left">
                        <div className="w-24 h-24 rounded-full bg-surface-container-highest overflow-hidden border border-outline-variant flex-shrink-0 flex items-center justify-center text-3xl font-bold text-on-surface-variant">
                            {user.profilePicture ? (
                                <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                `${firstName.charAt(0)}${lastName.charAt(0) || user.email.charAt(0).toUpperCase()}`
                            )}
                        </div>
                        <div className="flex flex-col gap-sm">
                            <div className="flex justify-center sm:justify-start gap-sm">
                                <label className="bg-surface hover:bg-surface-container-low text-on-surface border border-outline-variant px-md py-sm rounded font-label-md text-label-md transition-colors cursor-pointer text-center">
                                    Change Picture
                                    <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                                </label>
                            </div>
                            <span className="font-body-sm text-body-sm text-on-surface-variant">JPG, GIF or PNG. Max size of 5MB.</span>
                        </div>
                    </div>

                    {/* Form Details */}
                    <form className="flex flex-col gap-lg max-w-2xl" onSubmit={handleSave}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
                            <div className="flex flex-col gap-xs">
                                <label className="font-label-sm text-label-sm text-on-surface" htmlFor="firstName">First Name</label>
                                <input 
                                    className="w-full bg-surface border border-outline-variant rounded p-sm font-body-md text-body-md text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-shadow" 
                                    id="firstName" 
                                    type="text" 
                                    required
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                />
                            </div>
                            <div className="flex flex-col gap-xs">
                                <label className="font-label-sm text-label-sm text-on-surface" htmlFor="lastName">Last Name</label>
                                <input 
                                    className="w-full bg-surface border border-outline-variant rounded p-sm font-body-md text-body-md text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-shadow" 
                                    id="lastName" 
                                    type="text" 
                                    required
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-xs">
                            <label className="font-label-sm text-label-sm text-on-surface" htmlFor="email">Email Address</label>
                            <input 
                                className="w-full bg-surface-container-low border border-outline-variant rounded p-sm font-body-md text-body-md text-on-surface-variant cursor-not-allowed" 
                                id="email" 
                                readOnly 
                                type="email" 
                                value={user.email}
                            />
                            <span className="font-body-sm text-body-sm text-on-surface-variant mt-xs">Email cannot be changed directly. Contact support for assistance.</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
                            <div className="flex flex-col gap-xs">
                                <label className="font-label-sm text-label-sm text-on-surface" htmlFor="phone">Phone Number</label>
                                <input 
                                    className="w-full bg-surface border border-outline-variant rounded p-sm font-body-md text-body-md text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-shadow" 
                                    id="phone" 
                                    type="tel" 
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                />
                            </div>
                            <div className="flex flex-col gap-xs">
                                <label className="font-label-sm text-label-sm text-on-surface" htmlFor="city">City</label>
                                <input 
                                    className="w-full bg-surface border border-outline-variant rounded p-sm font-body-md text-body-md text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-shadow" 
                                    id="city" 
                                    type="text" 
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                />
                            </div>
                        </div>
                        
                        {error && <p className="text-red-500 font-body-sm text-body-sm">{error}</p>}
                        {success && <p className="text-[#10B981] font-body-sm text-body-sm">{success}</p>}

                        {/* Actions */}
                        <div className="flex gap-md pt-md border-t border-outline-variant mt-sm">
                            <button 
                                className="bg-primary text-on-primary px-lg py-sm rounded font-label-md text-label-md hover:bg-inverse-surface transition-colors" 
                                type="submit"
                                disabled={loading}
                            >
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                            <button 
                                className="bg-surface text-on-surface border border-outline-variant px-lg py-sm rounded font-label-md text-label-md hover:bg-surface-container-low transition-colors" 
                                type="button"
                                onClick={() => {
                                    setFirstName(user?.name?.split(' ')[0] || '');
                                    setLastName(user?.name?.split(' ')[1] || '');
                                    setPhone('');
                                    setCity('');
                                    setSuccess('');
                                    setError('');
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </section>
            </main>
        </div>
    );
};

export default Profile;
