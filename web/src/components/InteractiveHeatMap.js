import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import VirtualizedList from './VirtualizedList';
import './InteractiveHeatMap.css';
import { LEGACY_API_BASE } from '../utils/apiBase';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png'
});

const DISTRICT_COORDINATES = {
  'Centro de Tacna': [-18.0066, -70.2463],
  'Alto de la Alianza': [-18.0167, -70.25],
  'Gregorio Albarracín': [-18.0, -70.24],
  'Ciudad Nueva': [-18.01, -70.23],
  'Pocollay': [-18.02, -70.26],
  'Calana': [-17.95, -70.2],
  'Pachia': [-17.9, -70.15],
  'Boca del Río': [-18.1, -70.3]
};

const HISTORICAL_DATA = {
  'Centro de Tacna': { p75: 25, p95: 45, avg4weeks: 15, lastYear: 20 },
  'Alto de la Alianza': { p75: 20, p95: 35, avg4weeks: 12, lastYear: 18 },
  'Gregorio Albarracín': { p75: 18, p95: 30, avg4weeks: 10, lastYear: 15 },
  'Ciudad Nueva': { p75: 15, p95: 25, avg4weeks: 8, lastYear: 12 },
  'Pocollay': { p75: 12, p95: 20, avg4weeks: 6, lastYear: 10 },
  'Calana': { p75: 10, p95: 18, avg4weeks: 5, lastYear: 8 },
  'Pachia': { p75: 8, p95: 15, avg4weeks: 4, lastYear: 6 },
  'Boca del Río': { p75: 6, p95: 12, avg4weeks: 3, lastYear: 5 }
};

const ALERT_COLORS = {
  emergency: '#ef4444',
  alert: '#f59e0b',
  normal: '#10b981'
};

const getEpidemiologicalColor = (alertLevel) =>
  ALERT_COLORS[alertLevel] || '#6b7280';

const getCircleRadius = (count) => {
  if (count >= 50) return 1000;
  if (count >= 30) return 800;
  if (count >= 20) return 600;
  if (count >= 10) return 400;
  return 200;
};

const MapCenter = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [map, center, zoom]);
  return null;
};

const HeatCircles = memo(function HeatCircles({ data, selectedSeverity }) {
  const filteredData = useMemo(
    () =>
      selectedSeverity === 'all'
        ? data
        : data.filter((item) => item.epidemiologicalAlert === selectedSeverity),
    [data, selectedSeverity]
  );

  return (
    <>
      {filteredData.map((location) => (
        <Circle
          key={location.district}
          center={[location.lat, location.lng]}
          radius={getCircleRadius(location.count)}
          pathOptions={{
            color: getEpidemiologicalColor(location.epidemiologicalAlert),
            fillColor: getEpidemiologicalColor(location.epidemiologicalAlert),
            fillOpacity: 0.4,
            weight: 3
          }}
        >
          <Popup>
            <div className="popup-content">
              <h4>{location.district}</h4>
              <p>
                <strong>Casos Actuales:</strong> {location.count}
              </p>
              <p>
                <strong>Nivel de Alerta:</strong>
                <span className={`alert-level ${location.epidemiologicalAlert}`}>
                  {location.epidemiologicalAlert === 'emergency'
                    ? '🔴 Emergencia'
                    : location.epidemiologicalAlert === 'alert'
                      ? '🟡 Alerta'
                      : '🟢 Normal'}
                </span>
              </p>
              {location.historicalData && (
                <div className="historical-info">
                  <p>
                    <strong>Datos Históricos:</strong>
                  </p>
                  <p>• Percentil 75: {location.historicalData.p75} casos</p>
                  <p>• Percentil 95: {location.historicalData.p95} casos</p>
                  <p>• Promedio 4 semanas: {location.historicalData.avg4weeks} casos</p>
                  <p>• Mismo período año anterior: {location.historicalData.lastYear} casos</p>
                </div>
              )}
              <p>
                <strong>Síntomas:</strong> {location.symptoms.join(', ')}
              </p>
              <p>
                <strong>Último reporte:</strong>{' '}
                {new Date(location.lastReport).toLocaleDateString()}
              </p>
            </div>
          </Popup>
        </Circle>
      ))}
    </>
  );
});

function InteractiveHeatMap() {
  const [heatmapData, setHeatmapData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const mapCenter = useMemo(() => [-18.0066, -70.2463], []);
  const mapZoom = 11;

  const calculateEpidemiologicalAlert = useCallback((district, currentCases) => {
    const historical = HISTORICAL_DATA[district];
    if (!historical) return 'normal';

    const { p75, p95, avg4weeks, lastYear } = historical;

    if (currentCases >= p95) return 'emergency';
    if (currentCases >= p75) return 'alert';

    const increaseFromAvg = avg4weeks
      ? ((currentCases - avg4weeks) / avg4weeks) * 100
      : 0;
    if (increaseFromAvg >= 100) return 'emergency';
    if (increaseFromAvg >= 50) return 'alert';

    const increaseFromLastYear = lastYear
      ? ((currentCases - lastYear) / lastYear) * 100
      : 0;
    if (increaseFromLastYear >= 100) return 'emergency';
    if (increaseFromLastYear >= 50) return 'alert';

    return 'normal';
  }, []);

  const fetchHeatmapData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `${LEGACY_API_BASE}/symptom-reports/heatmap`
      );

      if (response.data.success) {
        const transformedData = response.data.data.map((item) => {
          const epidemiologicalAlert = calculateEpidemiologicalAlert(
            item.district,
            item.count
          );
          return {
            district: item.district,
            count: item.count,
            severity: item.riskLevel,
            epidemiologicalAlert,
            lat: DISTRICT_COORDINATES[item.district]?.[0] || -18.0066,
            lng: DISTRICT_COORDINATES[item.district]?.[1] || -70.2463,
            symptoms: item.symptoms || ['Síntomas respiratorios'],
            lastReport: item.lastReport || new Date().toISOString(),
            historicalData: HISTORICAL_DATA[item.district] || null
          };
        });

        setHeatmapData(transformedData);
      } else {
        setError(
          response.data.message || 'Error al cargar datos del mapa'
        );
      }
    } catch (err) {
      console.error('Error fetching heatmap data:', err);
      setError(
        'No se pudieron cargar los datos del mapa. Asegúrate de que el backend esté funcionando.'
      );
    } finally {
      setLoading(false);
    }
  }, [calculateEpidemiologicalAlert]);

  useEffect(() => {
    fetchHeatmapData();
  }, [fetchHeatmapData]);

  const stats = useMemo(() => ({
    total: heatmapData.length,
    normal: heatmapData.filter((item) => item.epidemiologicalAlert === 'normal').length,
    alert: heatmapData.filter((item) => item.epidemiologicalAlert === 'alert').length,
    emergency: heatmapData.filter((item) => item.epidemiologicalAlert === 'emergency').length,
    totalCases: heatmapData.reduce((sum, item) => sum + item.count, 0)
  }), [heatmapData]);

  const sortedHeatmapData = useMemo(
    () => [...heatmapData].sort((a, b) => b.count - a.count),
    [heatmapData]
  );

  const renderZoneItem = useCallback(
    (zone) => (
      <div className={`zone-item ${zone.epidemiologicalAlert}`}>
        <div
          className="zone-indicator"
          style={{ backgroundColor: getEpidemiologicalColor(zone.epidemiologicalAlert) }}
        />
        <div className="zone-info">
          <div className="zone-name">{zone.district}</div>
          <div className="zone-details">
            <span className="zone-count">{zone.count} casos</span>
            <span className={`zone-risk ${zone.epidemiologicalAlert}`}>
              {zone.epidemiologicalAlert === 'emergency'
                ? '🔴 Emergencia'
                : zone.epidemiologicalAlert === 'alert'
                  ? '🟡 Alerta'
                  : '🟢 Normal'}
            </span>
          </div>
          {zone.historicalData && (
            <div className="historical-context">
              <small>
                P75: {zone.historicalData.p75} | P95: {zone.historicalData.p95}
              </small>
            </div>
          )}
        </div>
      </div>
    ),
    []
  );

  if (loading) {
    return (
      <div className="interactive-heatmap-container">
        <div className="loading-overlay">
          <div className="loading-spinner" />
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
          <div className="stat-card emergency">
            <div className="stat-number">{stats.emergency}</div>
            <div className="stat-label">🔴 Emergencia</div>
          </div>
          <div className="stat-card alert">
            <div className="stat-number">{stats.alert}</div>
            <div className="stat-label">🟡 Alerta</div>
          </div>
          <div className="stat-card normal">
            <div className="stat-number">{stats.normal}</div>
            <div className="stat-label">🟢 Normal</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.totalCases}</div>
            <div className="stat-label">Casos Totales</div>
          </div>
          <button className="refresh-button" onClick={fetchHeatmapData}>
            🔄 Actualizar
          </button>
        </div>
      </div>

      <div className="heatmap-controls">
        <div className="severity-filters">
          <label>Filtrar por nivel de alerta epidemiológica:</label>
          <div className="filter-buttons">
            <button
              className={`filter-btn ${selectedSeverity === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedSeverity('all')}
            >
              Todos ({stats.total})
            </button>
            <button
              className={`filter-btn emergency ${selectedSeverity === 'emergency' ? 'active' : ''}`}
              onClick={() => setSelectedSeverity('emergency')}
            >
              🔴 Emergencia ({stats.emergency})
            </button>
            <button
              className={`filter-btn alert ${selectedSeverity === 'alert' ? 'active' : ''}`}
              onClick={() => setSelectedSeverity('alert')}
            >
              🟡 Alerta ({stats.alert})
            </button>
            <button
              className={`filter-btn normal ${selectedSeverity === 'normal' ? 'active' : ''}`}
              onClick={() => setSelectedSeverity('normal')}
            >
              🟢 Normal ({stats.normal})
            </button>
          </div>
        </div>

        <div className="map-legend">
          <label>Leyenda Epidemiológica:</label>
          <div className="legend-items">
            <div className="legend-item">
              <div className="legend-circle emergency" />
              <span>🔴 Emergencia (≥P95 o +100%)</span>
            </div>
            <div className="legend-item">
              <div className="legend-circle alert" />
              <span>🟡 Alerta (P75-P95 o +50-100%)</span>
            </div>
            <div className="legend-item">
              <div className="legend-circle normal" />
              <span>🟢 Normal (&lt;P75 y +&lt;50%)</span>
            </div>
          </div>
        </div>
      </div>

      <div className="main-content">
        <div className="map-section">
          <div className="map-container">
            <MapContainer
              center={mapCenter}
              zoom={mapZoom}
              style={{ height: '100%', width: '100%' }}
              zoomControl
              scrollWheelZoom
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <MapCenter center={mapCenter} zoom={mapZoom} />
              <HeatCircles data={heatmapData} selectedSeverity={selectedSeverity} />
            </MapContainer>
          </div>
        </div>

        <div className="leaderboard-section">
          <div className="leaderboard-container">
            <div className="leaderboard-header">
              <h3>📍 Zonas Reportadas</h3>
              <div className="leaderboard-stats">
                <span className="total-zones">Total: {stats.total} zonas</span>
                <span className="total-cases">Casos: {stats.totalCases}</span>
              </div>
            </div>
            <div className="zones-list">
              <VirtualizedList
                items={sortedHeatmapData}
                itemHeight={112}
                renderItem={renderZoneItem}
                maxVisibleItems={7}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InteractiveHeatMap;
