import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [showOTP, setShowOTP] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const { login, verifyOTP } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            if (!showOTP) {
                const data = await login(email, password);
                if (data.role === 'admin') navigate('/admin');
                else navigate('/dashboard');
            } else {
                const data = await verifyOTP(email, otp);
                if (data.role === 'admin') navigate('/admin');
                else navigate('/dashboard');
            }
        } catch (err) {
            if (err.needsVerification) {
                setShowOTP(true);
                setError('Account not verified. A new OTP has been sent to your email.');
            } else {
                setError(err.message || err);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="w-full max-w-[440px] bg-surface-container-lowest border border-surface-variant p-xl flex flex-col gap-lg rounded-DEFAULT mx-auto mt-20">
            {/* Header */}
            <div className="flex flex-col items-center text-center gap-sm mb-sm">
                <div className="w-12 h-12 bg-primary-container text-on-primary rounded-DEFAULT flex items-center justify-center mb-xs">
                    <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>confirmation_number</span>
                </div>
                <h1 className="font-headline-md text-headline-md text-on-surface">Evenzo</h1>
                <p className="font-body-sm text-body-sm text-on-surface-variant">Sign in to manage your bookings and events.</p>
            </div>

            {error && <div className="bg-error-container text-on-error-container p-3 rounded-DEFAULT mb-4 text-center border border-error-container font-body-sm text-body-sm">{error}</div>}

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-lg">
                <div className="flex flex-col gap-md">
                    {!showOTP ? (
                        <>
                            {/* Email Input */}
                            <div className="flex flex-col gap-xs">
                                <label className="font-label-sm text-label-sm text-on-surface" htmlFor="email">Email address</label>
                                <input 
                                    type="email" 
                                    id="email" 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@company.com" 
                                    required 
                                    className="w-full bg-surface-container-lowest border border-surface-variant rounded-lg px-md py-[10px] font-body-md text-body-md text-on-surface placeholder:text-outline outline-none focus:border-primary-container focus:ring-0 transition-colors" 
                                />
                            </div>
                            
                            {/* Password Input */}
                            <div className="flex flex-col gap-xs relative">
                                <div className="flex justify-between items-center">
                                    <label className="font-label-sm text-label-sm text-on-surface" htmlFor="password">Password</label>
                                    <Link to="/forgot-password" className="font-label-sm text-label-sm text-primary-container hover:underline">Forgot password?</Link>
                                </div>
                                <div className="relative w-full">
                                    <input 
                                        type={showPassword ? "text" : "password"}
                                        id="password" 
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••" 
                                        required 
                                        className="w-full bg-surface-container-lowest border border-surface-variant rounded-lg pl-md pr-xl py-[10px] font-body-md text-body-md text-on-surface placeholder:text-outline outline-none focus:border-primary-container focus:ring-0 transition-colors" 
                                    />
                                    <button 
                                        type="button" 
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface flex items-center justify-center" 
                                        aria-label="Toggle password visibility"
                                    >
                                        <span className="material-symbols-outlined text-[20px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col gap-xs">
                            <label className="font-label-sm text-label-sm text-on-surface" htmlFor="otp">Verification Code (OTP)</label>
                            <input 
                                type="text" 
                                id="otp" 
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                placeholder="6-digit code" 
                                required 
                                maxLength="6"
                                className="w-full bg-surface-container-lowest border border-surface-variant rounded-lg px-md py-[10px] font-body-md text-body-md text-on-surface placeholder:text-outline outline-none focus:border-primary-container focus:ring-0 transition-colors tracking-widest text-center text-lg" 
                            />
                        </div>
                    )}
                </div>

                {!showOTP && (
                    <div className="flex items-center">
                        <input type="checkbox" id="remember" className="w-4 h-4 rounded-DEFAULT border-surface-variant text-primary-container focus:ring-0 focus:ring-offset-0 cursor-pointer" />
                        <label htmlFor="remember" className="ml-sm font-body-sm text-body-sm text-on-surface cursor-pointer select-none">Remember me</label>
                    </div>
                )}

                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-primary-container text-on-primary font-label-md text-label-md py-[12px] px-md rounded-DEFAULT hover:bg-on-surface transition-colors disabled:opacity-50"
                >
                    {loading ? 'Processing...' : (showOTP ? 'Verify OTP & Log In' : 'Sign In')}
                </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-md py-xs">
                <hr className="flex-1 border-t border-surface-variant" />
                <span className="font-label-sm text-label-sm text-on-surface-variant px-xs bg-surface-container-lowest">or continue with</span>
                <hr className="flex-1 border-t border-surface-variant" />
            </div>

            {/* Social Logins */}
            <div className="flex gap-md">
                <button type="button" className="flex-1 flex items-center justify-center gap-sm bg-surface-container-lowest border border-surface-variant py-[10px] px-md rounded-DEFAULT font-label-sm text-label-sm text-on-surface hover:bg-surface-container-low transition-colors">
                    <span className="material-symbols-outlined text-[18px]">g_mobiledata</span>
                    Google
                </button>
                <button type="button" className="flex-1 flex items-center justify-center gap-sm bg-surface-container-lowest border border-surface-variant py-[10px] px-md rounded-DEFAULT font-label-sm text-label-sm text-on-surface hover:bg-surface-container-low transition-colors">
                    <span className="material-symbols-outlined text-[18px]">social_leaderboard</span>
                    Facebook
                </button>
            </div>

            {/* Footer Link */}
            <p className="text-center font-body-sm text-body-sm text-on-surface mt-sm">
                Don't have an account? 
                <Link to="/register" className="font-label-md text-label-md text-primary-container hover:underline ml-xs">Sign up</Link>
            </p>
        </main>
    );
};

export default Login;
