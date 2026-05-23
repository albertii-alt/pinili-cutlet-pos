import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// Clean up legacy localStorage keys from old ConnectPage flow
localStorage.removeItem('server_ip');
localStorage.removeItem('server_port');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
