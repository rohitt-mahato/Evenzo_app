import React from 'react';
import { Link } from 'react-router-dom';

const PaymentFailed = () => {
    return (
        <div className="bg-background text-on-background min-h-[calc(100vh-80px)] flex flex-col items-center justify-center py-xl px-md">
            <div className="text-center max-w-2xl mb-xl">
                <span className="material-symbols-outlined text-[64px] text-error mb-md" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
                <h1 className="font-display text-display text-primary mb-sm">Booking Failed</h1>
                <h2 className="font-headline-lg md:font-headline-lg-mobile text-headline-lg md:text-headline-lg-mobile text-on-surface mb-md">We couldn't process your payment</h2>
                <p className="font-body-lg text-body-lg text-on-surface-variant mb-lg">Please ensure your payment details are correct and try again. No charges were made to your account.</p>
                
                <div className="flex flex-col sm:flex-row gap-md justify-center">
                    <Link to="/" className="bg-error text-on-error font-label-md text-label-md py-sm px-md rounded-DEFAULT transition-colors duration-200 hover:opacity-90 shadow-sm">
                        Return to Events
                    </Link>
                    <Link to="/dashboard" className="bg-surface-container-lowest text-on-surface font-label-md text-label-md py-sm px-md rounded-DEFAULT border border-outline-variant transition-colors duration-200 hover:bg-surface-container-low">
                        Go to Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default PaymentFailed;
