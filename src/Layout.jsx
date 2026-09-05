import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Settings, MonitorPlay, LogOut, Folder, Menu, X, Bell } from 'lucide-react';

const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('isAdmin');
    window.location.reload();
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Categories', path: '/categories', icon: Folder },
    { name: 'Push Notifications', path: '/notifications', icon: Bell },
    { name: 'App Settings', path: '/settings', icon: Settings },
    { name: 'AdMob Config', path: '/admob', icon: MonitorPlay },
  ];

  return (
    <div className="flex h-screen overflow-hidden text-gray-900 bg-[#F4F6F8]">
      
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between px-6 py-4 bg-white/70 backdrop-blur-xl border-b border-white/50 fixed top-0 w-full z-40">
        <h1 className="text-xl font-black tracking-tighter text-gray-900">
          .DNG <span className="text-sm font-bold text-gray-500 tracking-normal ml-1">by Khurshid</span>
        </h1>
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 -mr-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <Menu size={24} />
        </button>
      </header>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-200"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 flex flex-col transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0 md:p-6 md:pr-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="bg-white md:bg-white/70 md:backdrop-blur-xl md:rounded-3xl h-full shadow-[0_8px_30px_rgb(0,0,0,0.04)] md:border border-white/50 flex flex-col overflow-hidden">
          
          <div className="h-20 flex items-center justify-between px-8 border-b border-gray-100/50">
            <h1 className="text-xl font-black tracking-tighter text-gray-900">
              .DNG <span className="text-sm font-bold text-gray-500 tracking-normal ml-1">by Khurshid</span>
            </h1>
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="md:hidden p-2 -mr-2 text-gray-400 hover:text-gray-900"
            >
              <X size={20} />
            </button>
          </div>
          
          <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-300 ${
                    isActive
                      ? 'bg-gray-900 text-white shadow-lg shadow-gray-900/20 md:translate-x-1'
                      : 'text-gray-500 hover:bg-gray-100/50 hover:text-gray-900 md:hover:translate-x-1'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                    {item.name}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="p-4 border-t border-gray-100/50">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 w-full rounded-2xl text-sm font-medium text-red-600 hover:bg-red-50/80 transition-all duration-300 hover:scale-[1.02]"
            >
              <LogOut size={18} strokeWidth={2} />
              Sign Out
            </button>
          </div>
          
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pt-[72px] md:pt-0">
        <div className="p-4 sm:p-6 md:p-8 w-full min-h-full">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
