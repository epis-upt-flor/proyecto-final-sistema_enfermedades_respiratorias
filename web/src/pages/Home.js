import React, { useState } from 'react';
import ChatBot from '../components/ChatBot';
import SymptomReportForm from '../components/SymptomReportForm';
import './Home.css';

function Home() {
  const [showReportForm, setShowReportForm] = useState(false);

  const handleReportSuccess = () => {
    // Refresh heatmap or show notification
    console.log('Report submitted successfully!');
  };

  return (
    <div className="home-page">
      <div className="home-container">
        <div className="welcome-banner">
          <h1>🏥 Bienvenido a RespiCare</h1>
          <p>Sistema inteligente para la gestión y análisis de enfermedades respiratorias en Tacna, Perú</p>
        </div>

        <div className="chatbot-container">
          <ChatBot />
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

