import './index.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

export const App = () => {
  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-950 text-white">
      <h1 className="text-4xl font-bold tracking-tight">Orbit Switch</h1>
      <p className="mt-2 text-gray-400">Puzzle coming soon</p>
    </div>
  );
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
