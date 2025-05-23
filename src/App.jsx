// src/App.jsx
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useAuthStore } from "./stores/authStore";
import Login from "./pages/Login";
import PasswordResetRequest from "./pages/PasswordResetRequest";
import PasswordReset from "./pages/PasswordReset";
import Admin from "./pages/Admin/Admin"; 
import DashboardLayout from "./components/layout/DashboardLayout";
import DoctorDashboard from "./pages/Doctor/DoctorDashboard";
import Patients from "./pages/Doctor/Patients";
import Images from "./pages/Doctor/Images";
import Diagnoses from "./pages/Doctor/Diagnoses";
import Notification from "./components/common/Notification";
import Articles from "./pages/Doctor/Articles";
import DiagnosisDetails from "./pages/Doctor/DiagnosisDetails";

function ProtectedRoute({ children, role }) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role && user?.role !== role) {
    return (
      <Navigate
        to={user?.role === "admin" ? "/admin/users" : "/doctor/dashboard"} 
        replace
      />
    );
  }

  return children;
}

function App() {
  return (
    <Router>
      <Notification />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route
          path="/password-reset/request"
          element={<PasswordResetRequest />}
        />
        <Route path="/password-reset/:token" element={<PasswordReset />} />

        {/* Admin Routes */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute role="admin">
              <DashboardLayout>
                <Routes> 
                  <Route path="users" element={<Admin />}/>
                </Routes>
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Doctor Routes */}
        <Route
          path="/doctor/*"
          element={
            <ProtectedRoute role="doctor">
              <DashboardLayout>
                <Routes>
                  <Route path="dashboard" element={<DoctorDashboard />} />
                  <Route path="patients" element={<Patients />} />
                  <Route path="images" element={<Images />} />
                  <Route path="diagnoses" element={<Diagnoses />} />
                  <Route path="diagnoses/:diagnosisId" element={<DiagnosisDetails />} />
                  <Route path="articles" element={<Articles />} />
                  <Route
                    path="*"
                    element={<Navigate to="dashboard" replace />}
                  />
                </Routes>
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Redirects */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;