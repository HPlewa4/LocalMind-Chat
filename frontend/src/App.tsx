import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './Components/Layout';
import AiChat from './Components/AiChat';
import { GlobalStateProvider } from './contexts/GlobalStateContext';
import { ToastProvider } from './contexts/ToastContext';
const Home = () => (
  <div className="text-center text-xl font-semibold text-blue-300">
    Welcome to the Home Page
  </div>
);

function App() {
  return (
    <GlobalStateProvider>
        <ToastProvider>
            <Router>
              <Routes>
                <Route path="/" element={<Layout />}>
                  <Route index element={<Home />} />
                  <Route path="aichat" element={<AiChat />} />
                </Route>
              </Routes>
            </Router>
        </ToastProvider>
    </GlobalStateProvider>
  );
}

export default App;
