import './index.css';

import { context, requestExpandedMode } from '@devvit/web/client';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

export const Splash = () => {
  return (
    <div className="flex relative flex-col justify-center items-center min-h-screen gap-4 bg-gray-950 text-white">
      <div className="flex flex-col items-center gap-2">
        <h1 className="text-4xl font-bold tracking-tight">Orbit Switch</h1>
        <p className="text-base text-center text-gray-400">
          Hey {context.username ?? 'there'} — ready to solve some puzzles?
        </p>
      </div>
      <div className="flex items-center justify-center mt-5">
        <button
          className="flex items-center justify-center bg-[#d93900] text-white h-10 rounded-full cursor-pointer transition-colors px-6 hover:bg-[#c23300]"
          onClick={(e) => requestExpandedMode(e.nativeEvent, 'game')}
        >
          Play
        </button>
      </div>
    </div>
  );
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Splash />
  </StrictMode>
);
