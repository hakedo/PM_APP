export default function Sidebar({ collapsed, onToggle }) {
  return (
    <aside
      className={`bg-white border-r transition-all duration-200 ease-out
                  ${collapsed ? 'w-16' : 'w-64'} flex flex-col`}
      aria-label="Main navigation"
    >
      {/* Header / Brand + Collapse button */}
      <div className="h-14 px-3 border-b flex items-center justify-between">
        <div className={`text-indigo-600 font-semibold overflow-hidden transition-all ${collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
          PM App
        </div>
        <button
          onClick={onToggle}
          className="ml-auto inline-flex items-center justify-center w-8 h-8 rounded hover:bg-gray-100"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          {/* simple chevron made with text to avoid extra libs */}
          <span className={`transition-transform ${collapsed ? 'rotate-180' : ''}`}>❮</span>
        </button>
      </div>

      {/* Nav links */}
      <nav className="p-2 space-y-1 text-sm">
        <NavItem collapsed={collapsed} href="#/" icon="🏠" label="Dashboard" />
        <NavItem collapsed={collapsed} href="#/projects" icon="📁" label="Projects" />
        <NavItem collapsed={collapsed} href="#/reports" icon="📊" label="Reports" />
        <NavItem collapsed={collapsed} href="#/settings" icon="⚙️" label="Settings" />
      </nav>

      {/* Footer / version (optional) */}
      <div className="mt-auto p-3 text-xs text-gray-500">
        {!collapsed && <span>v0.1</span>}
      </div>
    </aside>
  );
}

function NavItem({ href, icon, label, collapsed }) {
  return (
    <a
      href={href}
      className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-gray-100 text-gray-700"
    >
      <span className="text-base">{icon}</span>
      <span
        className={`truncate transition-all ${collapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto'}`}
      >
        {label}
      </span>
    </a>
  );
}
