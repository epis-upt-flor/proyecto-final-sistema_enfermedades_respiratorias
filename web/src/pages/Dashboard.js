import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Dashboard.css';

function Dashboard() {
  const [backendStatus, setBackendStatus] = useState(null);
  const [aiStatus, setAiStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkServices();
  }, []);

  const checkServices = async () => {
    setLoading(true);
    setError(null);

    try {
      // Check Backend
      const backendResponse = await axios.get('http://localhost:3001/api/health');
      setBackendStatus(backendResponse.data);

      // Check AI Services
      const aiResponse = await axios.get('http://localhost:8000/api/v1/health');
      setAiStatus(aiResponse.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        <header className="dashboard-header">
          <h1>📊 Estado del Sistema</h1>
          <p className="dashboard-subtitle">Monitoreo de servicios de RespiCare</p>
        </header>

        <div className="dashboard-content">
          <div className="services-section">
            <h3>Estado de Servicios</h3>
            
            {loading && (
              <div className="loading">
                <div className="spinner"></div>
                <p>Verificando servicios...</p>
              </div>
            )}

            {error && (
              <div className="error-message">
                <p>⚠️ Error al conectar con los servicios: {error}</p>
                <button onClick={checkServices} className="retry-button">
                  Reintentar
                </button>
              </div>
            )}

            {!loading && !error && (
              <div className="services-grid">
                <div className="service-card">
                  <div className={`status-indicator ${backendStatus?.status === 'healthy' ? 'healthy' : 'unhealthy'}`}></div>
                  <h4>🔧 Backend API</h4>
                  <p className="service-status">
                    {backendStatus?.status === 'healthy' ? '✅ Operativo' : '❌ No disponible'}
                  </p>
                  {backendStatus && (
                    <div className="service-details">
                      <p><strong>Versión:</strong> {backendStatus.version}</p>
                      <p><strong>Uptime:</strong> {Math.floor(backendStatus.uptime)}s</p>
                    </div>
                  )}
                  <a href="http://localhost:3001/api" target="_blank" rel="noopener noreferrer" className="service-link">
                    Ver API →
                  </a>
                </div>

                <div className="service-card">
                  <div className={`status-indicator ${aiStatus?.status === 'healthy' ? 'healthy' : 'unhealthy'}`}></div>
                  <h4>🤖 AI Services</h4>
                  <p className="service-status">
                    {aiStatus?.status === 'healthy' ? '✅ Operativo' : '❌ No disponible'}
                  </p>
                  {aiStatus && (
                    <div className="service-details">
                      <p><strong>Versión:</strong> {aiStatus.version}</p>
                      <p><strong>Servicio:</strong> {aiStatus.service}</p>
                    </div>
                  )}
                  <a href="http://localhost:8000/docs" target="_blank" rel="noopener noreferrer" className="service-link">
                    Ver Docs →
                  </a>
                </div>
              </div>
            )}

            <button onClick={checkServices} className="refresh-button">
              🔄 Actualizar Estado
            </button>
          </div>

          <div className="info-section">
            <h3>Endpoints Disponibles</h3>
            <div className="endpoints-list">
              <div className="endpoint">
                <span className="method method-get">GET</span>
                <a href="http://localhost:3001/api/health" target="_blank" rel="noopener noreferrer">
                  /api/health
                </a>
              </div>
              <div className="endpoint">
                <span className="method method-get">GET</span>
                <a href="http://localhost:3001/api" target="_blank" rel="noopener noreferrer">
                  /api
                </a>
              </div>
              <div className="endpoint">
                <span className="method method-post">POST</span>
                <span>/api/auth/login</span>
              </div>
              <div className="endpoint">
                <span className="method method-post">POST</span>
                <span>/api/auth/register</span>
              </div>
              <div className="endpoint">
                <span className="method method-get">GET</span>
                <a href="http://localhost:8000/api/v1/health" target="_blank" rel="noopener noreferrer">
                  /api/v1/health (AI)
                </a>
              </div>
            </div>
          </div>

          <div className="admin-tools">
            <h3>Herramientas de Administración</h3>
            <div className="tools-grid">
              <a href="http://localhost:8081" target="_blank" rel="noopener noreferrer" className="tool-card">
                <span className="tool-icon">🗄️</span>
                <h4>MongoDB Express</h4>
                <p>Administración de Base de Datos</p>
                <span className="tool-credentials">admin / admin123</span>
              </a>
              <a href="http://localhost:8082" target="_blank" rel="noopener noreferrer" className="tool-card">
                <span className="tool-icon">💾</span>
                <h4>Redis Commander</h4>
                <p>Gestión de Caché</p>
              </a>
            </div>
          </div>
        </div>

        <footer className="dashboard-footer">
          <p>RespiCare © 2024 - Sistema de Enfermedades Respiratorias</p>
          <p className="tech-stack">
            React • Node.js • Python • MongoDB • Redis • Docker
          </p>
        </footer>
      </div>
    </div>
  );
}

export default Dashboard;

