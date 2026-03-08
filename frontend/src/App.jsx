import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";

import Navbar from "./components/Navbar";

import ProtectedRoute from "./components/ProtectedRoute";
import PrivateRoute from "./components/PrivateRoute";

import Welcome from "./pages/Welcome";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Jobs from "./pages/Jobs";
import JobDetails from "./pages/JobDetails";
import Dashboard from "./pages/Dashboard";
import Resume from "./pages/Resume";
import Profile from "./pages/Profile";
import Shortlisted from "./pages/Shortlisted";

import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import OAuthSuccess from "./pages/OAuthSuccess";
import VerifyEmail from "./pages/VerifyEmail";

import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageJobs from "./pages/admin/ManageJobs";
import Applicants from "./pages/admin/Applicants";
import ShortlistedCandidates from "./pages/admin/ShortlistedCandidates";

import AdminForgotPassword from "./pages/admin/AdminForgotPassword";
import AdminResetPassword from "./pages/admin/AdminResetPassword";

import "./App.css";

function Layout() {
  const location = useLocation();
  const hideNavbar = location.pathname === "/" || location.pathname.startsWith("/admin");

  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      {!hideNavbar && <Navbar />}

      <Routes>
        <Route path="/" element={<Welcome />} />

        <Route path="/home" element={<Home />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/jobs/:id" element={<JobDetails />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/verify-email" element={<VerifyEmail />} />

        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        <Route path="/oauth-success" element={<OAuthSuccess />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/resume" element={<Resume />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/shortlisted" element={<Shortlisted />} />
        </Route>

        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/forgot-password" element={<AdminForgotPassword />} />
        <Route path="/admin/reset-password" element={<AdminResetPassword />} />

        <Route element={<PrivateRoute />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/manage-jobs" element={<ManageJobs />} />
          <Route path="/admin/applicants" element={<Applicants />} />
          <Route path="/admin/shortlisted" element={<ShortlistedCandidates />} />
        </Route>

        <Route
          path="*"
          element={
            <div className="min-h-[60vh] flex items-center justify-center px-4">
              <h2 className="text-center text-white text-xl sm:text-2xl font-semibold">
                Page Not Found
              </h2>
            </div>
          }
        />
      </Routes>
    </div>
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