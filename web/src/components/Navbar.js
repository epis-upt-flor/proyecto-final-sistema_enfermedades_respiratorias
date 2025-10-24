import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  const location = useLocation();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <span className="brand-icon">🏥</span>
          <span className="brand-name">RespiCare</span>
          <span className="brand-subtitle">Sistema de Enfermedades Respiratorias</span>
        </div>
        <div className="navbar-menu">
          <Link 
            to="/" 
            className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
          >
            <span className="nav-icon">🏠</span>
            Inicio
          </Link>
          <Link 
            to="/dashboard" 
            className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
          >
            <span className="nav-icon">⚙️</span>
            Estado del Sistema
          </Link>
          <Link 
            to="/analytics" 
            className={`nav-link ${location.pathname === '/analytics' ? 'active' : ''}`}
          >
            <span className="nav-icon">📊</span>
            Análisis
          </Link>
          <Link 
            to="/heatmap" 
            className={`nav-link ${location.pathname === '/heatmap' ? 'active' : ''}`}
          >
            <span className="nav-icon">🗺️</span>
            Mapa
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

