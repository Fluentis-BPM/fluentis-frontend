import { Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectUser } from '@/store';
import { NavigationProvider } from '@/context/NavigationContext';
import { NotificationsPanelProvider } from '@/context/NotificationsPanelContext';
import NotificationPanel from '@/components/notifications/NotificationPanel';

import Sidebar from './Sidebar';
import Footer from './Footer';

export default function MainLayout() {
  const user = useSelector(selectUser);

  return (
    <NavigationProvider>
      <NotificationsPanelProvider>
        <div className="min-h-screen flex bg-background">
          {/* Full-height Sidebar */}
          <Sidebar user={user} />
          
          {/* Main Content Area */}
          <div className="flex-1 flex flex-col relative">
            {/* Main Content */}
            <main className="flex-1 p-6 bg-background">
              <Outlet />
            </main>
            
            {/* Footer */}
            <Footer />

            {/* Notifications Drawer */}
            <NotificationPanel />
          </div>
        </div>
      </NotificationsPanelProvider>
    </NavigationProvider>
  );
}