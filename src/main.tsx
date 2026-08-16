import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { copy } from "./ui/copy.pl";

const container = document.getElementById("root");
if (container === null) throw new Error("missing #root container");

document.title = copy.showroomTitle;

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
