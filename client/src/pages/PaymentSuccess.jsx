import React from 'react';
import { Link } from 'react-router-dom';

const PaymentSuccess = () => {
    return (
        <div className="bg-background text-on-background min-h-[calc(100vh-80px)] flex flex-col items-center justify-center py-xl px-md">
            {/* Success Header */}
            <div className="text-center mb-xl max-w-2xl mx-auto flex flex-col items-center">
                <span className="material-symbols-outlined text-[64px] text-[#10B981] mb-md" style={{ fontVariationSettings: "'FILL' 1" }}>hourglass_top</span>
                <h1 className="font-display text-display text-primary mb-sm">Booking Request Sent!</h1>
                <p className="font-body-lg text-body-lg text-on-surface-variant">Your ticket request has been submitted and is awaiting admin confirmation.</p>
            </div>

            {/* Next Steps */}
            <div className="w-full max-w-[480px] bg-surface-container-lowest border border-outline-variant rounded-DEFAULT p-lg mb-xl shadow-sm">
                <h3 className="font-headline-sm text-headline-sm text-primary mb-md">Next Steps</h3>
                <ul className="flex flex-col gap-md">
                    <li className="flex items-start gap-md">
                        <div className="mt-xs bg-surface-container-low p-xs rounded-full text-on-surface-variant">
                            <span className="material-symbols-outlined text-[20px]">admin_panel_settings</span>
                        </div>
                        <div>
                            <p className="font-label-md text-label-md text-primary">Awaiting Confirmation</p>
                            <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">An admin will review and confirm your booking shortly.</p>
                        </div>
                    </li>
                    <li className="flex items-start gap-md">
                        <div className="mt-xs bg-surface-container-low p-xs rounded-full text-on-surface-variant">
                            <span className="material-symbols-outlined text-[20px]">mail</span>
                        </div>
                        <div>
                            <p className="font-label-md text-label-md text-primary">Ticket Delivery</p>
                            <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">Once confirmed, you'll receive your digital ticket (PDF) via email.</p>
                        </div>
                    </li>
                </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-md w-full max-w-[480px]">
                <Link to="/dashboard" className="flex-1 text-center bg-primary-container text-on-primary font-label-md text-label-md py-sm px-md rounded-DEFAULT hover:opacity-90 transition-opacity shadow-sm">
                    View My Tickets
                </Link>
                <Link to="/" className="flex-1 text-center border border-outline-variant text-primary font-label-md text-label-md py-sm px-md rounded-DEFAULT hover:bg-surface-container-low transition-colors">
                    Discover More Events
                </Link>
            </div>
        </div>
    );
};

export default PaymentSuccess;
