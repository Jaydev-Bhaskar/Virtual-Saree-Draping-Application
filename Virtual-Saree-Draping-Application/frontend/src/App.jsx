import React from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import TryOn from './pages/TryOn';
import Inventory from './pages/Inventory';
import Dashboard from './pages/Dashboard';
import AdminInventory from './pages/AdminInventory';
import AdminLogin from './pages/AdminLogin';
import ProtectedRoute from './components/ProtectedRoute';

const Layout = () => {
  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="admin/login" element={<AdminLogin />} />
        <Route path="inventory" element={<Inventory />} />
        
        {/* Protected User Routes */}
        <Route path="try-on" element={<TryOn />} />
        <Route path="dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />

        {/* Admin Only Routes */}
        <Route path="admin" element={
          <ProtectedRoute adminOnly={true}>
            <AdminInventory />
          </ProtectedRoute>
        } />
      </Route>
    </Routes>
  );
}

export default App;
