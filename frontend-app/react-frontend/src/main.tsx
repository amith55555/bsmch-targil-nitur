import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { initializeFaro, getWebInstrumentations } from '@grafana/faro-web-sdk';

// Initialize Grafana Faro
initializeFaro({
  url: 'http://localhost:12347/collect', // Pointing to our local Alloy container
  app: {
    name: 'react-frontend',
    version: '1.0.0',
    environment: 'development'
  },
  instrumentations: [
    // This automatically captures console.log, unhandled errors, and web vitals
    ...getWebInstrumentations(),
  ],
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)