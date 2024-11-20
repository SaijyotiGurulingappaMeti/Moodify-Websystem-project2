import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginCard from "./LoginCard";
import Dashboard from "./Dashboard";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginCard />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
