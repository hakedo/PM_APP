import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Projects from './pages/Projects/Projects';
import Home from './pages/Home/Home';
import Navigation from './layouts/Navigation/Navigation';
import './App.css';

export default function App() {
  return (
    <Router>
      <div className="app-container">
        <main className="content-area">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/projects" element={<Projects />} />
          </Routes>
        </main>
        <Navigation />
      </div>
    </Router>
  );
}
