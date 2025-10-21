import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Projects from './pages/Projects/Projects';
import ProjectDetails from './pages/ProjectDetails/ProjectDetails';
import Home from './pages/Home/Home';
import Settings from './pages/Settings/Settings';
import Templates from './pages/Templates/Templates';
import TemplateDetails from './pages/TemplateDetails/TemplateDetails';
import Clients from './pages/Clients/Clients';
import ClientDetails from './pages/ClientDetails/ClientDetails';
import Team from './pages/Team/Team';
import Navigation from './layouts/Navigation/Navigation';
import './App.css';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="ml-[240px] transition-all duration-300">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/:id" element={<ProjectDetails />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/clients/:id" element={<ClientDetails />} />
            <Route path="/team" element={<Team />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/templates" element={<Templates />} />
            <Route path="/templates/:id" element={<TemplateDetails />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
