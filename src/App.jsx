// src/App.jsx

import { useState } from 'react';
import './App.css';
import ResultDisplay from './ResultDisplay';

function App() {
  const [cvFile, setCvFile] = useState(null);
  const [projectFile, setProjectFile] = useState(null);
  
  const [status, setStatus] = useState('idle');
  const [uploadResponse, setUploadResponse] = useState(null);
  const [jobId, setJobId] = useState(null);
  const [evaluationResult, setEvaluationResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const BACKEND_URL = 'https://glowing-garbanzo-qw79jwr96x72977w-8000.app.github.dev/';

  const handleUpload = async () => {
    if (!cvFile || !projectFile) {
      alert('Please select both CV and Project Report files.');
      return;
    }
    setStatus('uploading');
    setErrorMessage('');
    const formData = new FormData();
    formData.append('cv_file', cvFile);
    formData.append('project_report_file', projectFile);
    try {
      const response = await fetch(`${BACKEND_URL}/upload`, { method: 'POST', body: formData });
      if (!response.ok) throw new Error(`File upload failed with status: ${response.status}`);
      const data = await response.json();
      setUploadResponse(data);
      setStatus('uploaded');
    } catch (error) {
      setErrorMessage(error.message);
      setStatus('error');
    }
  };

  const handleEvaluate = async () => {
    setStatus('evaluating');
    setErrorMessage('');
    const cvDoc = uploadResponse.files.find(f => f.document_type === 'cv');
    const projectDoc = uploadResponse.files.find(f => f.document_type === 'project_report');
    try {
      const response = await fetch(`${BACKEND_URL}/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job_title: 'Backend AI Developer',
          cv_document_id: cvDoc.document_id,
          project_report_id: projectDoc.document_id,
        }),
      });
      if (!response.ok) throw new Error(`Evaluation trigger failed with status: ${response.status}`);
      const data = await response.json();
      setJobId(data.id);
      pollForResult(data.id);
    } catch (error) {
      setErrorMessage(error.message);
      setStatus('error');
    }
  };

  const pollForResult = (currentJobId) => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/result/${currentJobId}`);
        const data = await response.json();
        if (data.status === 'completed') {
          setEvaluationResult(data.result);
          setStatus('completed');
          clearInterval(interval);
        } else if (data.status === 'failed') {
          setErrorMessage(data.error || 'An unknown evaluation error occurred.');
          setStatus('error');
          clearInterval(interval);
        }
      } catch (error) {
        setErrorMessage('Polling failed. Cannot connect to backend.');
        setStatus('error');
        clearInterval(interval);
      }
    }, 2000); // Check every 5 seconds
  };

  return (
    <div className="App">
      <h1>AI Job Application Screener</h1>

      <div className="card">
        <h2>Step 1: Upload Documents</h2>
        <div className="input-group">
          <label htmlFor="cv-upload">Candidate CV (PDF):</label>
          <input id="cv-upload" type="file" accept=".pdf" onChange={(e) => setCvFile(e.target.files[0])} />
        </div>
        <div className="input-group">
          <label htmlFor="project-upload">Project Report (PDF):</label>
          <input id="project-upload" type="file" accept=".pdf" onChange={(e) => setProjectFile(e.target.files[0])} />
        </div>
        <button onClick={handleUpload} disabled={status === 'uploading' || status === 'evaluating'}>
          {status === 'uploading' ? 'Uploading...' : 'Upload Files'}
        </button>
      </div>

      <div className="card">
        <h2>Step 2: Start Evaluation</h2>
        <button onClick={handleEvaluate} disabled={status !== 'uploaded' && !evaluationResult}>
          {status === 'evaluating' ? 'Evaluating...' : 'Start Evaluation'}
        </button>
      </div>

      <div className="card">
        <h2>Status & Result</h2>
        <p>
          <strong>Current Status: </strong>
          <span className={`status-display ${status}`}>
            {status}
          </span>
        </p>
        {errorMessage && <p style={{ color: 'var(--error-color)' }}><strong>Error:</strong> {errorMessage}</p>}
        
        {evaluationResult && (
          <div>
            <h3>Evaluation Complete!</h3>
            {/* Gunakan komponen baru kita di sini */}
            <ResultDisplay result={evaluationResult} />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
