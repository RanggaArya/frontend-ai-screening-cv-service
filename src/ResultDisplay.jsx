// src/ResultDisplay.jsx

import React from 'react';
import './App.css'; // Kita menggunakan CSS yang sama

// Komponen ini menerima 'result' sebagai prop
const ResultDisplay = ({ result }) => {
  if (!result) {
    return null; // Jangan tampilkan apa-apa jika tidak ada hasil
  }

  // Fungsi untuk mengubah 0.45 menjadi 45%
  const formatMatchRate = (rate) => {
    return `${(rate * 100).toFixed(0)}%`;
  };

  return (
    <div className="result-display">
      <div className="result-section">
        <h4>CV Evaluation</h4>
        <p className="score">
          <strong>Match Rate:</strong> {formatMatchRate(result.cv_match_rate)}
        </p>
        <p className="feedback">{result.cv_feedback}</p>
      </div>

      <div className="result-section">
        <h4>Project Evaluation</h4>
        <p className="score">
          <strong>Score:</strong> {result.project_score.toFixed(2)} / 5.00
        </p>
        <p className="feedback">{result.project_feedback}</p>
      </div>

      <div className="result-section">
        <h4>Overall Summary</h4>
        <p className="feedback">{result.overall_summary}</p>
      </div>
    </div>
  );
};

export default ResultDisplay;