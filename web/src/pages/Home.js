import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ChatBot from '../components/ChatBot';
import SymptomReportForm from '../components/SymptomReportForm';
import './Home.css';

function Home() {
  const [showReportForm, setShowReportForm] = useState(false);
  const navigate = useNavigate();

  const handleReportSuccess = () => {
    // Refresh heatmap or show notification
    console.log('Report submitted successfully!');
  };

  const handleAnalyticsClick = () => {
    navigate('/analytics');
  };

  return (
    <div className="home-page">
      <div className="home-container">
        <div className="welcome-banner">
          <h1>🏥 Bienvenido a RespiCare</h1>
          <p>Sistema inteligente para la gestión y análisis de enfermedades respiratorias en Tacna, Perú</p>
        </div>

        <div className="home-grid">
          <div className="home-section chatbot-section">
            <ChatBot />
          </div>

          <div className="home-section dashboard-actions">
            <div className="action-card">
              <div className="action-icon">📊</div>
              <h3>Centro de Análisis</h3>
              <p>Visualiza gráficos, tendencias y estadísticas detalladas del sistema</p>
              <button className="action-button" onClick={() => navigate('/analytics')}>
                Ver Análisis
              </button>
            </div>
            
            <div className="action-card">
              <div className="action-icon">🗺️</div>
              <h3>Mapa en Tiempo Real</h3>
              <p>Monitorea zonas de riesgo y reportes de síntomas por distrito</p>
              <button className="action-button" onClick={() => navigate('/heatmap')}>
                Ver Mapa
              </button>
            </div>
          </div>
        </div>

        <div className="info-cards">
          <div className="info-card">
            <span className="info-icon">🤖</span>
            <h3>Asistente Virtual IA</h3>
            <p>Consulta sobre síntomas, prevención y tratamiento de enfermedades respiratorias</p>
          </div>
          <div className="info-card">
            <span className="info-icon">🗺️</span>
            <h3>Monitoreo en Tiempo Real</h3>
            <p>Visualiza zonas de riesgo y reportes de síntomas en diferentes distritos de Tacna</p>
          </div>
          <div className="info-card clickable" onClick={handleAnalyticsClick}>
            <span className="info-icon">📊</span>
            <h3>Análisis de Datos</h3>
            <p>Sistema de análisis predictivo para identificar brotes y tendencias</p>
            <div className="card-action">Ver Análisis →</div>
          </div>
        </div>
      </div>

      {/* Floating Action Button to Report Symptoms */}
      <button
        className="fab-report-button"
        onClick={() => setShowReportForm(true)}
        title="Reportar Síntomas"
      >
        <span className="fab-icon">📋</span>
        <span className="fab-text">Reportar Síntomas</span>
      </button>

      {/* Symptom Report Modal */}
      {showReportForm && (
        <SymptomReportForm
          onClose={() => setShowReportForm(false)}
          onSuccess={handleReportSuccess}
        />
      )}
    </div>
  );
}

export default Home;

