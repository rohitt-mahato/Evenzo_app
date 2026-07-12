import React, { useState, useEffect } from 'react';

const ThemeToggle = () => {
    const [theme, setTheme] = useState(
        localStorage.getItem('theme') === 'dark' ? 'dark' : 'light'
    );

    useEffect(() => {
        const root = document.documentElement;
        
        if (theme === 'dark') {
            root.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            root.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [theme]);

    return (
        <div className="flex bg-surface-container-low border border-outline-variant rounded-full p-1 shadow-inner overflow-hidden relative w-[72px]">
            <button
                onClick={() => setTheme('light')}
                className={`flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300 z-10 relative ${theme === 'light' ? 'text-on-surface' : 'text-on-surface-variant hover:text-on-surface'}`}
                title="Light Mode"
            >
                <span className="material-symbols-outlined text-[18px]">light_mode</span>
            </button>
            <button
                onClick={() => setTheme('dark')}
                className={`flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300 z-10 relative ${theme === 'dark' ? 'text-on-surface' : 'text-on-surface-variant hover:text-on-surface'}`}
                title="Dark Mode"
            >
                <span className="material-symbols-outlined text-[18px]">dark_mode</span>
            </button>
            
            {/* Active background pill */}
            <div 
                className="absolute top-1 left-1 w-8 h-8 bg-surface-container-lowest rounded-full shadow-sm transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] z-0 pointer-events-none"
                style={{ transform: `translateX(${theme === 'light' ? 0 : 32}px)` }}
            />
        </div>
    );
};

export default ThemeToggle;
