import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Toaster } from 'react-hot-toast';

const Layout = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <main className="flex-1 lg:ml-64 pt-16 lg:pt-0 min-h-screen transition-all duration-300 overflow-x-hidden">
        <div className="p-4 md:p-8 lg:p-10 max-w-[1600px] mx-auto">
          <Outlet />
        </div>
      </main>
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            borderRadius: '12px',
            background: '#fff',
            color: '#1e293b',
            border: '1px solid #e2e8f0',
          },
        }}
      />
    </div>
  );
};

export default Layout;
