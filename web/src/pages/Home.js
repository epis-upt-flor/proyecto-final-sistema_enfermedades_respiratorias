import React, { useMemo } from 'react';
import ChatBot from '../components/ChatBot';
import './Home.css';

const HERO_IMAGE_WEBP =
  'data:image/webp;base64,UklGRiIAAABXRUJQVlA4IBgAAAAQAAAADwAADwAAQUxQSDcAAAABFJAnQEqHAAQAAgAAgA0JYQAA/v/uAAA=';
const HERO_IMAGE_PNG =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAOCAYAAAAfSC3RAAAAOUlEQVR42mNgGAXUBwExwMjIAIYGCgYGBob/zzAxwMDAkA0YGBg6A0TLEC0YGhgIEjKIEeMcAxyAgAWlwQgmQ5hAEAAAAASUVORK5CYII=';

function Home() {
  const heroSources = useMemo(
    () => ({
      webp: HERO_IMAGE_WEBP,
      fallback: HERO_IMAGE_PNG
    }),
    []
  );

  return (
    <div className="home-page">
      <div className="home-container">
        <div className="welcome-banner">
          <div className="welcome-info">
            <h1>🏥 Bienvenido a RespiCare</h1>
            <p>Sistema inteligente para la gestión y análisis de enfermedades respiratorias en Tacna, Perú</p>
          </div>
          <div className="hero-media">
            <picture>
              <source srcSet={heroSources.webp} type="image/webp" />
              <img
                src={heroSources.fallback}
                loading="lazy"
                width="240"
                height="240"
                alt="Ilustración sobre monitoreo respiratorio"
              />
            </picture>
          </div>
        </div>

        <div className="chatbot-container">
          <ChatBot />
        </div>
      </div>
    </div>
  );
}

export default Home;

