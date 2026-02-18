import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

import Navbar from "./components/Navbar";

// ✅ Protected
import ProtectedRoute from "./components/ProtectedRoute"; // user token route
import PrivateRoute from "./components/PrivateRoute"; // admin route

// User Pages
import Welcome from "./pages/Welcome";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Jobs from "./pages/Jobs";
import JobDetails from "./pages/JobDetails";
import Dashboard from "./pages/Dashboard";
import Resume from "./pages/Resume";
import Profile from "./pages/Profile";
import Shortlisted from "./pages/Shortlisted"; // ✅ USER SHORTLISTED PAGE

// ✅ Auth Extra Pages
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import OAuthSuccess from "./pages/OAuthSuccess";
import VerifyEmail from "./pages/VerifyEmail";

// Admin Pages
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageJobs from "./pages/admin/ManageJobs";
import Applicants from "./pages/admin/Applicants";
import ShortlistedCandidates from "./pages/admin/ShortlistedCandidates"; // ✅ ADMIN PAGE

import "./App.css";

/* Layout Component */
function Layout() {
  const location = useLocation();

  // Hide Navbar on Welcome & Admin pages
  const hideNavbar =
    location.pathname === "/" || location.pathname.startsWith("/admin");

  return (
    <>
      {!hideNavbar && <Navbar />}

      <Routes>
        {/* Landing */}
        <Route path="/" element={<Welcome />} />

        {/* Public User Pages */}
        <Route path="/home" element={<Home />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/jobs/:id" element={<JobDetails />} />

        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ✅ Email Verification */}
        <Route path="/verify-email" element={<VerifyEmail />} />

        {/* ✅ Forgot Password Flow */}
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* ✅ OAuth Redirect Success */}
        <Route path="/oauth-success" element={<OAuthSuccess />} />

        {/* ✅ USER PROTECTED */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/resume" element={<Resume />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/shortlisted" element={<Shortlisted />} /> {/* ✅ ADD */}
        </Route>

        {/* Admin Login (Public) */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* ✅ ADMIN PROTECTED */}
        <Route element={<PrivateRoute />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/manage-jobs" element={<ManageJobs />} />
          <Route path="/admin/applicants" element={<Applicants />} />
          <Route path="/admin/shortlisted" element={<ShortlistedCandidates />} />
        </Route>

        {/* 404 */}
        <Route
          path="*"
          element={
            <h2 style={{ textAlign: "center", marginTop: "40px", color: "white" }}>
              Page Not Found
            </h2>
          }
        />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <Layout />
    </Router>
  );
}

export default App;
