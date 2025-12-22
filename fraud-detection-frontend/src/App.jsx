// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import UserLayout from './layouts/UserLayout';
import HomePage from './pages/user/HomePage';
import HistoryPage from './pages/user/HistoryPage';
import UserLogin from './pages/user/UserLogin';

import AdminLayout from './layouts/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import TransactionReview from './pages/admin/TransactionReview';
import AuditTool from './pages/admin/AuditTool';
import AlertsPage from './pages/admin/AlertsPage';
import BlacklistPage from './pages/admin/BlacklistPage';
import UserManagement from './pages/admin/UserManagement';


import AdminLogin from './pages/admin/AdminLogin';
import ProtectedRoute from './components/ProtectedRoute';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* User Routes */}
        <Route path="/user/login" element={<UserLogin />} />
        <Route path="/user" element={<UserLayout />}>
          <Route path="transfer" element={<HomePage />} />
          <Route path="history" element={<HistoryPage />} />

          <Route index element={<Navigate to="transfer" />} />
        </Route>

        {/* --- ADMIN LOGIN (Ai cũng vào được) --- */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* --- ADMIN PROTECTED (Phải đăng nhập mới vào được) --- */}
        <Route path="/admin" element={
            <ProtectedRoute>
                <AdminLayout />
            </ProtectedRoute>
        }>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="alerts" element={<AlertsPage />} />
          <Route path="review" element={<TransactionReview />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="blacklist" element={<BlacklistPage />} />
          <Route path="audit" element={<AuditTool />} />
          <Route index element={<Navigate to="dashboard" />} />
        </Route>

        <Route path="/" element={<Navigate to="/user" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;