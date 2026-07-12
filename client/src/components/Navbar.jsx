import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Close mobile menu on route change
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [location.pathname]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isHome = location.pathname === '/';

    return (
        <nav className={`${isHome ? 'bg-transparent absolute text-white border-b border-white/10' : 'bg-surface-container-lowest sticky border-b border-outline-variant'} top-0 left-0 right-0 z-50 flex flex-col w-full transition-colors duration-200 ease-in-out`}>
            {/* Top Bar */}
            <div className="flex justify-between items-center px-4 md:px-lg py-md w-full max-w-container-max mx-auto">
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
                <div className="flex items-center gap-sm md:gap-md">
                    <ThemeToggle />
                    {/* Desktop Nav Items */}
                    <div className="hidden md:flex items-center gap-md">
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
                    {/* Mobile Hamburger Button */}
                    <button
                        className="md:hidden flex items-center justify-center w-10 h-10 rounded-DEFAULT transition-colors"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label="Toggle mobile menu"
                    >
                        <span className={`material-symbols-outlined text-[24px] ${isHome ? 'text-white' : 'text-on-surface'}`}>
                            {mobileMenuOpen ? 'close' : 'menu'}
                        </span>
                    </button>
                </div>
            </div>

            {/* Mobile Drawer */}
            <div
                className={`md:hidden overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${mobileMenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}
            >
                <div className={`flex flex-col gap-xs px-4 pb-4 pt-2 border-t ${isHome ? 'border-white/10 bg-black/60 backdrop-blur-xl' : 'border-outline-variant bg-surface-container-lowest'}`}>
                    {/* Navigation Links */}
                    <Link to="/" className={`flex items-center gap-sm px-3 py-2.5 rounded-lg font-label-md text-label-md transition-colors ${isHome ? 'text-white hover:bg-white/10' : location.pathname === '/' ? 'text-primary bg-surface-container-low' : 'text-on-surface-variant hover:bg-surface-container-low'}`}>
                        <span className="material-symbols-outlined text-[20px]">explore</span>
                        Browse Events
                    </Link>
                    {user && user.role !== 'admin' && (
                        <Link to="/dashboard" className={`flex items-center gap-sm px-3 py-2.5 rounded-lg font-label-md text-label-md transition-colors ${isHome ? 'text-white hover:bg-white/10' : location.pathname === '/dashboard' ? 'text-primary bg-surface-container-low' : 'text-on-surface-variant hover:bg-surface-container-low'}`}>
                            <span className="material-symbols-outlined text-[20px]">confirmation_number</span>
                            My Tickets
                        </Link>
                    )}

                    {/* Divider */}
                    <div className={`h-px my-1 ${isHome ? 'bg-white/10' : 'bg-outline-variant'}`}></div>

                    {/* Auth Links */}
                    {user ? (
                        <>
                            {user.role === 'admin' && (
                                <Link to="/admin" className={`flex items-center gap-sm px-3 py-2.5 rounded-lg font-label-md text-label-md transition-colors ${isHome ? 'text-white hover:bg-white/10' : 'text-on-surface-variant hover:bg-surface-container-low'}`}>
                                    <span className="material-symbols-outlined text-[20px]">admin_panel_settings</span>
                                    Admin Dashboard
                                </Link>
                            )}
                            <Link to="/profile" className={`flex items-center gap-sm px-3 py-2.5 rounded-lg font-label-md text-label-md transition-colors ${isHome ? 'text-white hover:bg-white/10' : 'text-on-surface hover:bg-surface-container-low'}`}>
                                <span className="material-symbols-outlined text-[20px]">person</span>
                                Profile
                            </Link>
                            <button onClick={handleLogout} className={`flex items-center gap-sm px-3 py-2.5 rounded-lg font-label-md text-label-md transition-colors text-left w-full ${isHome ? 'text-[#ffb4ab] hover:bg-white/10' : 'text-error hover:bg-error-container'}`}>
                                <span className="material-symbols-outlined text-[20px]">logout</span>
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className={`flex items-center gap-sm px-3 py-2.5 rounded-lg font-label-md text-label-md transition-colors ${isHome ? 'text-white hover:bg-white/10' : 'text-primary hover:bg-surface-container-low'}`}>
                                <span className="material-symbols-outlined text-[20px]">login</span>
                                Sign In
                            </Link>
                            <Link to="/register" className={`flex items-center justify-center gap-sm px-3 py-2.5 rounded-lg font-label-md text-label-md transition-colors ${isHome ? 'bg-white text-black hover:bg-white/90' : 'bg-primary-container text-on-primary hover:bg-on-surface'}`}>
                                <span className="material-symbols-outlined text-[20px]">person_add</span>
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
