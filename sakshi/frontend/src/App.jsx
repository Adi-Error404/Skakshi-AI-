import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Network from './pages/Network';
import MergeQueue from './pages/MergeQueue';
import GoldenHour from './pages/GoldenHour';
import Alerts from './pages/Alerts';
import AskCopilot from './pages/AskCopilot';
import Report from './pages/Report';
import Ledger from './pages/Ledger';
import Validation from './pages/Validation';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="network" element={<Network />} />
            <Route path="merge-queue" element={<MergeQueue />} />
            <Route path="golden-hour" element={<GoldenHour />} />
            <Route path="alerts" element={<Alerts />} />
            <Route path="copilot" element={<AskCopilot />} />
            <Route path="report" element={<Report />} />
            <Route path="ledger" element={<Ledger />} />
            <Route path="validation" element={<Validation />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
