import { Routes, Route } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";

import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Weather from "./pages/Weather";
import Sales from "./pages/Sales";
import Predictions from "./pages/Predictions";
import Promotions from "./pages/Promotions";
import Alerts from "./pages/Alerts";

function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/products" element={<Products />} />
        <Route path="/weather" element={<Weather />} />
        <Route path="/sales" element={<Sales />} />
        <Route path="/predictions" element={<Predictions />} />
        <Route path="/promotions" element={<Promotions />} />
        <Route path="/alerts" element={<Alerts />} />
      </Route>
    </Routes>
  );
}

export default App;