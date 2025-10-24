import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AnalyticsDashboard.css';

function AnalyticsDashboardSimple() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching dashboard data...');
      const response = await axios.get('http://localhost:3001/api/analytics/mock-dashboard');
      console.log('Dashboard response:', response.data);
      
      if (response.data.success) {
        setDashboardData(response.data.data);
      } else {
        setError(response.data.message || 'Error al cargar datos del dashboard');
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('No se pudieron cargar los datos del dashboard. Verifica que el backend esté funcionando.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="analytics-dashboard">
        <div className="loading-overlay">
          <div className="spinner"></div>
          <p>Cargando dashboard de análisis...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-dashboard">
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          <p>{error}</p>
          <button onClick={fetchDashboardData} className="retry-button">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="analytics-dashboard">
        <div className="no-data">
          <span className="no-data-icon">📊</span>
          <p>No hay datos disponibles para mostrar</p>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <h2>📊 Dashboard de Análisis Avanzado</h2>
          <p>Sistema de monitoreo en tiempo real para enfermedades respiratorias</p>
        </div>
        <div className="header-actions">
          <button onClick={fetchDashboardData} className="refresh-button" disabled={loading}>
            {loading ? '⏳' : '🔄'} Actualizar
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="overview-cards">
        <div className="overview-card primary">
          <div className="card-icon">📋</div>
          <div className="card-content">
            <h3>{dashboardData.overview?.totalReports || 0}</h3>
            <p>Total Reportes</p>
          </div>
        </div>
        
        <div className="overview-card success">
          <div className="card-icon">📈</div>
          <div className="card-content">
            <h3>{dashboardData.overview?.recentReports || 0}</h3>
            <p>Últimos 7 días</p>
          </div>
        </div>
        
        <div className="overview-card warning">
          <div className="card-icon">⚠️</div>
          <div className="card-content">
            <h3>{dashboardData.overview?.urgentReports || 0}</h3>
            <p>Casos Urgentes</p>
          </div>
        </div>
        
        <div className="overview-card info">
          <div className="card-icon">💬</div>
          <div className="card-content">
            <h3>{dashboardData.overview?.totalConversations || 0}</h3>
            <p>Consultas Chat</p>
          </div>
        </div>
      </div>

      {/* Simple Charts */}
      <div className="charts-grid">
        <div className="chart-card">
          <div className="chart-header">
            <h4>📊 Distribución por Severidad</h4>
            <p>Reportes clasificados por nivel de riesgo</p>
          </div>
          <div className="chart-content">
            <div className="simple-chart">
              {dashboardData.distributions?.severity?.map((item, index) => (
                <div key={index} className="severity-item">
                  <div className="severity-bar">
                    <div 
                      className="severity-fill" 
                      style={{ 
                        width: `${(item.count / Math.max(...dashboardData.distributions.severity.map(s => s.count))) * 100}%`,
                        backgroundColor: item._id === 'high' ? '#ef5350' : item._id === 'medium' ? '#ffca28' : '#66bb6a'
                      }}
                    ></div>
                  </div>
                  <div className="severity-label">
                    <span className="severity-name">{item._id}</span>
                    <span className="severity-count">{item.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <h4>🏷️ Distribución por Categoría</h4>
            <p>Clasificación de síntomas por tipo</p>
          </div>
          <div className="chart-content">
            <div className="simple-chart">
              {dashboardData.distributions?.category?.map((item, index) => (
                <div key={index} className="category-item">
                  <div className="category-name">{item._id}</div>
                  <div className="category-count">{item.count}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="summary-section">
        <h3>🕒 Actividad Reciente</h3>
        <div className="activity-list">
          {dashboardData.recentActivity?.slice(0, 5).map((activity, index) => (
            <div key={index} className="activity-item">
              <div className="activity-icon">
                {activity.severityLevel === 'high' ? '🔴' : 
                 activity.severityLevel === 'medium' ? '🟡' : '🟢'}
              </div>
              <div className="activity-content">
                <div className="activity-district">{activity.location?.district}</div>
                <div className="activity-symptoms">
                  {activity.symptoms?.slice(0, 2).map(s => s.name).join(', ')}
                  {activity.symptoms?.length > 2 && '...'}
                </div>
                <div className="activity-time">
                  {new Date(activity.reportedAt).toLocaleDateString('es-ES')}
                </div>
              </div>
              <div className="activity-category">
                {activity.category}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AnalyticsDashboardSimple;
