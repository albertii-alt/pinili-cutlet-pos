import { useEffect } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { routes } from './routes';
import { useAuthStore } from '../store/useAuthStore';
import { connectSocket, disconnectSocket } from '../socket/socket';
import { useAccentColor } from '../hooks/useAccentColor';
import { useWindowTitle } from '../hooks/useWindowTitle';
import '../index.css';

const router = createBrowserRouter(routes);

export default function App() {
  const { isAuthenticated } = useAuthStore();

  // Apply accent color CSS variable globally
  useAccentColor();

  // Sync window title with stall name from settings
  useWindowTitle();

  // Connect socket if already authenticated (e.g. after page refresh)
  useEffect(() => {
    if (isAuthenticated) {
      connectSocket();
    }
    return () => { disconnectSocket(); };
  }, [isAuthenticated]);

  return <RouterProvider router={router} />;
}
