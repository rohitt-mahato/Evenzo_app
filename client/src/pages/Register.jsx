import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [showOTP, setShowOTP] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const { register, verifyOTP } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            if (!showOTP) {
                await register(name, email, password);
                setShowOTP(true);
                setError('');
            } else {
                await verifyOTP(email, otp);
                navigate('/dashboard');
            }
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    // Calculate basic password strength for the UI indicator
    const getStrength = (pass) => {
        let str = 0;
        if (pass.length > 0) str++;
        if (pass.length >= 8) str++;
        if (/[A-Z]/.test(pass) && /[0-9]/.test(pass)) str++;
        return str;
    };
    
    const strength = getStrength(password);

    return (
        <main className="w-full max-w-md bg-surface-container-lowest border border-surface-variant rounded-lg p-lg sm:p-xl flex flex-col gap-lg mx-auto mt-16 shadow-sm">
            {/* Header */}
            <header className="flex flex-col items-center text-center gap-sm">
                <h1 className="font-headline-lg text-headline-lg md:font-headline-lg text-primary">Evenzo</h1>
                <h2 className="font-headline-sm text-headline-sm text-on-surface">Create your account</h2>
                <p className="font-body-md text-body-md text-on-surface-variant">Join the platform to discover and book events seamlessly.</p>
            </header>

            {error && <div className="bg-error-container text-on-error-container p-3 rounded-DEFAULT mb-2 text-center border border-error-container font-body-sm text-body-sm">{error}</div>}
            
            {showOTP && (
                <div className="bg-[#E6F4EA] text-[#137333] p-3 rounded-DEFAULT mb-2 text-center border border-[#CEEAD6] font-body-sm text-body-sm">
                    An OTP has been sent to your email. Please verify your account.
                </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-md">
                {!showOTP ? (
                    <>
                        {/* Full Name */}
                        <div className="flex flex-col gap-xs">
                            <label className="font-label-md text-label-md text-on-surface" htmlFor="fullName">Full Name</label>
                            <input 
                                type="text" 
                                id="fullName" 
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Jane Doe" 
                                required 
                                className="w-full h-10 px-md bg-surface border border-outline-variant rounded focus:outline-none focus:ring-1 focus:ring-primary-container focus:border-primary-container font-body-sm text-body-sm text-on-surface placeholder:text-on-surface-variant" 
                            />
                        </div>
                        
                        {/* Email */}
                        <div className="flex flex-col gap-xs">
                            <label className="font-label-md text-label-md text-on-surface" htmlFor="email">Email Address</label>
                            <input 
                                type="email" 
                                id="email" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="jane@example.com" 
                                required 
                                className="w-full h-10 px-md bg-surface border border-outline-variant rounded focus:outline-none focus:ring-1 focus:ring-primary-container focus:border-primary-container font-body-sm text-body-sm text-on-surface placeholder:text-on-surface-variant" 
                            />
                        </div>

                        {/* Password */}
                        <div className="flex flex-col gap-xs relative">
                            <label className="font-label-md text-label-md text-on-surface" htmlFor="password">Password</label>
                            <div className="relative">
                                <input 
                                    type={showPassword ? "text" : "password"}
                                    id="password" 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Create a password" 
                                    required 
                                    className="w-full h-10 px-md pr-10 bg-surface border border-outline-variant rounded focus:outline-none focus:ring-1 focus:ring-primary-container focus:border-primary-container font-body-sm text-body-sm text-on-surface placeholder:text-on-surface-variant" 
                                />
                                <button 
                                    type="button" 
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface focus:outline-none flex items-center"
                                >
                                    <span className="material-symbols-outlined text-[20px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
                                </button>
                            </div>
                            
                            {/* Strength Indicator */}
                            {password.length > 0 && (
                                <div className="flex flex-col gap-xs mt-1">
                                    <div className="flex gap-xs h-1">
                                        <div className={`flex-1 rounded-sm transition-colors duration-300 ${strength >= 1 ? (strength === 1 ? 'bg-error' : strength === 2 ? 'bg-[#F6E05E]' : 'bg-[#48BB78]') : 'bg-surface-container-highest'}`}></div>
                                        <div className={`flex-1 rounded-sm transition-colors duration-300 ${strength >= 2 ? (strength === 2 ? 'bg-[#F6E05E]' : 'bg-[#48BB78]') : 'bg-surface-container-highest'}`}></div>
                                        <div className={`flex-1 rounded-sm transition-colors duration-300 ${strength >= 3 ? 'bg-[#48BB78]' : 'bg-surface-container-highest'}`}></div>
                                    </div>
                                    <span className={`font-label-sm text-label-sm ${strength === 1 ? 'text-error' : strength === 2 ? 'text-[#D69E2E]' : strength === 3 ? 'text-[#38A169]' : 'text-on-surface-variant'}`}>
                                        {strength === 1 ? 'Weak' : strength === 2 ? 'Medium' : strength === 3 ? 'Strong' : 'Password strength'}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Terms Checkbox */}
                        <div className="flex items-start gap-sm mt-xs">
                            <div className="flex items-center h-5">
                                <input type="checkbox" id="terms" required className="w-4 h-4 rounded-sm border-outline-variant text-primary-container focus:ring-0 cursor-pointer" />
                            </div>
                            <label htmlFor="terms" className="font-body-sm text-body-sm text-on-surface-variant cursor-pointer">
                                I agree to the <a href="#" className="text-primary hover:underline">Terms of Service</a> and <a href="#" className="text-primary hover:underline">Privacy Policy</a>.
                            </label>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col gap-xs">
                        <label className="font-label-md text-label-md text-on-surface" htmlFor="otp">Verification Code (OTP)</label>
                        <input 
                            type="text" 
                            id="otp" 
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            placeholder="6-digit code" 
                            required 
                            maxLength="6"
                            className="w-full h-12 px-md bg-surface border border-outline-variant rounded focus:outline-none focus:ring-1 focus:ring-primary-container focus:border-primary-container font-body-sm text-body-sm text-on-surface placeholder:text-on-surface-variant tracking-widest text-center text-lg font-bold" 
                        />
                    </div>
                )}

                {/* Submit Button */}
                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full h-12 mt-sm bg-primary-container text-on-primary font-label-md text-label-md rounded flex items-center justify-center transition-colors hover:bg-on-surface disabled:opacity-50"
                >
                    {loading ? 'Processing...' : (showOTP ? 'Verify & Complete' : 'Create Account')}
                </button>
            </form>

            {!showOTP && (
                <>
                    {/* Divider */}
                    <div className="flex items-center gap-sm">
                        <div className="flex-1 h-px bg-outline-variant"></div>
                        <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">or sign up with</span>
                        <div className="flex-1 h-px bg-outline-variant"></div>
                    </div>

                    {/* Social Auth */}
                    <div className="flex flex-col sm:flex-row gap-md">
                        <button type="button" className="flex-1 h-10 flex items-center justify-center gap-sm border border-outline-variant rounded bg-surface hover:bg-surface-container-low transition-colors text-on-surface font-label-md text-label-md">
                            <span className="material-symbols-outlined text-[18px]">g_mobiledata</span>
                            Google
                        </button>
                        <button type="button" className="flex-1 h-10 flex items-center justify-center gap-sm border border-outline-variant rounded bg-surface hover:bg-surface-container-low transition-colors text-on-surface font-label-md text-label-md">
                            <span className="material-symbols-outlined text-[18px]">social_leaderboard</span>
                            Facebook
                        </button>
                    </div>

                    {/* Footer Link */}
                    <div className="text-center mt-xs">
                        <span className="font-body-sm text-body-sm text-on-surface-variant">Already have an account? </span>
                        <Link to="/login" className="font-label-md text-label-md text-primary hover:underline">Sign in</Link>
                    </div>
                </>
            )}
        </main>
    );
};

export default Register;
