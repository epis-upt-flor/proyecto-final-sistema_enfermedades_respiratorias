import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import './InteractiveHeatMap.css';

// Fix para iconos de Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Componente para centrar el mapa automáticamente
function MapCenter({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [map, center, zoom]);
  return null;
}

// Componente para actualizar círculos de calor
function HeatCircles({ data, selectedSeverity }) {
  const getCircleColor = (severity) => {
    switch (severity) {
      case 'high': return '#ef5350';
      case 'medium': return '#ffca28';
      case 'low': return '#66bb6a';
      default: return '#bdbdbd';
    }
  };

  const getCircleRadius = (count) => {
    if (count >= 35) return 800;
    if (count >= 20) return 600;
    if (count >= 10) return 400;
    return 200;
  };

  const filteredData = selectedSeverity === 'all' 
    ? data 
    : data.filter(item => item.severity === selectedSeverity);

  return (
    <>
      {filteredData.map((location, index) => (
        <Circle
          key={index}
          center={[location.lat, location.lng]}
          radius={getCircleRadius(location.count)}
          pathOptions={{
            color: getCircleColor(location.severity),
            fillColor: getCircleColor(location.severity),
            fillOpacity: 0.3,
            weight: 2
          }}
        >
          <Popup>
            <div className="popup-content">
              <h4>{location.district}</h4>
              <p><strong>Casos:</strong> {location.count}</p>
              <p><strong>Severidad:</strong> {location.severity}</p>
              <p><strong>Síntomas:</strong> {location.symptoms.join(', ')}</p>
              <p><strong>Último reporte:</strong> {new Date(location.lastReport).toLocaleDateString()}</p>
            </div>
          </Popup>
        </Circle>
      ))}
    </>
  );
}

function InteractiveHeatMap() {
  const [heatmapData, setHeatmapData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [mapCenter] = useState([-18.0066, -70.2463]); // Tacna, Perú
  const [mapZoom] = useState(11);

  // Coordenadas de los distritos de Tacna
  const districtCoordinates = {
    'Centro de Tacna': [-18.0066, -70.2463],
    'Alto de la Alianza': [-18.0167, -70.2500],
    'Gregorio Albarracín': [-18.0000, -70.2400],
    'Ciudad Nueva': [-18.0100, -70.2300],
    'Pocollay': [-18.0200, -70.2600],
    'Calana': [-17.9500, -70.2000],
    'Pachia': [-17.9000, -70.1500],
    'Boca del Río': [-18.1000, -70.3000]
  };

  useEffect(() => {
    fetchHeatmapData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchHeatmapData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('http://localhost:3001/api/symptom-reports/heatmap');
      
      if (response.data.success) {
        // Transformar datos para el mapa
        const transformedData = response.data.data.map(item => ({
          district: item.district,
          count: item.count,
          severity: item.riskLevel,
          lat: districtCoordinates[item.district]?.[0] || -18.0066,
          lng: districtCoordinates[item.district]?.[1] || -70.2463,
          symptoms: item.symptoms || ['Síntomas respiratorios'],
          lastReport: item.lastReport || new Date().toISOString()
        }));
        
        setHeatmapData(transformedData);
      } else {
        setError(response.data.message || 'Error al cargar datos del mapa');
      }
    } catch (err) {
      console.error('Error fetching heatmap data:', err);
      setError('No se pudieron cargar los datos del mapa. Asegúrate de que el backend esté funcionando.');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityStats = () => {
    const stats = {
      total: heatmapData.length,
      high: heatmapData.filter(item => item.severity === 'high').length,
      medium: heatmapData.filter(item => item.severity === 'medium').length,
      low: heatmapData.filter(item => item.severity === 'low').length
    };
    return stats;
  };

  const stats = getSeverityStats();

  if (loading) {
    return (
      <div className="interactive-heatmap-container">
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>Cargando mapa en tiempo real...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="interactive-heatmap-container">
        <div className="error-overlay">
          <div className="error-icon">⚠️</div>
          <p>{error}</p>
          <button onClick={fetchHeatmapData} className="retry-button">
            🔄 Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="interactive-heatmap-container">
      <div className="heatmap-header">
        <div className="header-content">
          <h1>🗺️ Mapa en Tiempo Real - Tacna, Perú</h1>
          <p>Monitoreo de zonas de riesgo y reportes de síntomas respiratorios</p>
        </div>
        <div className="header-stats">
          <div className="stat-card">
            <div className="stat-number">{stats.total}</div>
            <div className="stat-label">Zonas Activas</div>
          </div>
          <div className="stat-card high-risk">
            <div className="stat-number">{stats.high}</div>
            <div className="stat-label">Alto Riesgo</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{heatmapData.reduce((sum, item) => sum + item.count, 0)}</div>
            <div className="stat-label">Casos Totales</div>
          </div>
          <button className="refresh-button" onClick={fetchHeatmapData}>
            🔄 Actualizar
          </button>
        </div>
      </div>

      <div className="heatmap-controls">
        <div className="severity-filters">
          <label>Filtrar por severidad:</label>
          <div className="filter-buttons">
            <button 
              className={`filter-btn ${selectedSeverity === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedSeverity('all')}
            >
              Todos ({stats.total})
            </button>
            <button 
              className={`filter-btn high ${selectedSeverity === 'high' ? 'active' : ''}`}
              onClick={() => setSelectedSeverity('high')}
            >
              Alto ({stats.high})
            </button>
            <button 
              className={`filter-btn medium ${selectedSeverity === 'medium' ? 'active' : ''}`}
              onClick={() => setSelectedSeverity('medium')}
            >
              Medio ({stats.medium})
            </button>
            <button 
              className={`filter-btn low ${selectedSeverity === 'low' ? 'active' : ''}`}
              onClick={() => setSelectedSeverity('low')}
            >
              Bajo ({stats.low})
            </button>
          </div>
        </div>

        <div className="map-legend">
          <label>Leyenda:</label>
          <div className="legend-items">
            <div className="legend-item">
              <div className="legend-circle high"></div>
              <span>Alto (&gt;35 casos)</span>
            </div>
            <div className="legend-item">
              <div className="legend-circle medium"></div>
              <span>Medio (20-35 casos)</span>
            </div>
            <div className="legend-item">
              <div className="legend-circle low"></div>
              <span>Bajo (&lt;20 casos)</span>
            </div>
          </div>
        </div>
      </div>

      <div className="map-container">
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          style={{ height: '100%', width: '100%' }}
          zoomControl={true}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <MapCenter center={mapCenter} zoom={mapZoom} />
          <HeatCircles data={heatmapData} selectedSeverity={selectedSeverity} />
        </MapContainer>
      </div>

      <div className="heatmap-sidebar">
        <h3>📍 Zonas Reportadas</h3>
        <div className="zones-list">
          {heatmapData
            .sort((a, b) => b.count - a.count)
            .map((zone, index) => (
              <div key={index} className={`zone-item ${zone.severity}`}>
                <div className="zone-indicator"></div>
                <div className="zone-info">
                  <div className="zone-name">{zone.district}</div>
                  <div className="zone-details">
                    <span className="zone-count">{zone.count} casos</span>
                    <span className={`zone-risk ${zone.severity}`}>
                      Riesgo: {zone.severity}
                    </span>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

export default InteractiveHeatMap;
