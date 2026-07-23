import { Link, Outlet, useLocation } from 'react-router-dom';
import { Home, Menu, MessageSquareText } from 'lucide-react';
import { useState } from 'react';

const Layout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();




  const navItems = [
    { name: 'Home', path: '/', icon: <Home size={20} /> },
    { name: 'AI chat', path: '/aichat', icon: <MessageSquareText size={20}/> },
  ];

  return (
    <div className="flex h-screen bg-black p-0">
      <div className={`flex flex-col justify-between text-blue-300 bg-grey border-r transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'} shadow`}>
        <div>
          <div className="flex items-center justify-between px-4 py-4 border-b">
            <h1 className={`text-xl font-bold  transition-all ${collapsed ? 'hidden' : 'block'}`}>
              Tools
            </h1>
            <button onClick={() => setCollapsed(!collapsed)} className="text-blue-300">
              <Menu size={20} />
            </button>
          </div>
          <nav className="mt-4">
            {navItems.map(({ name, path, icon }) => {
              return (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center gap-3 px-4 py-3 hover:bg-blue-100 transition ${
                    location.pathname === path ? 'bg-blue-200 text-blue-800' : 'text-blue-300'
                  }`}
                >
                  {icon}
                  {!collapsed && <span>{name}</span>}
                </Link>
              );
            })}
          </nav>
        </div>
        
          
          
          <div className="px-4 py-3 text-xs text-gray-400 border-t border-gray-600">
            {!collapsed && <p>© {new Date().getFullYear()} All rights reserved</p>}
          </div>
      </div>

      <main className="flex-grow overflow-auto p-0">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;