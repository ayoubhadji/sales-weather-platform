import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { TicketProvider } from "./context/TicketContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <TicketProvider>
          <App />
        </TicketProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);