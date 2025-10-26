import { createRoot } from "react-dom/client";
import { ComplaintsProvider } from "@/lib/complaints";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <ComplaintsProvider>
    <App />
  </ComplaintsProvider>
);
