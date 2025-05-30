import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Layout from "./components/Layout";
import Import from "./pages/Import";
import Check from "./pages/Check";
import CreateReport from "./pages/create_report";
import HistoryReport from "./pages/history_report";
import Category from "./pages/Category"
import Products from "./pages/Products";
import Exports from "./pages/Exports";
import Supplier from "./pages/Suppliers";
import Warehouse from "./pages/Warehouse";
import Account from "./pages/Account";
import LogIn from "./pages/LogIn";
import Profile from "./pages/Profile";
import Devices from "./pages/Devices";
import DeviceAuthorization from "./pages/DeviceAuthorization";
import ActionLog from "./pages/ActionLog";
import Backup from "./pages/Backup";
import ProtectedRoute from "./components/ProtectedRoute";
import { ImportProvider } from "./contexts/ImportContext";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';



function App() {
  return (
    <Router>
      <ImportProvider>
        <Routes>

          {/* 👇 Route đăng nhập (không cần bảo vệ) */}
          <Route path="/login" element={<LogIn />} />

          {/* 👇 Các route cần đăng nhập */}
          <Route
            path="/"
            element={
              <ProtectedRoute allowedRoles={["admin", "staff"]}>
                {/* <Layout><Home /></Layout> */}
                <Layout><Home /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/products"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Layout><Products /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/import"
            element={
              <ProtectedRoute allowedRoles={["admin", "staff"]}>
                <Layout><Import /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/export"
            element={
              <ProtectedRoute allowedRoles={["admin", "staff"]}>
                <Layout><Exports /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/check"
            element={
              <ProtectedRoute allowedRoles={["admin", "staff"]}>
                <Layout><Check /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/create_report"
            element={
              <ProtectedRoute allowedRoles={["admin", "staff"]}>
                <Layout><CreateReport /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/history_report"
            element={
              <ProtectedRoute allowedRoles={["admin", "staff"]}>
                <Layout><HistoryReport /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute allowedRoles={["admin", "staff"]}>
                <Layout><Profile /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/suppliers"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Layout><Supplier /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/warehouse"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Layout><Warehouse /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/account"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Layout><Account /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/category"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Layout><Category /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/devices"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Layout><Devices /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/deviceAuth"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Layout><DeviceAuthorization /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/actionlog"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Layout><ActionLog /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/backup"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Layout><Backup /></Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
        <ToastContainer/>
      </ImportProvider>
    </Router>
  );
}

export default App;
