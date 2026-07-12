import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../utils/axios';

const ResetPassword = () => {
    const { token } = useParams();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const calculateStrength = (val) => {
        if (!val) return 0;
        let strength = 0;
        if (val.length > 5) strength += 1;
        if (val.length > 8 && /[A-Z]/.test(val) && /[0-9]/.test(val)) strength += 1;
        if (val.length > 10 && /[^A-Za-z0-9]/.test(val)) strength += 1;
        return strength;
    };

    const strength = calculateStrength(password);

    const getStrengthColor = (level) => {
        if (strength >= level) {
            if (strength === 1) return 'bg-[#F59E0B]';
            return 'bg-[#10B981]';
        }
        return 'bg-surface-variant';
    };

    const getStrengthText = () => {
        if (strength === 0) return '';
        if (strength === 1) return <span className="text-[#F59E0B]">Weak</span>;
        if (strength === 2) return <span className="text-[#10B981]">Good</span>;
        return <span className="text-[#10B981]">Strong</span>;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        setLoading(true);
        setError('');
        
        try {
            await api.post(`/auth/reset-password/${token}`, { password });
            setIsSuccess(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password. Token might be invalid or expired.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-background text-on-background font-body-md min-h-screen flex items-center justify-center p-md">
            <div className="w-full max-w-md">
                {!isSuccess ? (
                    <div className="bg-surface-container-lowest border border-outline-variant p-xl">
                        <h1 className="font-headline-md text-headline-md text-primary mb-md">Set a new password</h1>
                        <p className="font-body-sm text-body-sm text-on-surface-variant mb-lg">Please choose a strong password that you haven't used before.</p>
                        <form className="space-y-lg" onSubmit={handleSubmit}>
                            <div>
                                <label className="block font-label-md text-label-md text-on-surface mb-xs" htmlFor="new-password">New Password</label>
                                <input 
                                    className="w-full border border-outline-variant rounded focus:border-primary focus:ring-0 font-body-md text-body-md px-md py-sm bg-surface-container-lowest" 
                                    id="new-password" 
                                    required 
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <div className="mt-sm flex space-x-xs h-1">
                                    <div className={`flex-1 rounded-full transition-colors duration-300 ${getStrengthColor(1)}`}></div>
                                    <div className={`flex-1 rounded-full transition-colors duration-300 ${getStrengthColor(2)}`}></div>
                                    <div className={`flex-1 rounded-full transition-colors duration-300 ${getStrengthColor(3)}`}></div>
                                </div>
                                <p className="font-label-sm text-label-sm mt-xs h-4">{getStrengthText()}</p>
                            </div>
                            <div>
                                <label className="block font-label-md text-label-md text-on-surface mb-xs" htmlFor="confirm-password">Confirm New Password</label>
                                <input 
                                    className="w-full border border-outline-variant rounded focus:border-primary focus:ring-0 font-body-md text-body-md px-md py-sm bg-surface-container-lowest" 
                                    id="confirm-password" 
                                    required 
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                            </div>
                            {error && <p className="text-red-500 text-sm">{error}</p>}
                            <button 
                                className="w-full bg-primary-container text-on-primary font-label-md text-label-md py-md rounded transition-colors hover:bg-primary" 
                                type="submit"
                                disabled={loading || !password}
                            >
                                {loading ? 'Resetting...' : 'Reset Password'}
                            </button>
                        </form>
                    </div>
                ) : (
                    <div className="bg-surface-container-lowest border border-outline-variant p-xl text-center">
                        <div className="w-16 h-16 rounded-full bg-[#10B981] flex items-center justify-center mx-auto mb-lg text-white">
                            <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>check</span>
                        </div>
                        <h2 className="font-headline-md text-headline-md text-primary mb-sm">Password updated!</h2>
                        <p className="font-body-sm text-body-sm text-on-surface-variant mb-xl">Your password has been changed successfully. You can now log in with your new credentials.</p>
                        <Link 
                            to="/login"
                            className="block w-full bg-primary-container text-on-primary font-label-md text-label-md py-md rounded transition-colors hover:bg-primary text-center"
                        >
                            Go to Login
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResetPassword;
