import { Routes, Route } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";

import AdminDashboard from "./pages/admin/Dashboard";
import AdminProducts from "./pages/admin/Products";
import AddProduct from "./pages/admin/AddProduct";
import AdminSales from "./pages/admin/Sales";
import AdminPredictions from "./pages/admin/Predictions";
import AdminPromotions from "./pages/admin/Promotions";
import AdminAlerts from "./pages/admin/Alerts";
import AdminWeather from "./pages/admin/Weather";

import FranchiseLayout from "./layouts/FranchiseLayout";
import FranchiseDashboard from "./pages/franchise/Dashboard";
import FranchiseWeather from "./pages/franchise/Weather";
import ProductMenu from "./pages/franchise/ProductMenu";
import NewTicket from "./pages/franchise/NewTicket";
import TicketsHistory from "./pages/franchise/TicketsHistory";
import FranchiseSettings from "./pages/franchise/Settings";
import Franchises from "./pages/admin/Franchises";

function App() {
  return (
    <Routes>
      {/* Public route */}
      <Route path="/login" element={<Login />} />

      {/* --- ADMIN --- */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute role="ADMIN">
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="products/new" element={<AddProduct />} />
        <Route path="sales" element={<AdminSales />} />
        <Route path="predictions" element={<AdminPredictions />} />
        <Route path="promotions" element={<AdminPromotions />} />
        <Route path="alerts" element={<AdminAlerts />} />
        <Route path="franchises" element={<Franchises />} />
        <Route path="weather" element={<AdminWeather />} />
      </Route>

      {/* --- FRANCHISE --- */}
      <Route
        path="/franchise"
        element={
          <ProtectedRoute role="FRANCHISE">
            <FranchiseLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<FranchiseDashboard />} />
        <Route path="weather" element={<FranchiseWeather />} />
        <Route path="menu" element={<ProductMenu />} />
        <Route path="tickets/new" element={<NewTicket />} />
        <Route path="tickets" element={<TicketsHistory />} />
        <Route path="settings" element={<FranchiseSettings />} />
      </Route>
    </Routes>
  );
}

export default App;