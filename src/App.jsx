import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import PublicSite from './pages/PublicSite';
import AdminLayout from './layouts/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import Attendance from './pages/admin/Attendance';
import ExcelUpload from './pages/admin/ExcelUpload';
import QRCodes from './pages/admin/QRCodes';
import Scanner from './pages/admin/Scanner';
import LearningMaterialsAdmin from './pages/admin/LearningMaterialsAdmin';

import AdminUsers from './pages/admin/AdminUsers';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicSite />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="upload" element={<ExcelUpload />} />
          <Route path="qrcodes" element={<QRCodes />} />
          <Route path="scanner" element={<Scanner />} />
          <Route path="materials" element={<LearningMaterialsAdmin />} />
          <Route path="users" element={<AdminUsers />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
