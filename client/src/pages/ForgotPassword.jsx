import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/axios';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await api.post('/auth/forgot-password', { email });
            setIsSubmitted(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send reset link. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-background text-on-background min-h-screen flex flex-col antialiased">
            <main className="flex-grow flex items-center justify-center p-md sm:p-lg">
                {!isSubmitted ? (
                    <div className="w-full max-w-md bg-surface-container-lowest border border-surface-variant p-xl">
                        <div className="mb-lg">
                            <span className="font-headline-md text-headline-md text-primary tracking-tight">Evenzo</span>
                        </div>
                        <Link to="/login" className="inline-flex items-center text-primary hover:text-on-surface-variant transition-colors duration-200 mb-lg">
                            <span className="material-symbols-outlined mr-sm" style={{ fontSize: '20px' }}>arrow_back</span>
                            <span className="font-label-md text-label-md">Back to login</span>
                        </Link>
                        <div className="mb-xl">
                            <h1 className="font-headline-lg text-headline-lg mb-sm">Forgot your password?</h1>
                            <p className="font-body-md text-body-md text-on-surface-variant">Enter your email and we'll send you a reset link.</p>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-lg">
                                <label className="block font-label-md text-label-md text-on-surface mb-xs" htmlFor="email">Email address</label>
                                <input
                                    className="w-full px-md py-sm border border-surface-variant rounded focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors duration-200 font-body-md text-body-md bg-surface-container-lowest"
                                    id="email"
                                    name="email"
                                    placeholder="name@company.com"
                                    required
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                            <button
                                className="w-full bg-primary-container text-on-primary py-md px-lg font-label-md text-label-md text-center hover:bg-primary transition-colors duration-200"
                                type="submit"
                                disabled={loading}
                            >
                                {loading ? 'Sending...' : 'Send Reset Link'}
                            </button>
                        </form>
                    </div>
                ) : (
                    <div className="w-full max-w-md bg-surface-container-lowest border border-surface-variant p-xl text-center">
                        <div className="mb-lg flex justify-center">
                            <div className="w-16 h-16 rounded-full bg-surface-container-low flex items-center justify-center border border-surface-variant">
                                <span className="material-symbols-outlined text-primary" style={{ fontSize: '32px' }}>mail</span>
                            </div>
                        </div>
                        <h2 className="font-headline-lg text-headline-lg mb-md">Check your inbox</h2>
                        <p className="font-body-md text-body-md text-on-surface-variant mb-xl">
                            We sent a link to <strong className="text-on-surface font-medium">{email}</strong> — expires in 15 minutes.
                        </p>
                        <button
                            className="w-full bg-surface-container-lowest border border-surface-variant text-primary py-md px-lg font-label-md text-label-md text-center hover:bg-surface-container-low transition-colors duration-200 mb-lg"
                            type="button"
                            onClick={() => window.open('mailto:', '_blank')}
                        >
                            Open Email App
                        </button>
                        <div className="font-body-sm text-body-sm text-on-surface-variant">
                            Didn't receive the email?
                            <button
                                className="text-primary hover:underline font-label-sm text-label-sm ml-xs"
                                onClick={() => setIsSubmitted(false)}
                                type="button"
                            >
                                Resend Email
                            </button>
                        </div>
                        <div className="mt-lg pt-lg border-t border-surface-variant">
                            <Link to="/login" className="inline-flex items-center text-on-surface-variant hover:text-primary transition-colors duration-200">
                                <span className="material-symbols-outlined mr-sm" style={{ fontSize: '20px' }}>arrow_back</span>
                                <span className="font-label-md text-label-md">Back to login</span>
                            </Link>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default ForgotPassword;
