// frontend/src/main.tsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/globals.css';

// --- NEW: Import Redux Provider and store ---
import { Provider } from 'react-redux';
import { store } from './store';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* --- NEW: Wrap the App in the Redux Provider --- */}
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);