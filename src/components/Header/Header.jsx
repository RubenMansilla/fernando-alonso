import React, { useState } from 'react';
import Navigation from '../Navigation/Navigation';
import './Header.css';

const Header = () => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    return (
        <>
            <Navigation isOpen={isOpen} toggleMenu={toggleMenu} />
            <header className="main-header">
                <div className="brand-logo">
                    <span className="fname">Fernando</span>
                    <span className="lname">Alonso14</span>
                </div>
                <div className="header-actions">
                    <button className={`btn-menu ${isOpen ? 'open' : ''}`} onClick={toggleMenu}>
                        <span className="bar"></span>
                        <span className="bar short"></span>
                    </button>
                </div>
            </header>
        </>
    );
};

export default Header;
