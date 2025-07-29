import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { storage } from './lib/storage'

// Make storage globally accessible for auto backup
if (typeof window !== 'undefined') {
  (window as any).storage = storage;
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

const root = createRoot(rootElement);
root.render(<App />);