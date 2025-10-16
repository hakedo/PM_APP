import { useState } from 'react';
import Sidebar from './components/Sidebar.jsx';

export default function App() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />

      {/* Page content */}
      <main className="flex-1 p-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-gray-600">We’ll add stats here next.</p>
      </main>
    </div>
  );
}
