import React, { useState, useEffect, useCallback } from 'react';
import { useTripContext } from '../contexts/useTripContext';
import './Debug.css';

const Debug = () => {
  const { 
    trips, 
    getStorageStats, 
    getAIResponseFiles, 
    reparseItinerary 
  } = useTripContext();
  
  const [storageStats, setStorageStats] = useState(null);
  const [selectedTrip, setSelectedTrip] = useState('');
  const [aiFiles, setAiFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Load storage stats on mount
  useEffect(() => {
    loadStorageStats();
  }, [loadStorageStats]);

  const loadStorageStats = useCallback(async () => {
    try {
      const result = await getStorageStats();
      if (result.success) {
        setStorageStats(result.data);
      }
    } catch (error) {
      console.error('Failed to load storage stats:', error);
    }
  }, [getStorageStats]);

  const loadAIFiles = async (tripId) => {
    if (!tripId) return;
    
    try {
      setLoading(true);
      const result = await getAIResponseFiles(tripId);
      if (result.success) {
        setAiFiles(result.data.files || []);
      }
    } catch (error) {
      console.error('Failed to load AI files:', error);
      setAiFiles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReparseItinerary = async (tripId) => {
    if (!tripId) return;
    
    try {
      setLoading(true);
      setMessage('Reparsing itinerary from stored file...');
      
      const result = await reparseItinerary(tripId);
      if (result.success) {
        setMessage('✅ Itinerary reparsed successfully!');
        await loadAIFiles(tripId); // Refresh file list
      } else {
        setMessage(`❌ Failed to reparse: ${result.error}`);
      }
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
      // Clear message after 3 seconds
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleTripSelect = (tripId) => {
    setSelectedTrip(tripId);
    loadAIFiles(tripId);
  };

  return (
    <div className="debug-panel">
      <h2>🔧 File Storage Debug Panel</h2>
      
      {/* Storage Statistics */}
      <div className="debug-section">
        <h3>📊 Storage Statistics</h3>
        {storageStats ? (
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">Total Files:</span>
              <span className="stat-value">{storageStats.totalFiles}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Total Size:</span>
              <span className="stat-value">{storageStats.totalSizeMB} MB</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Storage Directory:</span>
              <span className="stat-value small">{storageStats.storageDir}</span>
            </div>
          </div>
        ) : (
          <p>Loading storage stats...</p>
        )}
        <button onClick={loadStorageStats} className="btn-secondary">
          🔄 Refresh Stats
        </button>
      </div>

      {/* Trip Selection */}
      <div className="debug-section">
        <h3>🗂️ Trip Files</h3>
        <div className="trip-selector">
          <label htmlFor="trip-select">Select a trip:</label>
          <select 
            id="trip-select"
            value={selectedTrip} 
            onChange={(e) => handleTripSelect(e.target.value)}
            className="select-input"
          >
            <option value="">-- Select Trip --</option>
            {trips.map(trip => (
              <option key={trip._id} value={trip._id}>
                {trip.title} ({trip.destination?.name || 'Unknown'})
              </option>
            ))}
          </select>
        </div>

        {selectedTrip && (
          <div className="trip-actions">
            <button 
              onClick={() => handleReparseItinerary(selectedTrip)}
              disabled={loading}
              className="btn-primary"
            >
              {loading ? '⏳ Reparsing...' : '🔄 Reparse Itinerary'}
            </button>
          </div>
        )}

        {message && (
          <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}
      </div>

      {/* AI Files List */}
      {selectedTrip && (
        <div className="debug-section">
          <h3>📁 AI Response Files</h3>
          {loading ? (
            <p>Loading files...</p>
          ) : aiFiles.length > 0 ? (
            <div className="files-list">
              {aiFiles.map((file, index) => (
                <div key={index} className="file-item">
                  <span className="file-name">{file}</span>
                  <span className="file-info">
                    {file.includes('itinerary') ? '📋 Itinerary' : '💡 Tips'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p>No AI response files found for this trip.</p>
          )}
        </div>
      )}

      {/* Instructions */}
      <div className="debug-section">
        <h3>ℹ️ How to Test</h3>
        <ol className="instructions">
          <li>Create a new trip using the AI generator</li>
          <li>Select the trip from the dropdown above</li>
          <li>View the AI response files that were created</li>
          <li>Use "Reparse Itinerary" to reprocess the stored AI response</li>
          <li>Check that the itinerary is correctly parsed and displayed</li>
        </ol>
      </div>
    </div>
  );
};

export default Debug;
