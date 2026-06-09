import { useState } from 'react';
import { faro, LogLevel } from '@grafana/faro-web-sdk';

interface BackendResponse {
  message?: string;
  error?: string;
}

const BACKEND_URL = 'http://localhost:3040';

function App() {
  const [result, setResult] = useState<string>('Waiting for action...');
  const [statusColor, setStatusColor] = useState<string>('#333');

  const handleSuccess = async () => {
    setResult('Loading...');
    setStatusColor('#333');
    
    // Send an informational log to Loki via Faro
    faro.api.pushLog(['Success button clicked by user'], { level: LogLevel.INFO });

    try {
      const response = await fetch(`${BACKEND_URL}/api/success`);
      const data: BackendResponse = await response.json();
      
      setResult(`✅ Status: ${response.status} OK\nResponse: ${data.message}`);
      setStatusColor('green');
    } catch (error) {
      setResult('Network Error: Is the backend running?');
      setStatusColor('orange');
    }
  };

  const handleFailure = async () => {
    setResult('Loading...');
    setStatusColor('#333');

    // Send a warning log to Loki via Faro
    faro.api.pushLog(['Failure button clicked - expecting 404'], { level: LogLevel.WARN });

    try {
      const response = await fetch(`${BACKEND_URL}/api/does-not-exist`);
      const data: BackendResponse = await response.json();
      
      setResult(`❌ Status: ${response.status} Not Found\nResponse: ${data.error}`);
      setStatusColor('red');
    } catch (error) {
      setResult('Network Error: Is the backend running?');
      setStatusColor('orange');
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '500px', margin: '0 auto' }}>
      <h1>Frontend Observability Test</h1>
      <p>Interact with the buttons below to fire actions and ship logs to Faro/Loki.</p>
      
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button 
          onClick={handleSuccess} 
          style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Trigger Success
        </button>
        
        <button 
          onClick={handleFailure} 
          style={{ padding: '10px 20px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Trigger Failure
        </button>
      </div>

      <div style={{ marginTop: '20px' }}>
        <h3>Execution Result:</h3>
        <pre 
          style={{ 
            padding: '15px', 
            backgroundColor: '#f8f9fa', 
            borderLeft: `5px solid ${statusColor}`, 
            whiteSpace: 'pre-wrap',
            borderRadius: '4px'
          }}
        >
          {result}
        </pre>
      </div>
    </div>
  );
}

export default App;