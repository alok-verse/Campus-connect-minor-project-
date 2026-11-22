import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource-variable/inter";
import "./index.css";
import App from "./App.jsx";
import { ensureSeedData } from "./utils/seed";

// First run in this browser: load sample events so nothing looks empty.
ensureSeedData();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
