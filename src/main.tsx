import App from "@/app/App";
import { ErrorBoundary } from "@/components/feedback/ErrorBoundary";
import "@/styles/globals.css";
import "@/styles/select.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
);
