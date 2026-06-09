import { useState } from 'react';

// Define a type for our backend response to leverage TypeScript
interface BackendResponse {
  message?: string;
  error?: string;
}

const BACKEND_URL = 'http://localhost:3040';

function App() {
  // React State to hold our result message and text color
  const [result, setResult] = useState<string>('Waiting for action...');
  const [statusColor, setStatusColor] = useState<string>('#333');

  const handleSuccess = async () => {
    setResult('Loading...');
    setStatusColor('#333');
    
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
    <div style={{ fontFamily: 'sans-serif', textAlign: 'center', marginTop: '50px' }}>
      <h2>React + TS Frontend</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={handleSuccess} 
          style={{ padding: '10px 20px', margin: '10px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
        >
          Success Button
        </button>
        
        <button 
          onClick={handleFailure} 
          style={{ padding: '10px 20px', margin: '10px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
        >
          Failure Button
        </button>
      </div>

      <div style={{ 
        marginTop: '20px', 
        padding: '20px', 
        border: '1px solid #ccc', 
        display: 'inline-block', 
        minWidth: '300px',
        fontWeight: 'bold',
        color: statusColor,
        whiteSpace: 'pre-wrap' // Ensures the \n in our text renders as a line break
      }}>
        {result}
      </div>
    </div>
  );
}

export default App;