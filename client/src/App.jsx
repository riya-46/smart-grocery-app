import { Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Home from "./pages/Home";
import AIHealthyFood from "./pages/AIHealthyFood";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/home" element={<Home />} />
      <Route path="/ai" element={<AIHealthyFood />} />
    </Routes>
  );
}

export default App;