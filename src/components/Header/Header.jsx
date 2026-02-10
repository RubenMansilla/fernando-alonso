import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Navigation from '../Navigation/Navigation';
import './Header.css';

const Header = () => {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();
    const isCalendar = location.pathname === '/calendar';

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    return (
        <>
            <Navigation isOpen={isOpen} toggleMenu={toggleMenu} />
            <header className={`main-header ${isCalendar ? 'calendar-mode' : ''}`}>
                <div className="brand-logo">
                    <span className="fname">
                        <span className="text-full">Fernando</span>
                        <span className="text-short">F</span>
                    </span>
                    <span className="lname">
                        <span className="text-full">Alonso14</span>
                        <span className="text-short">A14</span>
                    </span>
                </div>
                <div className="header-actions">
                    <button className={`btn-menu ${isOpen ? 'open' : ''}`} onClick={toggleMenu}>
                        {isOpen ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 24 24"><g fill="#f4f4ed" fillRule="evenodd" clipRule="evenodd"><path d="M5.47 5.47a.75.75 0 0 1 1.06 0l12 12a.75.75 0 1 1-1.06 1.06l-12-12a.75.75 0 0 1 0-1.06" /><path d="M18.53 5.47a.75.75 0 0 1 0 1.06l-12 12a.75.75 0 0 1-1.06-1.06l12-12a.75.75 0 0 1 1.06 0" /></g></svg>
                        ) : (
                            <>
                                <span className="bar"></span>
                                <span className="bar short"></span>
                            </>
                        )}
                    </button>
                </div>
            </header>
        </>
    );
};

export default Header;
