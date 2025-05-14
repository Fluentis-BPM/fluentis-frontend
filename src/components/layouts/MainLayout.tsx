import { Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectUser } from '@/store/auth/authSlice';

import Sidebar from './Sidebar';
import TopBar from './TopBar';
import Footer from './Footer';

export default function MainLayout() {
  const user = useSelector(selectUser);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Main Content Wrapper with Sidebar */}
      <div className="flex flex-1">
        {/* Full-height Sidebar */}
        <Sidebar user={user} />
        
        {/* Main Content Area with TopBar and Content */}
        <div className="flex-1 flex flex-col">
          <TopBar user={user} />
          
          {/* Main Content */}
          <main className="flex-1 p-6 bg-background">
            <Outlet />
          </main>
          
          {/* Footer */}
          <Footer />
        </div>
      </div>
    </div>
  );
}