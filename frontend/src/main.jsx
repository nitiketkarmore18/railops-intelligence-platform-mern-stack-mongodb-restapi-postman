import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "react-hot-toast";

import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />

    <Toaster
      position="top-right"
      reverseOrder={false}
      toastOptions={{
        duration: 3000,
        style: {
          background: "#1f2937",
          color: "#ffffff",
          borderRadius: "12px",
          padding: "14px 18px",
          fontSize: "14px",
          fontWeight: "500",
        },

        success: {
          style: {
            background: "#16a34a",
          },
          iconTheme: {
            primary: "#ffffff",
            secondary: "#16a34a",
          },
        },

        error: {
          style: {
            background: "#dc2626",
          },
          iconTheme: {
            primary: "#ffffff",
            secondary: "#dc2626",
          },
        },
      }}
    />
  </StrictMode>
);