import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AnalyticsDashboard.css';

function AnalyticsDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    fetchDashboardData();
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchDashboardData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('http://localhost:3001/api/analytics/mock-dashboard');
      
      if (response.data.success) {
        setDashboardData(response.data.data);
        setLastUpdated(new Date());
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return '#ef5350';
      case 'medium': return '#ffca28';
      case 'low': return '#66bb6a';
      default: return '#bdbdbd';
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      'respiratory': '#667eea',
      'fever': '#ff6b6b',
      'pain': '#4ecdc4',
      'digestive': '#45b7d1',
      'fatigue': '#96ceb4',
      'neurological': '#feca57',
      'other': '#a4b0be'
    };
    return colors[category] || '#a4b0be';
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

  const severityData = dashboardData.distributions?.severity?.map(item => ({
    name: item._id,
    value: item.count,
    color: getSeverityColor(item._id)
  })) || [];

  const categoryData = dashboardData.distributions?.category?.map(item => ({
    name: item._id,
    value: item.count,
    color: getCategoryColor(item._id)
  })) || [];

  const topDistrictsData = dashboardData.topDistricts?.map(district => ({
    name: district._id,
    count: district.count,
    avgSeverity: Math.round(district.avgSeverity * 100) / 100
  })) || [];

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
          {lastUpdated && (
            <span className="last-updated">
              Última actualización: {formatDate(lastUpdated)}
            </span>
          )}
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

      {/* Charts Grid */}
      <div className="charts-grid">
        {/* Severity Distribution */}
        <div className="chart-card">
          <div className="chart-header">
            <h4>📊 Distribución por Severidad</h4>
            <p>Reportes clasificados por nivel de riesgo</p>
          </div>
          <div className="chart-content">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={severityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [value, 'Reportes']} />
                <Bar dataKey="value" fill="#667eea" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="chart-card">
          <div className="chart-header">
            <h4>🏷️ Distribución por Categoría</h4>
            <p>Clasificación de síntomas por tipo</p>
          </div>
          <div className="chart-content">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [value, 'Reportes']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Districts */}
        <div className="chart-card">
          <div className="chart-header">
            <h4>🏘️ Top Distritos</h4>
            <p>Distritos con mayor número de reportes</p>
          </div>
          <div className="chart-content">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={topDistrictsData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip 
                  formatter={(value, name) => [
                    value, 
                    name === 'count' ? 'Reportes' : 'Severidad Promedio'
                  ]}
                />
                <Bar dataKey="count" fill="#4ecdc4" name="Reportes" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="chart-card">
          <div className="chart-header">
            <h4>🕒 Actividad Reciente</h4>
            <p>Últimos reportes registrados en el sistema</p>
          </div>
          <div className="chart-content">
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
                      {formatDate(activity.reportedAt)}
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
      </div>

      {/* Summary Statistics */}
      <div className="summary-section">
        <h3>📈 Estadísticas Generales</h3>
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-label">Promedio Diario</span>
            <span className="stat-value">
              {Math.round((dashboardData.overview?.totalReports || 0) / 30)}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Tasa de Urgencia</span>
            <span className="stat-value">
              {Math.round(((dashboardData.overview?.urgentReports || 0) / (dashboardData.overview?.totalReports || 1)) * 100)}%
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Distritos Activos</span>
            <span className="stat-value">
              {dashboardData.topDistricts?.length || 0}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Consultas Recientes</span>
            <span className="stat-value">
              {dashboardData.overview?.recentConversations || 0}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnalyticsDashboard;
