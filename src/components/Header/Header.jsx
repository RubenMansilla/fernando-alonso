import React from 'react';
import './Header.css';

const Header = () => {
    return (
        <header className="main-header">
            <div className="brand-logo">
                <span className="fname">Fernando</span>
                <span className="lname">Alonso <span style={{ fontWeight: 300 }}>14</span></span>
            </div>
            <div className="header-actions">
                <button className="btn-store">
                    <svg className="icon-bag" viewBox="0 0 24 24">
                        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                        <line x1="3" y1="6" x2="21" y2="6"></line>
                        <path d="M16 10a4 4 0 0 1-8 0"></path>
                    </svg>
                    Store
                </button>
                <button className="btn-menu">
                    <span className="bar"></span>
                    <span className="bar short"></span>
                </button>
            </div>
        </header>
    );
};

export default Header;
