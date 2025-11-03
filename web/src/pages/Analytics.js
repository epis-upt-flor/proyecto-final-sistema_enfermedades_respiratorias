import React, { useState } from 'react';
import AnalyticsDashboardSimple from '../components/AnalyticsDashboardSimple';
import TemporalTrends from '../components/TemporalTrends';
import DiseaseReports from '../components/DiseaseReports';
import './Analytics.css';

function Analytics() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const tabs = [
    { id: 'dashboard', label: '📊 Dashboard', component: AnalyticsDashboardSimple },
    { id: 'trends', label: '📈 Tendencias', component: TemporalTrends },
    { id: 'diseases', label: '🦠 Enfermedades', component: DiseaseReports }
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;

  return (
    <div className="analytics-page">
      <div className="analytics-header">
        <h1>📊 Centro de Análisis</h1>
        <p>Herramientas avanzadas para el análisis de datos médicos y tendencias</p>
      </div>

      <div className="analytics-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="analytics-content">
        {ActiveComponent && <ActiveComponent />}
      </div>
    </div>
  );
}

export default Analytics;
