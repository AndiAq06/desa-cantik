// src/App.jsx
import AppRoutes from './routes';
import { AuthProvider } from './contexts/AuthContext';
import { FooterProvider } from './contexts/FooterContext';

import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <AuthProvider>
      <FooterProvider>
        <AppRoutes />
        <Toaster position="top-right" toastOptions={{ duration: 3000, style: { background: '#333', color: '#fff' } }} />
      </FooterProvider>
    </AuthProvider>
  );
}

export default App;
