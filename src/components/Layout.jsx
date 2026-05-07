import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const Layout = () => {
  return (
    <div className="min-h-screen bg-white flex text-slate-900 font-sans">
      <Sidebar />
      <main className="flex-1 lg:ml-64 min-h-screen transition-all duration-300 overflow-x-hidden flex flex-col">
        {/* Navbar removed as requested */}
        <div className="p-6 md:p-8 lg:p-10 max-w-[1400px] w-full mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
