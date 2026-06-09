import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import SystemOverview from "./pages/SystemOverview";
import AddWagon from "./pages/AddWagon";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Maintenance from "./pages/Maintenance";
import RecentActivities from "./pages/RecentActivities";
import Analytics from "./pages/Analytics";
import WagonRecords from "./pages/WagonRecords";
import Settings from "./pages/Settings";

const isLoggedIn = () => sessionStorage.getItem("isLoggedIn");

function App() {
  return (
    <Router>

      {/* Professional Toast System */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,

          style: {
            background: "#111827",
            color: "#fff",
            borderRadius: "12px",
            padding: "14px 18px",
            fontSize: "14px",
            fontWeight: "500",
          },

          success: {
            style: {
              background: "#16a34a",
            },
          },

          error: {
            style: {
              background: "#dc2626",
            },
          },
        }}
      />

      <Routes>

        <Route path="/login" element={<Login />} />
        <Route path="/add" element={<Layout><AddWagon /></Layout>} />

        <Route
          path="/"
          element={
            isLoggedIn() ? (
              <Layout><SystemOverview /></Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/add"
          element={
            isLoggedIn() ? (
              <Layout><AddWagon /></Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/maintenance"
          element={
            isLoggedIn() ? (
              <Layout><Maintenance /></Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/recent-activities"
          element={
            isLoggedIn() ? (
              <Layout><RecentActivities /></Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/analytics"
          element={
            isLoggedIn() ? (
              <Layout><Analytics /></Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/wagon-records"
          element={
            isLoggedIn() ? (
              <Layout><WagonRecords /></Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/settings"
          element={
            isLoggedIn() ? (
              <Layout><Settings /></Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

      </Routes>
    </Router>
  );
}

export default App;