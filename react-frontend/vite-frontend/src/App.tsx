import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import App1 from "./App1";
import Dashboard from "./Dashboard";

function Main() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<App1 />} />
        <Route path="/dashboard" element={<Dashboard username="Harry" />} />
      </Routes>
    </Router>
  );
}

export default Main;
