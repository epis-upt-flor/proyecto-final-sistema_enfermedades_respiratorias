import React, { memo, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import './Navbar.css';

const NAV_LINKS = [
  { to: '/', label: 'Inicio', icon: '🏠' },
  { to: '/dashboard', label: 'Estado del Sistema', icon: '⚙️' },
  { to: '/analytics', label: 'Análisis', icon: '📊' },
  { to: '/heatmap', label: 'Mapa', icon: '🗺️' }
];

function Navbar() {
  const location = useLocation();

  const links = useMemo(
    () =>
      NAV_LINKS.map(link => ({
        ...link,
        isActive: location.pathname === link.to
      })),
    [location.pathname]
  );

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <span className="brand-icon">🏥</span>
          <span className="brand-name">RespiCare</span>
          <span className="brand-subtitle">Sistema de Enfermedades Respiratorias</span>
        </div>
        <div className="navbar-menu">
          {links.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`nav-link ${link.isActive ? 'active' : ''}`}
              aria-current={link.isActive ? 'page' : undefined}
            >
              <span className="nav-icon" aria-hidden="true">{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          ))}
          <ThemeToggle className="navbar-theme-toggle" />
        </div>
      </div>
    </nav>
  );
}

export default memo(Navbar);

