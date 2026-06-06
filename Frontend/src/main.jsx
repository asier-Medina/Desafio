import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";
import { AuthProvider } from "@features/auth/context/AuthContext";
import router from "@routes/router";
import "./index.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error('No se encontró el elemento root')
}

createRoot(rootElement).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>,
)
