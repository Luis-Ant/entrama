import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";

import { App } from "./app/App";
import "./styles.css";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Entrama root element was not found.");
}

const updateServiceWorker = registerSW({ immediate: true });

createRoot(root).render(
  <StrictMode>
    <App updateServiceWorker={updateServiceWorker} />
  </StrictMode>,
);
