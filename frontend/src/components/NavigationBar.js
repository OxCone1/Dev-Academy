import React from 'react';
import { Link } from 'react-router-dom';
import '../App.css'

const NavigationBar = () => {
    return (
        <nav className="navbar">
            <div className="navContainer">
                <Link to="/" className="navbar-brand">Home</Link>
                <div className="navbar-selector">
                    <div className="nav-item">
                        <Link to="/stations" className="nav-link">Stations</Link>
                    </div>
                    <div className="nav-item">
                        <Link to="/journeys" className="nav-link">Journeys</Link>
                    </div>
                </div>
                <div className="nav-item-login">
                    <Link to="/login" className="nav-login-button">Login</Link>
                </div>
            </div>
        </nav>
    );
};

export default NavigationBar;
