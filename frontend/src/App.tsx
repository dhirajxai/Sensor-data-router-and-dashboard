import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from '@components/layout/Layout';
import FleetDashboard from '@components/dashboard/FleetDashboard';
import VehicleDetail from '@components/vehicles/VehicleDetail';

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<FleetDashboard />} />
          <Route path="/vehicle/:id" element={<VehicleDetail />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
