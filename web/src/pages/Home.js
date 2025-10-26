import React from 'react';
import ChatBot from '../components/ChatBot';
import './Home.css';

function Home() {
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
    </div>
  );
}

export default Home;

