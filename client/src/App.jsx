import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import Login from "./pages/Login";
import Home from "./pages/Home";
import AIHealthyFood from "./pages/AIHealthyFood";

function ScrollToTop() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location.pathname]);

  return null;
}

function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/ai" element={<AIHealthyFood />} />
      </Routes>
    </>
  );
}

export default App;
