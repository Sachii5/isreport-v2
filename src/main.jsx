/**
 * main.jsx
 * ========
 * Entry point React — render App ke dalam #root di index.html
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';   // Tailwind directives
import App from './App';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
