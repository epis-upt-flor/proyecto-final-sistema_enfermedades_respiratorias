import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

const Navbar = lazy(() => import('./components/Navbar'));
const Home = lazy(() => import('./pages/Home'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Analytics = lazy(() => import('./pages/Analytics'));
const HeatMapPage = lazy(() => import('./pages/HeatMapPage'));

const AppFallback = () => (
  <div className="app-loading">
    <div className="app-loading__spinner" />
    <p>Cargando interfaz…</p>
  </div>
);

function App() {
  return (
    <Router>
      <Suspense fallback={<AppFallback />}>
        <div className="App">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/heatmap" element={<HeatMapPage />} />
          </Routes>
        </div>
      </Suspense>
    </Router>
  );
}

export default App;
