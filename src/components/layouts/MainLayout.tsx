import { Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectUser } from '@/store';
import { NavigationProvider } from '@/context/NavigationContext';

import Sidebar from './Sidebar';
import Footer from './Footer';

export default function MainLayout() {
  const user = useSelector(selectUser);

  return (
    <NavigationProvider>
      <div className="min-h-screen flex bg-background">
        {/* Full-height Sidebar */}
        <Sidebar user={user} />
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Main Content */}
          <main className="flex-1 p-6 bg-background">
            <Outlet />
          </main>
          
          {/* Footer */}
          <Footer />
        </div>
      </div>
    </NavigationProvider>
  );
}