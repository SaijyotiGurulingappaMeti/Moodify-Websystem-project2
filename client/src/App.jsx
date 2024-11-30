import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginCard from "./LoginCard";
import Dashboard from "./Dashboard";
import GenrePage from "./GenrePage";
import ResultsPage from "./ResultsPage";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginCard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/genre" element={<GenrePage />} />
        <Route path="/results" element={<ResultsPage />} />
      </Routes>
    </Router>
  );
}

export default App;
