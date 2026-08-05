import React from 'react';
import AiChat from './Components/AiChat';
import { ToastProvider } from './contexts/ToastContext';

function App() {
  return (
    <ToastProvider>
      <AiChat />
    </ToastProvider>
  );
}

export default App;
