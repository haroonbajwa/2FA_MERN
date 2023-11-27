import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginWith2FA from "./LoginWith2FA";
import "./App.css";

const HomeComponent = () => {
  return <h1>Home</h1>;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" exact element={<HomeComponent />} />
        <Route path="/login" element={<LoginWith2FA />} />
      </Routes>
    </Router>
  );
}

export default App;
