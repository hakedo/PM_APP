import { Link } from 'react-router-dom';
import { useState } from 'react';
import './Navigation.css';

function Navigation() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <nav className={`nav-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <button 
        className="collapse-button"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? '←' : '→'}
      </button>
      <ul className="nav-links">
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/projects">Projects</Link>
        </li>
      </ul>
    </nav>
  );
}

export default Navigation;