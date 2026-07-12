import React, { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isHome = location.pathname === '/';

    return (
        <nav className={`${isHome ? 'bg-transparent absolute text-white border-b border-white/10' : 'bg-surface-container-lowest sticky border-b border-outline-variant'} top-0 left-0 right-0 z-50 flex justify-between items-center px-lg py-md w-full transition-colors duration-200 ease-in-out`}>
            <div className="flex items-center gap-lg w-full max-w-container-max mx-auto justify-between">
                <div className="flex items-center gap-lg">
                    <Link to="/" className={`font-headline-md text-headline-md font-bold flex items-center gap-xs ${isHome ? 'text-white' : 'text-primary'}`}>
                        Evenzo
                    </Link>
                    <div className="hidden md:flex gap-md">
                        <Link to="/" className={`font-label-md text-label-md pb-1 transition-colors duration-200 ease-in-out ${isHome ? 'text-white hover:text-white/80 border-b-2 border-white' : location.pathname === '/' ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-low'}`}>Browse</Link>
                        {user && user.role !== 'admin' && (
                            <Link to="/dashboard" className={`font-label-md text-label-md pb-1 transition-colors duration-200 ease-in-out ${isHome ? 'text-white/80 hover:text-white' : location.pathname === '/dashboard' ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-low'}`}>My Tickets</Link>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-md">
                    <ThemeToggle />
                    {user ? (
                        <>
                            {user.role === 'admin' && (
                                <Link to="/admin" className={`font-label-md text-label-md px-md py-sm rounded-DEFAULT transition-colors duration-200 ease-in-out border border-transparent ${isHome ? 'text-white hover:bg-white/10 hover:border-white/20' : 'text-on-surface-variant hover:bg-surface-container-low hover:border-outline-variant'}`}>
                                    Admin Dashboard
                                </Link>
                            )}
                            <Link to="/profile" className={`font-label-md text-label-md px-md py-sm rounded-DEFAULT transition-colors duration-200 ease-in-out border border-transparent ${isHome ? 'text-white hover:bg-white/10 hover:border-white/20' : 'text-on-surface hover:bg-surface-container-low hover:border-outline-variant'}`}>
                                Profile
                            </Link>
                            <button onClick={handleLogout} className={`font-label-md text-label-md px-md py-sm rounded-DEFAULT transition-colors duration-200 ease-in-out border border-transparent ${isHome ? 'text-[#ffb4ab] hover:bg-white/10 hover:border-[#ffb4ab]' : 'text-error hover:bg-error-container hover:border-error'}`}>
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className={`font-label-md text-label-md px-md py-sm rounded-DEFAULT transition-colors duration-200 ease-in-out border border-transparent ${isHome ? 'text-white hover:bg-white/10 hover:border-white/20' : 'text-primary hover:bg-surface-container-low hover:border-outline-variant'}`}>
                                Sign In
                            </Link>
                            <Link to="/register" className={`font-label-md text-label-md px-md py-sm rounded-DEFAULT transition-colors duration-200 ease-in-out ${isHome ? 'bg-white text-black hover:bg-white/90' : 'bg-primary-container text-on-primary hover:bg-on-surface'}`}>
                                Sign Up
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
