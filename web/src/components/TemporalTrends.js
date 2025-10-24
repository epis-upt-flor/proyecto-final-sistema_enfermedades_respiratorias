import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './TemporalTrends.css';

function TemporalTrends() {
  const [trendsData, setTrendsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [selectedDistrict, setSelectedDistrict] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const districts = [
    'all', 'Centro de Tacna', 'Gregorio Albarracín', 'Ciudad Nueva', 'Pocollay',
    'Alto de la Alianza', 'Calana', 'Pachia', 'Boca del Río'
  ];

  const categories = [
    'all', 'respiratory', 'fever', 'pain', 'digestive', 'fatigue', 'neurological', 'other'
  ];

  const periods = [
    { value: '7d', label: 'Últimos 7 días' },
    { value: '30d', label: 'Últimos 30 días' },
    { value: '90d', label: 'Últimos 90 días' },
    { value: '1y', label: 'Último año' }
  ];

  useEffect(() => {
    fetchTrendsData();
  }, [selectedPeriod, selectedDistrict, selectedCategory]);

  const fetchTrendsData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('http://localhost:3001/api/analytics/mock-trends', {
        params: {
          period: selectedPeriod,
          district: selectedDistrict !== 'all' ? selectedDistrict : undefined,
          category: selectedCategory !== 'all' ? selectedCategory : undefined
        }
      });

      if (response.data.success) {
        setTrendsData(response.data.data);
      } else {
        setError(response.data.message || 'Error al cargar datos de tendencias');
      }
    } catch (err) {
      console.error('Error fetching trends data:', err);
      setError('No se pudieron cargar los datos de tendencias. Verifica que el backend esté funcionando.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
  };

  const formatWeeklyDate = (weekData) => {
    return `Sem ${weekData.week}`;
  };


  const prepareDailyData = () => {
    if (!trendsData?.dailyTrends) return [];
    
    const dataMap = {};
    trendsData.dailyTrends.forEach(day => {
      if (!dataMap[day._id]) {
        dataMap[day._id] = { date: day._id, total: day.total };
      }
      day.data.forEach(severityData => {
        dataMap[day._id][severityData.severity] = severityData.count;
      });
    });
    
    return Object.values(dataMap).sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  const prepareWeeklyData = () => {
    if (!trendsData?.weeklyTrends) return [];
    
    return trendsData.weeklyTrends.map(week => ({
      week: formatWeeklyDate(week._id),
      count: week.count,
      avgSeverity: Math.round(week.avgSeverity * 100) / 100
    }));
  };

  const prepareTopSymptomsData = () => {
    if (!trendsData?.topSymptoms) return [];
    
    return trendsData.topSymptoms.slice(0, 5).map(symptom => ({
      name: symptom._id,
      count: symptom.totalCount
    }));
  };

  if (loading) {
    return (
      <div className="temporal-trends-container">
        <div className="loading-overlay">
          <div className="spinner"></div>
          <p>Cargando datos de tendencias...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="temporal-trends-container">
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          <p>{error}</p>
          <button onClick={fetchTrendsData} className="retry-button">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const dailyData = prepareDailyData();
  const weeklyData = prepareWeeklyData();
  const topSymptomsData = prepareTopSymptomsData();

  return (
    <div className="temporal-trends-container">
      <div className="trends-header">
        <h3>📈 Tendencias Temporales</h3>
        <p>Evolución de síntomas respiratorios en el tiempo</p>
      </div>

      <div className="trends-controls">
        <div className="control-group">
          <label>Período:</label>
          <select 
            value={selectedPeriod} 
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="control-select"
          >
            {periods.map(period => (
              <option key={period.value} value={period.value}>
                {period.label}
              </option>
            ))}
          </select>
        </div>

        <div className="control-group">
          <label>Distrito:</label>
          <select 
            value={selectedDistrict} 
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="control-select"
          >
            <option value="all">Todos los distritos</option>
            {districts.slice(1).map(district => (
              <option key={district} value={district}>
                {district}
              </option>
            ))}
          </select>
        </div>

        <div className="control-group">
          <label>Categoría:</label>
          <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="control-select"
          >
            <option value="all">Todas las categorías</option>
            {categories.slice(1).map(category => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <button onClick={fetchTrendsData} className="refresh-button">
          🔄 Actualizar
        </button>
      </div>

      <div className="trends-charts">
        {/* Daily Trends Chart */}
        <div className="chart-container">
          <h4>📅 Tendencias Diarias</h4>
          <div className="simple-chart">
            {dailyData.slice(0, 7).map((day, index) => (
              <div key={index} className="trend-item">
                <div className="trend-date">{formatDate(day.date)}</div>
                <div className="trend-bar">
                  <div 
                    className="trend-fill" 
                    style={{ 
                      width: `${(day.total / Math.max(...dailyData.map(d => d.total))) * 100}%`,
                      backgroundColor: '#667eea'
                    }}
                  ></div>
                </div>
                <div className="trend-count">{day.total} reportes</div>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Trends Chart */}
        <div className="chart-container">
          <h4>📊 Tendencias Semanales</h4>
          <div className="simple-chart">
            {weeklyData.map((week, index) => (
              <div key={index} className="week-item">
                <div className="week-name">{week.week}</div>
                <div className="week-count">{week.count} reportes</div>
                <div className="week-severity">Severidad: {week.avgSeverity}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Symptoms Chart */}
        <div className="chart-container">
          <h4>🔝 Síntomas Más Reportados</h4>
          <div className="simple-chart">
            {topSymptomsData.map((symptom, index) => (
              <div key={index} className="symptom-item">
                <div className="symptom-name">{symptom.name}</div>
                <div className="symptom-count">{symptom.count} reportes</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {trendsData && (
        <div className="trends-summary">
          <h4>📋 Resumen del Período</h4>
          <div className="summary-stats">
            <div className="stat-item">
              <span className="stat-value">{dailyData.length}</span>
              <span className="stat-label">Días analizados</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">
                {dailyData.reduce((sum, day) => sum + (day.total || 0), 0)}
              </span>
              <span className="stat-label">Total reportes</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">
                {Math.round(dailyData.reduce((sum, day) => sum + (day.total || 0), 0) / dailyData.length) || 0}
              </span>
              <span className="stat-label">Promedio diario</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TemporalTrends;
